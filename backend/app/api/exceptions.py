from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ExceptionRecord, ReconciliationMatch, AIInvestigation, AuditLog
from backend.app.schemas.reconciliation import ExceptionRecordSchema
from backend.app.ai.investigator import investigate_exception

router = APIRouter(prefix="/api/exceptions", tags=["Exceptions"])

@router.get("", response_model=List[ExceptionRecordSchema])
def list_exceptions(
    exception_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExceptionRecord)
    
    if exception_type:
        query = query.filter(ExceptionRecord.exception_type == exception_type)
    if severity:
        query = query.filter(ExceptionRecord.severity == severity)
    if status:
        query = query.filter(ExceptionRecord.status == status)
        
    return query.all()

@router.get("/{exception_id}")
def get_exception_detail(exception_id: str, db: Session = Depends(get_db)):
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
            "merchant_id": exc.settlement_batch.merchant_id,
            "gross_amount": exc.settlement_batch.gross_amount,
            "net_amount": exc.settlement_batch.net_amount,
            "utr": exc.settlement_batch.utr,
            "settlement_date": exc.settlement_batch.settlement_date.strftime("%Y-%m-%d"),
            "expected_credit_date": exc.settlement_batch.expected_credit_date.strftime("%Y-%m-%d"),
        } if exc.settlement_batch else None,
        "bank_transaction": {
            "bank_transaction_id": exc.bank_transaction.bank_transaction_id,
            "reference": exc.bank_transaction.reference,
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
def run_exception_investigation(exception_id: str, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.exception_id == exception_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
        
    try:
        inv = investigate_exception(db, exc)
        return inv.output_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI investigation failed: {str(e)}")
