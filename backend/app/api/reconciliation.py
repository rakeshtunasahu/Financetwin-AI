import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ReconciliationRun, ReconciliationMatch
from backend.app.models.entities import SettlementBatch
from backend.app.schemas.reconciliation import ReconciliationRunSchema, ReconciliationMatchSchema
from backend.app.schemas.payload import ReconciliationRunResponse
from backend.app.services.batch_matcher import run_reconciliation as execute_reconciliation
from backend.app.services.audit_service import log_action
from backend.app.policies.default_policy import get_active_policy
from backend.app.core.rbac import (
    get_current_user,
    require_permission,
    Role,
    DemoUser,
    mask_sensitive_value
)

router = APIRouter(prefix="/api/reconciliation", tags=["Reconciliation"])

@router.post("/run", response_model=ReconciliationRunResponse)
def trigger_reconciliation(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_run_reconciliation"))
):
    # Create unique run ID
    run_id = f"RUN_{uuid.uuid4().hex[:8].upper()}"
    policy = get_active_policy()
    try:
        run = execute_reconciliation(db, run_id, policy)
        
        # Log reconciliation action to audit trail
        log_action(
            db=db,
            entity_type="ReconciliationRun",
            entity_id=run.run_id,
            action="RECONCILIATION_TRIGGERED",
            actor=f"{user.name} ({user.email})",
            decision="COMPLETED",
            reason=f"Batch execution completed by {user.role.value}.",
            metadata_json={
                "total_settlements": run.total_settlements,
                "matched_count": run.matched_count,
                "abstained_count": run.abstained_count,
                "exception_count": run.exception_count
            }
        )

        return ReconciliationRunResponse(
            run_id=run.run_id,
            status="COMPLETED",
            total_settlements=run.total_settlements,
            matched_count=run.matched_count,
            abstained_count=run.abstained_count,
            exception_count=run.exception_count,
            started_at=run.started_at.isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reconciliation run failed: {str(e)}")

@router.get("/runs/{run_id}", response_model=ReconciliationRunSchema)
def get_run_details(
    run_id: str,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_view_dashboard"))
):
    run = db.query(ReconciliationRun).filter(ReconciliationRun.run_id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Reconciliation run not found")
    return run

@router.get("/matches", response_model=List[ReconciliationMatchSchema])
def list_matches(
    decision: Optional[str] = None,
    match_type: Optional[str] = None,
    minimum_confidence: Optional[float] = None,
    run_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    query = db.query(ReconciliationMatch)

    if run_id:
        query = query.join(ReconciliationRun).filter(ReconciliationRun.run_id == run_id)
    if decision:
        query = query.filter(ReconciliationMatch.decision == decision)
    if match_type:
        query = query.filter(ReconciliationMatch.match_type == match_type)
    if minimum_confidence is not None:
        query = query.filter(ReconciliationMatch.confidence >= minimum_confidence)

    # -------------------------------------------------------------
    # Record-Level Filtering per Role
    # -------------------------------------------------------------
    if user.role == Role.RECOVERY_MANAGER:
        # Managers prioritize high-value settlements and exception/abstain cases
        policy = get_active_policy()
        high_val_thresh = policy.get("high_value_transaction_threshold", 50000.0)
        query = query.join(SettlementBatch).filter(
            (SettlementBatch.net_amount >= high_val_thresh) |
            (ReconciliationMatch.decision.in_(["ABSTAIN", "EXCEPTION", "NO_MATCH"]))
        )
    # RECOVERY_OPERATOR and RECOVERY_ADMIN see relevant matching records

    matches = query.all()
    return matches

