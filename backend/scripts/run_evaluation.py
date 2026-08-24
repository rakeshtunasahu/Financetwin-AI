import os
import sys

# Add backend to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.services.data_loader import load_all_csvs
from app.services.batch_matcher import run_reconciliation
from app.services.evaluation_service import evaluate_run

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    print("Step 1: Initializing Database Schema...")
    init_db()
    
    db = SessionLocal()
    try:
        print("Step 2: Loading synthetic CSV datasets...")
        load_all_csvs(db, base_path)
        
        print("Step 3: Running Reconciliation matching engine...")
        run = run_reconciliation(db, "RUN_CLI_EVALUATION")
        print(f"Reconciliation Run Complete. ID: {run.run_id}")
        print(f"  Matched:   {run.matched_count}")
        print(f"  Abstained: {run.abstained_count}")
        print(f"  Exceptions: {run.exception_count}")
        
        print("\nStep 4: Evaluating metrics against hidden ground truth...")
        metrics = evaluate_run(db, run.id, base_path)
        
        if "error" in metrics:
            print(f"Error: {metrics['error']}")
            return
            
        print("=" * 50)
        print("        FINANCETWIN AI - ACCURACY METRICS")
        print("=" * 50)
        print(f"Total Settlement Batches:   {metrics['total_settlements']}")
        print(f"Predicted Matches:          {metrics['predicted_matches']}")
        print(f"Correct Matches:            {metrics['correct_matches']}")
        print(f"Actual Matchable Cases:     {metrics['actual_matchable_cases']}")
        print("-" * 50)
        
        precision_str = f"{metrics['precision'] * 100:.2f}%" if metrics['precision'] is not None else "N/A"
        fmr_str = f"{metrics['false_match_rate'] * 100:.2f}%" if metrics['false_match_rate'] is not None else "N/A (0 predicted matches)"
        
        print(f"Precision (PPV):            {precision_str}")
        print(f"Recall (Sensitivity):       {metrics['recall'] * 100:.2f}%")
        print(f"False Match Rate (FMR):     {fmr_str}")
        print(f"Coverage (Reconciliation):  {metrics['coverage'] * 100:.2f}%")
        print(f"Exception Recall:           {metrics['exception_recall'] * 100:.2f}%")
        print(f"Auto-Resolution Accuracy:   {metrics['auto_resolve_accuracy'] * 100:.2f}%")
        print("=" * 50)
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
