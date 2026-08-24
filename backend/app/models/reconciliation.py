from datetime import datetime
from decimal import Decimal
from typing import Optional, Any, Dict
from sqlalchemy import String, Numeric, ForeignKey, DateTime, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    run_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    total_settlements: Mapped[int] = mapped_column(Integer, default=0)
    matched_count: Mapped[int] = mapped_column(Integer, default=0)
    abstained_count: Mapped[int] = mapped_column(Integer, default=0)
    exception_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class ReconciliationMatch(Base):
    __tablename__ = "reconciliation_matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reconciliation_run_id: Mapped[int] = mapped_column(ForeignKey("reconciliation_runs.id"))
    settlement_batch_id: Mapped[int] = mapped_column(ForeignKey("settlement_batches.id"))
    bank_transaction_id: Mapped[Optional[int]] = mapped_column(ForeignKey("bank_transactions.id"), nullable=True)
    match_type: Mapped[str] = mapped_column(String(30)) # EXACT, FUZZY, NONE, etc.
    confidence: Mapped[Decimal] = mapped_column(Numeric(5, 4))
    second_best_confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    confidence_margin: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    matching_pass: Mapped[int] = mapped_column(Integer)
    decision: Mapped[str] = mapped_column(String(20)) # MATCH, ABSTAIN, NO_MATCH, EXCEPTION
    explainability_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    settlement_batch: Mapped["SettlementBatch"] = relationship()
    bank_transaction: Mapped[Optional["BankTransaction"]] = relationship()

class ExceptionRecord(Base):
    __tablename__ = "exception_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    exception_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    reconciliation_run_id: Mapped[int] = mapped_column(ForeignKey("reconciliation_runs.id"))
    settlement_batch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("settlement_batches.id"), nullable=True)
    bank_transaction_id: Mapped[Optional[int]] = mapped_column(ForeignKey("bank_transactions.id"), nullable=True)
    exception_type: Mapped[str] = mapped_column(String(50)) # FEE_MISMATCH, DUPLICATE_CREDIT, etc.
    severity: Mapped[str] = mapped_column(String(20)) # LOW, MEDIUM, HIGH, CRITICAL
    expected_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    actual_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    variance: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    status: Mapped[str] = mapped_column(String(20), default="UNRESOLVED") # UNRESOLVED, INVESTIGATING, RESOLVED, MANUAL_REVIEW
    anomaly_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 6), nullable=True)
    cluster_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    settlement_batch: Mapped[Optional["SettlementBatch"]] = relationship()
    bank_transaction: Mapped[Optional["BankTransaction"]] = relationship()

class AIInvestigation(Base):
    __tablename__ = "ai_investigations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    exception_id: Mapped[int] = mapped_column(ForeignKey("exception_records.id", ondelete="CASCADE"))
    model_name: Mapped[str] = mapped_column(String(50))
    model_version: Mapped[str] = mapped_column(String(50))
    input_facts_json: Mapped[Dict[str, Any]] = mapped_column(JSON)
    output_json: Mapped[Dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    exception: Mapped["ExceptionRecord"] = relationship()

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    entity_type: Mapped[str] = mapped_column(String(50)) # ReconciliationRun, ExceptionRecord, Policy
    entity_id: Mapped[str] = mapped_column(String(50))
    action: Mapped[str] = mapped_column(String(50)) # MATCH_DECISION, EXCEPTION_CREATED, POLICY_APPLIED
    actor: Mapped[str] = mapped_column(String(50), default="system")
    decision: Mapped[str] = mapped_column(String(50))
    reason: Mapped[str] = mapped_column(String(255))
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
