from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.app.db.session import get_db
from backend.app.models.reconciliation import AuditLog
from backend.app.core.rbac import get_current_user, require_permission, Role, mask_sensitive_value, DemoUser

router = APIRouter(prefix="/api/audit", tags=["Audit & Traceability"])

@router.get("/logs")
def get_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_view_audit_logs"))
):
    query = db.query(AuditLog)

    # Role-based record level filtering for audit logs
    if user.role == Role.RECOVERY_OPERATOR:
        query = query.filter(AuditLog.action.in_([
            "DIAGNOSIS_TRIGGERED", "INTERVENTION_SELECTED", "RECOVERY_ACTION_EXECUTED",
            "RECOVERY_CASE_CREATED", "RISK_DETECTED_FROM_EXCEPTION", "EXCEPTION_INVESTIGATED"
        ]))
    elif user.role == Role.RECOVERY_MANAGER:
        query = query.filter(AuditLog.action.in_([
            "APPROVAL_GRANTED", "APPROVAL_REJECTED", "RECOVERY_ACTION_EXECUTED",
            "RECOVERY_POLICY_SIMULATED", "POLICY_SIMULATED", "BATCH_COMPLETED", "ACCESS_DENIED"
        ]))
    # RECOVERY_ADMIN sees all system-wide audit events


    if action:
        query = query.filter(AuditLog.action == action)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    logs = query.order_by(desc(AuditLog.created_at)).limit(limit).all()

    results = []
    for log in logs:
        entity_id_val = log.entity_id

        results.append({

            "id": log.id,
            "entity_type": log.entity_type,
            "entity_id": entity_id_val,
            "action": log.action,
            "actor": log.actor,
            "decision": log.decision,
            "reason": log.reason,
            "created_at": log.created_at.isoformat(),
            "metadata": log.metadata_json or {}
        })

    return {
        "role": user.role.value,
        "count": len(results),
        "logs": results
    }
