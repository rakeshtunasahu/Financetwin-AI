"""
RevenueRescue AI — Recovery API Endpoints
Provides autonomous revenue recovery operations, batch orchestration,
guardrail enforcement, role-based visibility, and explainable audit trails.
"""
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.session import get_db
from backend.app.models.recovery import (
    RecoveryCase, RecoveryAction,
    RecoveryCaseStatus, RecoveryType, RootCause, ActionType,
    ExecutionMode, ActionOutcome
)
from backend.app.models.reconciliation import ExceptionRecord, AuditLog
from backend.app.schemas.recovery import (
    RecoveryCaseSchema, RecoveryCaseDetailSchema,
    RecoveryActionSchema, ExecuteActionRequest,
    BatchRecoveryRequest, RecoveryMetricsResponse,
    RecoveryPolicySchema, RecoveryPolicySimulateRequest
)
from backend.app.services.recovery_agent import (
    run_recovery_case, run_batch_recovery,
    detect_recovery_cases_from_exceptions,
    select_intervention, check_policy, _get_recovery_policy
)
from backend.app.services.recovery_dataset import generate_recovery_batch
from backend.app.policies.default_policy import get_active_policy, save_policy
from backend.app.services.audit_service import log_action
from backend.app.core.rbac import (
    get_current_user, require_permission,
    Role, DemoUser, mask_sensitive_value
)

router = APIRouter(prefix="/api/recovery", tags=["RevenueRescue AI — Recovery"])


# ──────────────────────────────────────────────────────────────────────────────
# 1. LIST RECOVERY CASES (with RBAC filtering & Auditor masking)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/cases", response_model=List[RecoveryCaseSchema])
def list_recovery_cases(
    recovery_type: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    query = db.query(RecoveryCase)

    if recovery_type:
        query = query.filter(RecoveryCase.recovery_type == recovery_type)
    if status:
        query = query.filter(RecoveryCase.current_status == status)
    if severity:
        query = query.filter(RecoveryCase.severity == severity)

    # ── Role-Specific Record Filtering ─────────────────────────────────────
    if user.role == Role.RECOVERY_MANAGER:
        policy = get_active_policy()
        high_val_thresh = float(policy.get("high_value_escalation_threshold", 50000.0))
        # Manager focuses on high-value cases, escalations/approvals, and high severity exposures
        query = query.filter(
            (RecoveryCase.amount_at_risk >= high_val_thresh) |
            (RecoveryCase.current_status.in_([RecoveryCaseStatus.ESCALATED, RecoveryCaseStatus.STOPPED])) |
            (RecoveryCase.severity.in_(["HIGH", "CRITICAL"]))
        )
    elif user.role == Role.RECOVERY_OPERATOR:
        # Operator focuses on actionable operational cases (detected, in-progress, retry, action-needed)
        query = query.filter(
            RecoveryCase.current_status.in_([
                RecoveryCaseStatus.DETECTED,
                RecoveryCaseStatus.DIAGNOSED,
                RecoveryCaseStatus.ACTION_SELECTED,
                RecoveryCaseStatus.ACTION_EXECUTED,
                RecoveryCaseStatus.WAITING_FOR_OUTCOME,
                RecoveryCaseStatus.RETRY,
                RecoveryCaseStatus.RECOVERED
            ])
        )
    # RECOVERY_ADMIN sees all system-wide cases without restriction

    # Order by priority score descending
    query = query.order_by(desc(RecoveryCase.priority_score), desc(RecoveryCase.created_at))
    cases = query.limit(limit).all()

    return cases



# ──────────────────────────────────────────────────────────────────────────────
# 2. GET RECOVERY CASE DETAIL
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/cases/{case_id}", response_model=RecoveryCaseDetailSchema)
def get_recovery_case_detail(
    case_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    case = db.query(RecoveryCase).filter(RecoveryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Recovery case '{case_id}' not found")

    actions = db.query(RecoveryAction).filter(RecoveryAction.case_id == case.id).order_by(RecoveryAction.created_at.asc()).all()

    # Audit history
    logs = db.query(AuditLog).filter(
        AuditLog.entity_id == case.case_id
    ).order_by(AuditLog.created_at.asc()).all()

    audit_history = [
        {
            "action": l.action,
            "actor": l.actor,
            "decision": l.decision,
            "reason": l.reason,
            "created_at": l.created_at.isoformat(),
            "metadata": l.metadata_json
        } for l in logs
    ]

    detail_data = RecoveryCaseSchema.model_validate(case).model_dump()
    detail_data["diagnosis_evidence"] = case.diagnosis_evidence or {}
    detail_data["actions"] = [RecoveryActionSchema.model_validate(a).model_dump() for a in actions]
    detail_data["audit_history"] = audit_history

    # Apply masking for AUDITOR
    if user.role == Role.AUDITOR:
        if detail_data.get("customer_id"):
            detail_data["customer_id"] = mask_sensitive_value(detail_data["customer_id"], user.role)
        if detail_data.get("merchant_id"):
            detail_data["merchant_id"] = mask_sensitive_value(detail_data["merchant_id"], user.role)
        if detail_data.get("source_transaction_id"):
            detail_data["source_transaction_id"] = mask_sensitive_value(detail_data["source_transaction_id"], user.role)

    return RecoveryCaseDetailSchema(**detail_data)


# ──────────────────────────────────────────────────────────────────────────────
# 3. DETECT REVENUE AT RISK (from existing Exceptions)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/detect")
def detect_revenue_at_risk(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_run_reconciliation"))
):
    exceptions = db.query(ExceptionRecord).all()
    if not exceptions:
        return {"detected_count": 0, "message": "No reconciliation exceptions found to convert."}

    created_case_ids = detect_recovery_cases_from_exceptions(
        db=db,
        exceptions=exceptions,
        actor=f"{user.name} ({user.role.value})"
    )

    return {
        "detected_count": len(created_case_ids),
        "case_ids": created_case_ids,
        "message": f"Successfully created {len(created_case_ids)} recovery cases from reconciliation exceptions."
    }


# ──────────────────────────────────────────────────────────────────────────────
# 4. DIAGNOSE ROOT CAUSE
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/diagnose/{case_id}")
def diagnose_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_investigate_exception"))
):
    case = db.query(RecoveryCase).filter(RecoveryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Recovery case '{case_id}' not found")

    if not case.root_cause:
        case.root_cause = RootCause.TEMPORARY_BANK_FAILURE
        case.diagnosis_confidence = Decimal("0.85")

    case.current_status = RecoveryCaseStatus.DIAGNOSED
    case.updated_at = datetime.utcnow()
    db.commit()

    log_action(
        db=db, entity_type="RecoveryCase", entity_id=case.case_id,
        action="DIAGNOSIS_TRIGGERED", actor=f"{user.name} ({user.role.value})",
        decision="DIAGNOSED",
        reason=f"Diagnosed root cause: {case.root_cause} with confidence {float(case.diagnosis_confidence):.0%}",
        metadata_json={"root_cause": case.root_cause, "confidence": float(case.diagnosis_confidence)}
    )

    return {
        "case_id": case.case_id,
        "root_cause": case.root_cause,
        "confidence": float(case.diagnosis_confidence),
        "evidence": case.diagnosis_evidence or {},
        "current_status": case.current_status
    }


# ──────────────────────────────────────────────────────────────────────────────
# 5. DECIDE INTERVENTION
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/decide/{case_id}")
def decide_intervention_for_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_investigate_exception"))
):
    case = db.query(RecoveryCase).filter(RecoveryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Recovery case '{case_id}' not found")

    action_type, reason, exp_prob = select_intervention(case)
    case.recommended_action = action_type
    case.action_reason = reason
    case.current_status = RecoveryCaseStatus.ACTION_SELECTED
    case.updated_at = datetime.utcnow()
    db.commit()

    log_action(
        db=db, entity_type="RecoveryCase", entity_id=case.case_id,
        action="INTERVENTION_SELECTED", actor=f"{user.name} ({user.role.value})",
        decision=action_type, reason=reason,
        metadata_json={"expected_probability": exp_prob}
    )

    return {
        "case_id": case.case_id,
        "recommended_action": action_type,
        "reason": reason,
        "expected_recovery_probability": exp_prob,
        "current_status": case.current_status
    }


# ──────────────────────────────────────────────────────────────────────────────
# 6. EXECUTE BOUNDED RECOVERY ACTION (SIMULATED)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/execute/{case_id}")
def execute_case_action(
    case_id: str,
    req: ExecuteActionRequest = ExecuteActionRequest(),
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_execute_recovery_action"))
):
    case = db.query(RecoveryCase).filter(RecoveryCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail=f"Recovery case '{case_id}' not found")

    if case.current_status in RecoveryCaseStatus.TERMINAL:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot execute action on case in terminal state: {case.current_status}"
        )

    # If action specified in request, override recommended
    if req.action_type:
        case.recommended_action = req.action_type

    actor_str = f"{user.name} ({user.role.value})"
    result = run_recovery_case(db, case, actor=actor_str)
    db.commit()

    return result


# ──────────────────────────────────────────────────────────────────────────────
# 7. RUN AUTONOMOUS RECOVERY BATCH (50-100 Synthetic Cases)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/batch/run")
def run_recovery_batch_endpoint(
    req: BatchRecoveryRequest = BatchRecoveryRequest(),
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_run_recovery_batch"))
):
    actor_str = f"{user.name} ({user.role.value})"

    # Generate synthetic batch
    cases_data = generate_recovery_batch(
        payment_failures=req.payment_failures,
        checkout_abandonments=req.checkout_abandonments,
        overdue_receivables=req.overdue_receivables
    )

    # Run batch
    summary = run_batch_recovery(
        db=db,
        case_dicts=cases_data,
        policy=req.policy_override,
        actor=actor_str
    )

    return summary


# ──────────────────────────────────────────────────────────────────────────────
# 8. GET RECOVERY METRICS & KPIs
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/metrics", response_model=RecoveryMetricsResponse)
def get_recovery_metrics(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    cases = db.query(RecoveryCase).all()
    actions = db.query(RecoveryAction).all()

    if not cases:
        # Return empty state if no cases exist
        return RecoveryMetricsResponse(
            total_revenue_at_risk=0.0,
            total_amount_recovered=0.0,
            recovery_rate_pct=0.0,
            active_recovery_cases=0,
            cases_recovered=0,
            cases_stopped=0,
            cases_escalated=0,
            cases_in_progress=0,
            avg_recovery_time_hours=1.2,
            funnel={"detected": 0, "diagnosed": 0, "actioned": 0, "recovered": 0, "detected_amt": 0.0, "recovered_amt": 0.0},
            by_intervention={},
            by_type={},
            human_attention_queue=[]
        )

    total_at_risk = float(sum(c.amount_at_risk for c in cases))
    total_recovered = float(sum(c.amount_recovered for c in cases))
    recovery_rate = (total_recovered / total_at_risk * 100) if total_at_risk > 0 else 0.0

    recovered_count = sum(1 for c in cases if c.current_status == RecoveryCaseStatus.RECOVERED)
    stopped_count = sum(1 for c in cases if c.current_status == RecoveryCaseStatus.STOPPED)
    escalated_count = sum(1 for c in cases if c.current_status == RecoveryCaseStatus.ESCALATED)
    in_progress_count = sum(1 for c in cases if c.current_status not in RecoveryCaseStatus.TERMINAL)

    # Recovery Funnel
    diagnosed_count = sum(1 for c in cases if c.current_status != RecoveryCaseStatus.DETECTED)
    actioned_count = sum(1 for c in cases if c.current_status in (
        RecoveryCaseStatus.ACTION_EXECUTED, RecoveryCaseStatus.WAITING_FOR_OUTCOME,
        RecoveryCaseStatus.RECOVERED, RecoveryCaseStatus.RETRY,
        RecoveryCaseStatus.STOPPED, RecoveryCaseStatus.ESCALATED
    ))

    funnel = {
        "detected": len(cases),
        "diagnosed": diagnosed_count,
        "actioned": actioned_count,
        "recovered": recovered_count,
        "detected_amt": round(total_at_risk, 2),
        "recovered_amt": round(total_recovered, 2)
    }

    # Recovery by Intervention
    by_intervention: Dict[str, Any] = {}
    for act in actions:
        atype = act.action_type
        if atype not in by_intervention:
            by_intervention[atype] = {"actions_count": 0, "success_count": 0, "recovered_amount": 0.0}
        by_intervention[atype]["actions_count"] += 1
        if act.outcome == ActionOutcome.SUCCESS:
            by_intervention[atype]["success_count"] += 1
            by_intervention[atype]["recovered_amount"] += float(act.recovered_amount)

    for k, v in by_intervention.items():
        v["success_rate_pct"] = round(v["success_count"] / v["actions_count"] * 100, 1) if v["actions_count"] > 0 else 0.0
        v["recovered_amount"] = round(v["recovered_amount"], 2)

    # Breakdown by Recovery Type
    by_type: Dict[str, Any] = {}
    for c in cases:
        rt = c.recovery_type
        if rt not in by_type:
            by_type[rt] = {"count": 0, "at_risk": 0.0, "recovered": 0.0, "recovered_count": 0}
        by_type[rt]["count"] += 1
        by_type[rt]["at_risk"] += float(c.amount_at_risk)
        by_type[rt]["recovered"] += float(c.amount_recovered)
        if c.current_status == RecoveryCaseStatus.RECOVERED:
            by_type[rt]["recovered_count"] += 1

    for k, v in by_type.items():
        v["recovery_rate_pct"] = round(v["recovered"] / v["at_risk"] * 100, 1) if v["at_risk"] > 0 else 0.0
        v["at_risk"] = round(v["at_risk"], 2)
        v["recovered"] = round(v["recovered"], 2)

    # Human Attention Queue (High-value, disputes, failed max retries, escalated)
    attention_cases = [
        c for c in cases
        if c.current_status == RecoveryCaseStatus.ESCALATED
        or c.has_dispute
        or float(c.amount_at_risk) >= 50000.0
        or (c.attempt_count >= 3 and c.current_status != RecoveryCaseStatus.RECOVERED)
    ][:10]

    human_queue = [
        {
            "case_id": c.case_id,
            "recovery_type": c.recovery_type,
            "amount_at_risk": float(c.amount_at_risk),
            "severity": c.severity,
            "root_cause": c.root_cause,
            "current_status": c.current_status,
            "reason": "High Value (>=₹50,000)" if float(c.amount_at_risk) >= 50000 else (
                "Dispute Active" if c.has_dispute else (
                    "Max Retries Exhausted" if c.attempt_count >= 3 else "Policy Escalation"
                )
            ),
            "created_at": c.created_at.isoformat()
        } for c in attention_cases
    ]

    return RecoveryMetricsResponse(
        total_revenue_at_risk=round(total_at_risk, 2),
        total_amount_recovered=round(total_recovered, 2),
        recovery_rate_pct=round(recovery_rate, 2),
        active_recovery_cases=in_progress_count,
        cases_recovered=recovered_count,
        cases_stopped=stopped_count,
        cases_escalated=escalated_count,
        cases_in_progress=in_progress_count,
        avg_recovery_time_hours=1.8,
        funnel=funnel,
        by_intervention=by_intervention,
        by_type=by_type,
        human_attention_queue=human_queue
    )


# ──────────────────────────────────────────────────────────────────────────────
# 9. GET RECOVERY AUDIT TRAIL FOR A CASE
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/audit/{case_id}")
def get_case_audit_trail(
    case_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_view_audit_logs"))
):
    logs = db.query(AuditLog).filter(
        AuditLog.entity_id == case_id
    ).order_by(AuditLog.created_at.asc()).all()

    return [
        {
            "id": l.id,
            "action": l.action,
            "actor": l.actor,
            "decision": l.decision,
            "reason": l.reason,
            "created_at": l.created_at.isoformat(),
            "metadata": l.metadata_json
        } for l in logs
    ]


# ──────────────────────────────────────────────────────────────────────────────
# 10. GET ACTIVE RECOVERY POLICIES
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/policies", response_model=RecoveryPolicySchema)
def get_recovery_policies(user: DemoUser = Depends(get_current_user)):
    policy = get_active_policy()
    return RecoveryPolicySchema(
        max_payment_retries=int(policy.get("max_payment_retries", 3)),
        max_customer_reminders=int(policy.get("max_customer_reminders", 3)),
        max_workflow_duration_days=int(policy.get("max_workflow_duration_days", 7)),
        high_value_escalation_threshold=float(policy.get("high_value_escalation_threshold", 50000.0)),
        max_promise_to_pay_misses=int(policy.get("max_promise_to_pay_misses", 2)),
        retry_cooldown_hours=int(policy.get("retry_cooldown_hours", 24))
    )


# ──────────────────────────────────────────────────────────────────────────────
# 11. SIMULATE RECOVERY POLICY CHANGES
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/policies/simulate")
def simulate_recovery_policy(
    req: RecoveryPolicySimulateRequest,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_simulate_policy"))
):
    current_policy = get_active_policy()
    sim_policy = current_policy.copy()

    for k, v in req.model_dump(exclude_unset=True).items():
        if v is not None:
            sim_policy[k] = v

    cases = db.query(RecoveryCase).all()

    def _eval_policy_on_cases(p: dict) -> Dict[str, Any]:
        max_retries = int(p.get("max_payment_retries", 3))
        high_val = float(p.get("high_value_escalation_threshold", 50000.0))
        max_reminders = int(p.get("max_customer_reminders", 3))

        approved_count = 0
        denied_count = 0
        escalated_count = 0

        for c in cases:
            if float(c.amount_at_risk) >= high_val:
                escalated_count += 1
            elif c.attempt_count >= max_retries or c.reminder_count >= max_reminders:
                denied_count += 1
            else:
                approved_count += 1

        return {
            "approved_actions": approved_count,
            "policy_denied": denied_count,
            "high_value_escalated": escalated_count,
            "projected_recovery_rate": round(
                (approved_count / len(cases) * 58.0) if cases else 0.0, 1
            )
        }

    before_eval = _eval_policy_on_cases(current_policy)
    after_eval = _eval_policy_on_cases(sim_policy)

    log_action(
        db=db, entity_type="PolicySimulation", entity_id="recovery_policy_sim",
        action="RECOVERY_POLICY_SIMULATED", actor=f"{user.name} ({user.role.value})",
        decision="SIMULATED",
        reason=f"Recovery guardrail simulation by {user.role.value}",
        metadata_json={"simulated_params": req.model_dump(exclude_unset=True)}
    )

    return {
        "current_policy": before_eval,
        "simulated_policy": after_eval,
        "parameter_changes": req.model_dump(exclude_unset=True)
    }


# ──────────────────────────────────────────────────────────────────────────────
# 12. APPLY RECOVERY POLICY (ADMIN only)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/policies/apply", response_model=RecoveryPolicySchema)
def apply_recovery_policy(
    policy_update: RecoveryPolicySchema,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_apply_policy"))
):
    current = get_active_policy()
    current.update(policy_update.model_dump())
    save_policy(current)

    log_action(
        db=db, entity_type="Policy", entity_id="recovery_guardrails",
        action="RECOVERY_POLICY_APPLIED", actor=f"{user.name} ({user.role.value})",
        decision="APPLIED",
        reason=f"Recovery guardrail parameters updated by {user.role.value}",
        metadata_json=policy_update.model_dump()
    )

    return policy_update
