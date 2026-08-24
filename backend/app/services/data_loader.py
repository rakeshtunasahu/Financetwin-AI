import os
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.models.entities import Payment, SettlementBatch, SettlementLineItem, BankTransaction
from backend.app.utils.money import to_decimal
from backend.app.utils.dates import to_date

def load_all_csvs(db: Session, base_path: str):
    generated_dir = os.path.join(base_path, "data", "generated")
    
    # 1. Clear existing entity tables
    db.query(Payment).delete()
    db.query(SettlementLineItem).delete()
    db.query(SettlementBatch).delete()
    db.query(BankTransaction).delete()
    db.commit()
    
    # 2. Read CSVs
    payments_df = pd.read_csv(os.path.join(generated_dir, "payments.csv"))
    batches_df = pd.read_csv(os.path.join(generated_dir, "settlement_batches.csv"))
    line_items_df = pd.read_csv(os.path.join(generated_dir, "settlement_line_items.csv"))
    bank_txs_df = pd.read_csv(os.path.join(generated_dir, "bank_transactions.csv"))
    
    # 3. Insert batches first and keep a map of settlement_id -> db.id
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

    # 4. Insert payments mapping the settlement_batch_id foreign key
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
        
    # 5. Insert line items mapping the foreign key
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
        
    # 6. Insert bank transactions
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
    print("Synthetic data loaded into database successfully!")
