import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.base import Base
from backend.app.services.data_loader import load_all_csvs
from backend.app.services.batch_matcher import run_reconciliation
from backend.app.services.evaluation_service import evaluate_run

def test_reconciliation_accuracy_metrics():
    # Base path of backend directory
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Use temporary SQLite file for testing
    test_db_url = "sqlite:///./test_reconciliation.db"
    engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        # 1. Load synthetic CSV data
        load_all_csvs(db, base_path)
        
        # 2. Run reconciliation cycle
        run = run_reconciliation(db, "RUN_TEST_ACCURACY")
        
        # 3. Evaluate results
        metrics = evaluate_run(db, run.id, base_path)
        
        assert "error" not in metrics
        assert metrics["total_settlements"] > 0
        assert metrics["predicted_matches"] > 0
        assert metrics["coverage"] > 0.0
        assert metrics["recall"] > 0.0
        assert metrics["exception_recall"] > 0.0
        
        assert metrics["precision"] is not None
        assert metrics["false_match_rate"] is not None
        # Sum of precision and false match rate should equal 1.0 (exact complement)
        assert round(float(metrics["precision"] + metrics["false_match_rate"]), 4) == 1.0
        
    finally:
        db.close()
        # Clean up database file
        if os.path.exists("./test_reconciliation.db"):
            try:
                os.remove("./test_reconciliation.db")
            except Exception:
                pass
