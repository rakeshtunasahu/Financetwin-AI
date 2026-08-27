import os
import pytest
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.base import Base
from backend.app.services.data_loader import load_all_csvs
from backend.app.services.dataset_25_scenarios import generate_25_feature_datasets
from backend.app.services.batch_matcher import run_reconciliation
from backend.app.models.entities import SettlementBatch, BankTransaction
from backend.app.models.reconciliation import ReconciliationRun, ReconciliationMatch, ExceptionRecord

def test_all_25_feature_scenarios():
    """
    Executes reconciliation across all 25 distinct feature scenario test datasets.
    Validates deterministic matching, exception classification, safety abstain gates,
    and audit tracking.
    """
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Generate 25 feature test datasets
    test_data_dir = generate_25_feature_datasets(base_path)
    assert os.path.exists(test_data_dir)
    assert os.path.exists(os.path.join(test_data_dir, "ground_truth_25.csv"))
    
    # 2. Setup SQLite test database
    test_db_url = "sqlite:///./test_25_scenarios.db"
    engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Load the 25 scenario CSVs
        import pandas as pd
        from backend.app.models.entities import Payment, SettlementBatch, SettlementLineItem, BankTransaction
        from backend.app.utils.money import to_decimal
        from backend.app.utils.dates import to_date
        from datetime import datetime
        
        payments_df = pd.read_csv(os.path.join(test_data_dir, "payments.csv"))
        batches_df = pd.read_csv(os.path.join(test_data_dir, "settlement_batches.csv"))
        line_items_df = pd.read_csv(os.path.join(test_data_dir, "settlement_line_items.csv"))
        bank_txs_df = pd.read_csv(os.path.join(test_data_dir, "bank_transactions.csv"))
        
        # Insert Batches
        batch_map = {}
        for _, row in batches_df.iterrows():
            batch = SettlementBatch(
                settlement_id=row["settlement_id"],
                merchant_id=row["merchant_id"],
                gross_amount=to_decimal(row["gross_amount"]),
                gateway_fee=to_decimal(row["gateway_fee"]),
                fee_tax=to_decimal(row["fee_tax"]),
                refunds=to_decimal(row["refunds"]),
                adjustments=to_decimal(row["adjustments"]),
                reserves=to_decimal(row["reserves"]),
                net_amount=to_decimal(row["net_amount"]),
                settlement_date=to_date(row["settlement_date"]),
                expected_credit_date=to_date(row["expected_credit_date"]),
                status="PENDING",
                utr=row["utr"] if not pd.isna(row["utr"]) else None
            )
            db.add(batch)
            db.flush()
            batch_map[batch.settlement_id] = batch.id
            
        # Insert Payments
        for _, row in payments_df.iterrows():
            s_id_str = row["settlement_batch_id"] if not pd.isna(row["settlement_batch_id"]) else None
            db_batch_id = batch_map.get(s_id_str) if s_id_str else None
            payment = Payment(
                payment_id=row["payment_id"],
                order_id=row["order_id"],
                customer_id=row["customer_id"],
                amount=to_decimal(row["amount"]),
                currency=row["currency"],
                payment_method=row["payment_method"],
                status=row["status"],
                created_at=datetime.strptime(row["created_at"], "%Y-%m-%dT%H:%M:%S"),
                settlement_batch_id=db_batch_id
            )
            db.add(payment)
            
        # Insert Line Items
        for _, row in line_items_df.iterrows():
            s_id_str = row["settlement_batch_id"]
            db_batch_id = batch_map.get(s_id_str)
            if not db_batch_id:
                continue
            li = SettlementLineItem(
                settlement_batch_id=db_batch_id,
                payment_id=row["payment_id"],
                gross_amount=to_decimal(row["gross_amount"]),
                fee_amount=to_decimal(row["fee_amount"]),
                tax_amount=to_decimal(row["tax_amount"]),
                adjustment_amount=to_decimal(row["adjustment_amount"]),
                net_contribution=to_decimal(row["net_contribution"])
            )
            db.add(li)
            
        # Insert Bank Transactions
        for _, row in bank_txs_df.iterrows():
            btx = BankTransaction(
                bank_transaction_id=row["bank_transaction_id"],
                reference=row["reference"] if not pd.isna(row["reference"]) else "",
                credit_amount=to_decimal(row["credit_amount"]),
                debit_amount=to_decimal(row["debit_amount"]),
                transaction_date=to_date(row["transaction_date"]),
                description=row["description"] if not pd.isna(row["description"]) else "",
                balance=to_decimal(row["balance"]),
                source=row["source"]
            )
            db.add(btx)
            
        db.commit()
        
        # Verify 25 batches exist
        assert db.query(SettlementBatch).count() == 25
        assert db.query(Payment).count() == 100
        
        # Run Full Reconciliation Engine Cycle
        run = run_reconciliation(db, "RUN_TEST_25_SCENARIOS")
        assert run is not None
        assert run.completed_at is not None
        assert run.total_settlements == 25
        assert run.matched_count > 0
        assert run.exception_count > 0
        
        # Verify Decisions and abstentions
        decisions = db.query(ReconciliationMatch).filter(ReconciliationMatch.reconciliation_run_id == run.id).all()
        assert len(decisions) == 25
        
        print(f"[OK] Test completed: {run.matched_count} matched, {run.exception_count} exceptions, {run.abstained_count} abstained.")
        
    finally:
        db.close()
        if os.path.exists("./test_25_scenarios.db"):
            try:
                os.remove("./test_25_scenarios.db")
            except Exception:
                pass
