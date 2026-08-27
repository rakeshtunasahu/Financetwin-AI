import os
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ReconciliationRun, ExceptionRecord, AuditLog
from backend.app.services.evaluation_service import evaluate_run
from backend.app.services.ml_clustering import run_anomaly_detection_and_clustering
from backend.app.schemas.dashboard import DashboardSummarySchema
from backend.app.utils.money import to_decimal
from backend.app.core.rbac import (
    get_current_user,
    require_permission,
    Role,
    DemoUser
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummarySchema)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(require_permission("can_view_dashboard"))
):
    # Retrieve the most recent reconciliation run
    latest_run = db.query(ReconciliationRun).order_by(ReconciliationRun.created_at.desc()).first()
    if not latest_run:
        return DashboardSummarySchema(
            total_settlements=0,
            matched_count=0,
            abstained_count=0,
            no_match_count=0,
            exception_count=0,
            match_rate=0.0,
            precision=None,
            recall=0.0,
            false_match_rate=None,
            coverage=0.0,
            auto_resolution_rate=0.0,
            financial_amount_at_risk=0.0
        )
        
    # Perform precision/recall/FMR calculations against ground truth
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    eval_res = evaluate_run(db, latest_run.id, base_path)
    
    exceptions = db.query(ExceptionRecord).filter(ExceptionRecord.reconciliation_run_id == latest_run.id).all()
    exc_ids = [exc.exception_id for exc in exceptions]
    
    # Auto resolution statistics
    auto_resolve_count = db.query(AuditLog).filter(
        AuditLog.action == "EXCEPTION_CREATED",
        AuditLog.entity_id.in_(exc_ids),
        AuditLog.decision == "AUTO_RESOLVE"
    ).count() if exc_ids else 0
    
    auto_resolution_rate = float(auto_resolve_count) / len(exceptions) if exceptions else 0.0
    
    # Financial amount at risk (all exceptions requiring MANUAL_REVIEW)
    manual_review_logs = db.query(AuditLog).filter(
        AuditLog.action == "EXCEPTION_CREATED",
        AuditLog.entity_id.in_(exc_ids),
        AuditLog.decision == "MANUAL_REVIEW"
    ).all() if exc_ids else []
    
    manual_review_exc_ids = [log.entity_id for log in manual_review_logs]
    
    amount_at_risk = float(sum(
        to_decimal(exc.expected_amount) for exc in exceptions if exc.exception_id in manual_review_exc_ids
    ))
    
    match_rate = float(latest_run.matched_count) / latest_run.total_settlements if latest_run.total_settlements > 0 else 0.0
    no_match_count = latest_run.total_settlements - latest_run.matched_count - latest_run.abstained_count - latest_run.exception_count
    
    return DashboardSummarySchema(
        total_settlements=latest_run.total_settlements,
        matched_count=latest_run.matched_count,
        abstained_count=latest_run.abstained_count,
        no_match_count=max(0, no_match_count),
        exception_count=latest_run.exception_count,
        match_rate=match_rate,
        precision=eval_res.get("precision"),
        recall=eval_res.get("recall", 0.0),
        false_match_rate=eval_res.get("false_match_rate"),
        coverage=eval_res.get("coverage", 0.0),
        auto_resolution_rate=auto_resolution_rate,
        financial_amount_at_risk=amount_at_risk
    )

@router.get("/anomalies")
def get_anomalies(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    exceptions = db.query(ExceptionRecord).all()
    if not exceptions:
        return {"anomaly_count": 0, "total_exceptions": 0, "anomaly_rate": 0.0, "anomalies": []}
        
    ml_results = run_anomaly_detection_and_clustering(exceptions)
    
    anom_count = 0
    anomalies_list = []
    
    for res in ml_results:
        # Match exception record
        exc = next(e for e in exceptions if e.exception_id == res["exception_id"])
        
        # Write anomaly metrics to DB
        exc.anomaly_score = Decimal(f"{res['anomaly_score']:.4f}")
        exc.cluster_id = res["cluster_id"]
        
        if res["anomaly_flag"] == 1:
            anom_count += 1
            
        anomalies_list.append({
            "exception_id": exc.exception_id,
            "exception_type": exc.exception_type,
            "severity": exc.severity,
            "expected_amount": float(exc.expected_amount),
            "actual_amount": float(exc.actual_amount),
            "variance": float(exc.variance),
            "anomaly_score": res["anomaly_score"],
            "anomaly_flag": res["anomaly_flag"],
            "cluster_id": exc.cluster_id
        })
        
    db.commit()
    
    return {
        "anomaly_count": anom_count,
        "total_exceptions": len(exceptions),
        "anomaly_rate": float(anom_count) / len(exceptions) if exceptions else 0.0,
        "anomalies": anomalies_list
    }

@router.get("/clusters")
def get_clusters(
    db: Session = Depends(get_db),
    user: DemoUser = Depends(get_current_user)
):
    exceptions = db.query(ExceptionRecord).all()
    if not exceptions:
        return {"cluster_count": 0, "clusters": []}
        
    # Re-run ML clustering
    ml_results = run_anomaly_detection_and_clustering(exceptions)
    
    for res in ml_results:
        exc = next(e for e in exceptions if e.exception_id == res["exception_id"])
        exc.anomaly_score = Decimal(f"{res['anomaly_score']:.4f}")
        exc.cluster_id = res["cluster_id"]
    db.commit()
    
    # Group by cluster ID
    cluster_groups = {}
    for exc in exceptions:
        cid = exc.cluster_id if exc.cluster_id is not None else -1
        if cid not in cluster_groups:
            cluster_groups[cid] = []
        cluster_groups[cid].append(exc)
        
    clusters_list = []
    for cid, group in cluster_groups.items():
        if cid == -1:
            pattern = "DBSCAN Noise (Isolated unique exceptions)"
        else:
            types = set(e.exception_type for e in group)
            severities = set(e.severity for e in group)
            pattern = f"Cluster {cid}: Repeated {', '.join(types)} occurrences ({', '.join(severities)} severity)."
            
        clusters_list.append({
            "cluster_id": cid,
            "size": len(group),
            "pattern": pattern,
            "exceptions": [
                {
                    "exception_id": e.exception_id,
                    "exception_type": e.exception_type,
                    "severity": e.severity,
                    "expected_amount": float(e.expected_amount),
                    "actual_amount": float(e.actual_amount),
                    "variance": float(e.variance)
                } for e in group
            ]
        })
        
    # Keep noise at the bottom
    clusters_list.sort(key=lambda x: x["cluster_id"])
    active_cluster_count = len([c for c in clusters_list if c["cluster_id"] != -1])
    
    return {
        "cluster_count": active_cluster_count,
        "clusters": clusters_list
    }
