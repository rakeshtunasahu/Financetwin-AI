from decimal import Decimal
from datetime import date
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.db.base import Base
from backend.app.models.entities import SettlementBatch, BankTransaction, SettlementLineItem
from backend.app.services.matcher import match_batch

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()

def test_exact_match(db_session):
    batch = SettlementBatch(
        settlement_id="SET_001",
        merchant_id="MER_01",
        gross_amount=Decimal("1000.00"),
        gateway_fee=Decimal("20.00"),
        fee_tax=Decimal("3.60"),
        refunds=Decimal("0.00"),
        adjustments=Decimal("0.00"),
        reserves=Decimal("0.00"),
        net_amount=Decimal("976.40"),
        settlement_date=date(2026, 8, 1),
        expected_credit_date=date(2026, 8, 3),
        utr="UTR_EXACT_123"
    )
    db_session.add(batch)
    
    li = SettlementLineItem(
        settlement_batch=batch,
        payment_id="PAY_01",
        gross_amount=Decimal("1000.00"),
        fee_amount=Decimal("20.00"),
        tax_amount=Decimal("3.60"),
        adjustment_amount=Decimal("0.00"),
        net_contribution=Decimal("976.40")
    )
    db_session.add(li)
    
    tx = BankTransaction(
        bank_transaction_id="BTX_001",
        reference="UTR_EXACT_123",
        credit_amount=Decimal("976.40"),
        debit_amount=Decimal("0.00"),
        transaction_date=date(2026, 8, 3),
        description="PG SETTLEMENT UTR_EXACT_123",
        balance=Decimal("10000.00"),
        source="HDFC"
    )
    db_session.add(tx)
    db_session.commit()
    
    res = match_batch(batch, [tx])
    assert res["decision"] == "MATCH"
    assert res["match_type"] == "EXACT"
    assert res["matching_pass"] == 1
    assert res["bank_transaction_id"] == tx.id

def test_amount_date_proximity_match(db_session):
    batch = SettlementBatch(
        settlement_id="SET_002",
        merchant_id="MER_01",
        gross_amount=Decimal("2000.00"),
        gateway_fee=Decimal("40.00"),
        fee_tax=Decimal("7.20"),
        refunds=Decimal("0.00"),
        adjustments=Decimal("0.00"),
        reserves=Decimal("0.00"),
        net_amount=Decimal("1952.80"),
        settlement_date=date(2026, 8, 1),
        expected_credit_date=date(2026, 8, 3),
        utr="UTR_MISSING_123"
    )
    db_session.add(batch)
    
    li = SettlementLineItem(
        settlement_batch=batch,
        payment_id="PAY_02",
        gross_amount=Decimal("2000.00"),
        fee_amount=Decimal("40.00"),
        tax_amount=Decimal("7.20"),
        adjustment_amount=Decimal("0.00"),
        net_contribution=Decimal("1952.80")
    )
    db_session.add(li)
    
    # Bank credit matches amount and date, but reference has no UTR details
    tx = BankTransaction(
        bank_transaction_id="BTX_002",
        reference="BANK DEPOSIT",
        credit_amount=Decimal("1952.80"),
        debit_amount=Decimal("0.00"),
        transaction_date=date(2026, 8, 4), # within T+2 window (tolerance is 2 days)
        description="PG PARTNER SETTLEMENT",
        balance=Decimal("20000.00"),
        source="ICICI"
    )
    db_session.add(tx)
    db_session.commit()
    
    res = match_batch(batch, [tx])
    assert res["decision"] == "MATCH"
    assert res["match_type"] == "AMOUNT_DATE"
    assert res["matching_pass"] == 2

def test_ambiguity_gate_abstain(db_session):
    batch = SettlementBatch(
        settlement_id="SET_003",
        merchant_id="MER_01",
        gross_amount=Decimal("5000.00"),
        gateway_fee=Decimal("0.00"),
        fee_tax=Decimal("0.00"),
        refunds=Decimal("0.00"),
        adjustments=Decimal("0.00"),
        reserves=Decimal("0.00"),
        net_amount=Decimal("5000.00"),
        settlement_date=date(2026, 8, 1),
        expected_credit_date=date(2026, 8, 3),
        utr="UTR_AMB_123"
    )
    db_session.add(batch)
    
    li = SettlementLineItem(
        settlement_batch=batch,
        payment_id="PAY_03",
        gross_amount=Decimal("5000.00"),
        fee_amount=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        adjustment_amount=Decimal("0.00"),
        net_contribution=Decimal("5000.00")
    )
    db_session.add(li)
    
    # Generate two identical bank credits (duplicate amount + same date + missing UTR)
    tx1 = BankTransaction(
        bank_transaction_id="BTX_003",
        reference="BANK TRANSFER",
        credit_amount=Decimal("5000.00"),
        debit_amount=Decimal("0.00"),
        transaction_date=date(2026, 8, 3),
        description="PG TRANSFER 1",
        balance=Decimal("30000.00"),
        source="HDFC"
    )
    tx2 = BankTransaction(
        bank_transaction_id="BTX_004",
        reference="BANK TRANSFER",
        credit_amount=Decimal("5000.00"),
        debit_amount=Decimal("0.00"),
        transaction_date=date(2026, 8, 3),
        description="PG TRANSFER 2",
        balance=Decimal("35000.00"),
        source="HDFC"
    )
    db_session.add_all([tx1, tx2])
    db_session.commit()
    
    # Pass 2 will detect multiple candidates and ABSTAIN
    res = match_batch(batch, [tx1, tx2])
    assert res["decision"] == "ABSTAIN"
    assert "AMBIGUITY" in res["match_type"] or "AMBIGUOUS" in res["match_type"]

def test_integrity_failure(db_session):
    batch = SettlementBatch(
        settlement_id="SET_004",
        merchant_id="MER_01",
        gross_amount=Decimal("1000.00"),
        gateway_fee=Decimal("0.00"),
        fee_tax=Decimal("0.00"),
        refunds=Decimal("0.00"),
        adjustments=Decimal("0.00"),
        reserves=Decimal("0.00"),
        net_amount=Decimal("1200.00"), # Integrity mismatch
        settlement_date=date(2026, 8, 1),
        expected_credit_date=date(2026, 8, 3),
        utr="UTR_INT_123"
    )
    db_session.add(batch)
    
    li = SettlementLineItem(
        settlement_batch=batch,
        payment_id="PAY_04",
        gross_amount=Decimal("1000.00"),
        fee_amount=Decimal("0.00"),
        tax_amount=Decimal("0.00"),
        adjustment_amount=Decimal("0.00"),
        net_contribution=Decimal("1000.00") # Sum=1000, batch net=1200
    )
    db_session.add(li)
    db_session.commit()
    
    res = match_batch(batch, [])
    assert res["decision"] == "EXCEPTION"
    assert res["match_type"] == "INTEGRITY_VIOLATION"
