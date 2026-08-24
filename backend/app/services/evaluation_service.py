import os
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.models.reconciliation import ReconciliationMatch, ReconciliationRun, ExceptionRecord, AuditLog
from backend.app.models.entities import SettlementBatch
from backend.app.utils.money import to_decimal

def evaluate_run(db: Session, run_id: int, base_path: str) -> dict:
    # 1. Load ground truth CSV
    gt_path = os.path.join(base_path, "data", "evaluation", "ground_truth.csv")
    if not os.path.exists(gt_path):
        return {"error": "Ground truth file not found. Evaluation cannot be performed."}
        
    gt_df = pd.read_csv(gt_path)
    
    # 2. Fetch matcher output for this run
    matches = db.query(ReconciliationMatch).filter(ReconciliationMatch.reconciliation_run_id == run_id).all()
    if not matches:
        return {"error": "No reconciliation match records found for this run."}
        
    pred_map = {}
    for m in matches:
        s_id = m.settlement_batch.settlement_id
        pred_map[s_id] = {
            "decision": m.decision,
            "btx_id": m.bank_transaction.bank_transaction_id if m.bank_transaction else ""
        }
        
    total_settlements = len(gt_df)
    predicted_matches = 0
    correct_matches = 0
    incorrect_matches = 0
    
    actual_matchable_cases = 0
    actual_exceptions = 0
    correctly_detected_exceptions = 0
    
    for _, row in gt_df.iterrows():
        s_id = row["settlement_id"]
        true_btx = row["true_bank_transaction_id"] if not pd.isna(row["true_bank_transaction_id"]) else ""
        true_decision = row["expected_decision"]
        
        pred = pred_map.get(s_id)
        if not pred:
            continue
            
        pred_decision = pred["decision"]
        pred_btx = pred["btx_id"]
        
        if true_decision == "MATCH":
            actual_matchable_cases += 1
            
        if true_decision in ("EXCEPTION", "ABSTAIN", "NO_MATCH"):
            actual_exceptions += 1
            if pred_decision in ("EXCEPTION", "ABSTAIN", "NO_MATCH"):
                correctly_detected_exceptions += 1
                
        if pred_decision == "MATCH":
            predicted_matches += 1
            if true_decision == "MATCH" and pred_btx == true_btx:
                correct_matches += 1
            else:
                incorrect_matches += 1

    precision = float(correct_matches) / predicted_matches if predicted_matches > 0 else None
    recall = float(correct_matches) / actual_matchable_cases if actual_matchable_cases > 0 else 0.0
    false_match_rate = float(incorrect_matches) / predicted_matches if predicted_matches > 0 else None
    coverage = float(predicted_matches) / total_settlements if total_settlements > 0 else 0.0
    exception_recall = float(correctly_detected_exceptions) / actual_exceptions if actual_exceptions > 0 else 0.0
    
    # 3. Calculate Auto-Resolution Accuracy
    # Check ExceptionRecord risk engine recommendations for this run
    exceptions = db.query(ExceptionRecord).filter(ExceptionRecord.reconciliation_run_id == run_id).all()
    exc_ids = [exc.exception_id for exc in exceptions]
    
    # Retrieve audit logs where risk decisions are stored
    logs = db.query(AuditLog).filter(
        AuditLog.action == "EXCEPTION_CREATED",
        AuditLog.entity_id.in_(exc_ids)
    ).all()
    
    auto_resolved_exc_ids = set()
    for log in logs:
        if log.decision == "AUTO_RESOLVE":
            auto_resolved_exc_ids.add(log.entity_id)
            
    total_auto_resolutions = len(auto_resolved_exc_ids)
    correct_auto_resolutions = 0
    
    for exc in exceptions:
        if exc.exception_id in auto_resolved_exc_ids:
            s_id = exc.settlement_batch.settlement_id
            gt_row = gt_df[gt_df["settlement_id"] == s_id]
            if not gt_row.empty:
                true_dec = gt_row.iloc[0]["expected_decision"]
                # Auto-resolving is safe for minor issues that are ultimately matchable (e.g. delays/missing refs)
                if true_dec == "MATCH":
                    correct_auto_resolutions += 1
                    
    auto_resolve_accuracy = (float(correct_auto_resolutions) / total_auto_resolutions) if total_auto_resolutions > 0 else 1.0

    return {
        "precision": precision,
        "recall": recall,
        "false_match_rate": false_match_rate,
        "coverage": coverage,
        "exception_recall": exception_recall,
        "auto_resolve_accuracy": auto_resolve_accuracy,
        "correct_matches": correct_matches,
        "predicted_matches": predicted_matches,
        "actual_matchable_cases": actual_matchable_cases,
        "total_settlements": total_settlements
    }
