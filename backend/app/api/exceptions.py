from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ExceptionRecord, ReconciliationMatch, AIInvestigation, AuditLog
from backend.app.schemas.reconciliation import ExceptionRecordSchema
from backend.app.ai.investigator import investigate_exception
from backend.app.policies.default_policy import get_active_policy
from backend.app.services.audit_service import log_action
from backend.app.core.rbac import (
    get_current_user,
    require_permission,
    Role,
    DemoUser,
    mask_sensitive_value
)

router = APIRouter(prefix="/api/exceptions", tags=["Exceptions"])

@router.get("", response_model=List[ExceptionRecordSchema])
def list_exceptions(
    exception_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    query = db.query(ExceptionRecord)

    if exception_type:
        query = query.filter(ExceptionRecord.exception_type == exception_type)
    if severity:
        query = query.filter(ExceptionRecord.severity == severity)
    if status:
        query = query.filter(ExceptionRecord.status == status)

    # -------------------------------------------------------------
    # Record-Level Filtering per Role
    # -------------------------------------------------------------
    if user.role == Role.RECOVERY_MANAGER:
        policy = get_active_policy()
        high_val_thresh = policy.get("high_value_transaction_threshold", 50000.0)
        query = query.filter(
            (ExceptionRecord.expected_amount >= high_val_thresh) |
            (ExceptionRecord.status.in_(["MANUAL_REVIEW", "UNRESOLVED"])) |
            (ExceptionRecord.severity.in_(["HIGH", "CRITICAL"]))
        )
    # RECOVERY_OPERATOR and RECOVERY_ADMIN see relevant operational exceptions

    exceptions = query.all()
    return exceptions


@router.get("/{exception_id}")
def get_exception_detail(
    exception_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.exception_id == exception_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    # Match explanation candidate scores
    match = db.query(ReconciliationMatch).filter(
        ReconciliationMatch.settlement_batch_id == exc.settlement_batch_id,
        ReconciliationMatch.reconciliation_run_id == exc.reconciliation_run_id
    ).first()

    # Retrieve AI investigation if already run
    ai_inv = db.query(AIInvestigation).filter(AIInvestigation.exception_id == exc.id).first()

    # Audit log timeline
    audit_logs = db.query(AuditLog).filter(
        (AuditLog.entity_id == exc.exception_id) |
        (AuditLog.entity_id == (exc.settlement_batch.settlement_id if exc.settlement_batch else ""))
    ).order_by(AuditLog.created_at.asc()).all()

    # Risk decision parameters
    risk_dec = "MANUAL_REVIEW"
    risk_score = 0.0
    for log in audit_logs:
        if log.action == "EXCEPTION_CREATED":
            risk_dec = log.decision
            risk_score = log.metadata_json.get("risk_score", 0.0)

    utr_val = exc.settlement_batch.utr if exc.settlement_batch else None
    ref_val = exc.bank_transaction.reference if exc.bank_transaction else None
    merchant_val = exc.settlement_batch.merchant_id if exc.settlement_batch else None

    return {

        "exception_id": exc.exception_id,
        "exception_type": exc.exception_type,
        "severity": exc.severity,
        "status": exc.status,
        "expected_amount": exc.expected_amount,
        "actual_amount": exc.actual_amount,
        "variance": exc.variance,
        "anomaly_score": exc.anomaly_score,
        "cluster_id": exc.cluster_id,
        "created_at": exc.created_at,
        "settlement_batch": {
            "settlement_id": exc.settlement_batch.settlement_id,
            "merchant_id": merchant_val,
            "gross_amount": exc.settlement_batch.gross_amount,
            "net_amount": exc.settlement_batch.net_amount,
            "utr": utr_val,
            "settlement_date": exc.settlement_batch.settlement_date.strftime("%Y-%m-%d"),
            "expected_credit_date": exc.settlement_batch.expected_credit_date.strftime("%Y-%m-%d"),
        } if exc.settlement_batch else None,
        "bank_transaction": {
            "bank_transaction_id": exc.bank_transaction.bank_transaction_id,
            "reference": ref_val,
            "credit_amount": exc.bank_transaction.credit_amount,
            "transaction_date": exc.bank_transaction.transaction_date.strftime("%Y-%m-%d"),
            "description": exc.bank_transaction.description,
            "source": exc.bank_transaction.source,
        } if exc.bank_transaction else None,
        "match_details": {
            "match_type": match.match_type if match else "NONE",
            "confidence": float(match.confidence) if match else 0.0,
            "explainability": match.explainability_json if match else {}
        },
        "ai_investigation": ai_inv.output_json if ai_inv else None,
        "audit_history": [
            {
                "action": log.action,
                "actor": log.actor,
                "decision": log.decision,
                "reason": log.reason,
                "created_at": log.created_at.isoformat(),
                "metadata": log.metadata_json
            } for log in audit_logs
        ],
        "risk_decision": {
            "score": risk_score,
            "recommended_action": risk_dec
        }
    }

@router.post("/{exception_id}/investigate")
def run_exception_investigation(
    exception_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_trigger_ai_investigation"))
):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.exception_id == exception_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    try:
        inv = investigate_exception(db, exc)
        
        # Log AI investigation execution in audit log
        log_action(
            db=db,
            entity_type="ExceptionRecord",
            entity_id=exc.exception_id,
            action="EXCEPTION_INVESTIGATED",
            actor=f"{user.name} ({user.email})",
            decision="AI_INVESTIGATED",
            reason=f"AI forensic investigation performed by {user.role.value}.",
            metadata_json={
                "exception_type": exc.exception_type,
                "root_cause": inv.output_json.get("root_cause") if inv.output_json else "",
                "recommended_action": inv.output_json.get("recommended_action") if inv.output_json else ""
            }
        )

        return inv.output_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI investigation failed: {str(e)}")
