from sqlalchemy.orm import Session
from backend.app.models.reconciliation import AuditLog

def log_action(
    db: Session,
    entity_type: str,
    entity_id: str,
    action: str,
    actor: str,
    decision: str,
    reason: str,
    metadata_json: dict = None
) -> AuditLog:
    log = AuditLog(
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        actor=actor,
        decision=decision,
        reason=reason,
        metadata_json=metadata_json or {}
    )
    db.add(log)
    db.commit()
    return log
