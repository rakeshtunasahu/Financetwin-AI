from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import String, Numeric, ForeignKey, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base

class SettlementBatch(Base):
    __tablename__ = "settlement_batches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    settlement_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    merchant_id: Mapped[str] = mapped_column(String(50))
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    gateway_fee: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    fee_tax: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    refunds: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    adjustments: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    reserves: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    net_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    settlement_date: Mapped[date] = mapped_column(Date)
    expected_credit_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="PENDING")  # PENDING, MATCHED, EXCEPTION, ABSTAINED
    utr: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    line_items: Mapped[List["SettlementLineItem"]] = relationship(back_populates="settlement_batch", cascade="all, delete-orphan")
    payments: Mapped[List["Payment"]] = relationship(back_populates="settlement_batch")

class SettlementLineItem(Base):
    __tablename__ = "settlement_line_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    settlement_batch_id: Mapped[int] = mapped_column(ForeignKey("settlement_batches.id", ondelete="CASCADE"))
    payment_id: Mapped[str] = mapped_column(String(50), index=True)
    gross_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    fee_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    adjustment_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    net_contribution: Mapped[Decimal] = mapped_column(Numeric(18, 4))

    settlement_batch: Mapped["SettlementBatch"] = relationship(back_populates="line_items")

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    payment_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    order_id: Mapped[str] = mapped_column(String(50))
    customer_id: Mapped[str] = mapped_column(String(50))
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    payment_method: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(20), default="CAPTURED") # CAPTURED, REFUNDED, FAILED
    created_at: Mapped[datetime] = mapped_column(DateTime)
    settlement_batch_id: Mapped[Optional[int]] = mapped_column(ForeignKey("settlement_batches.id", ondelete="SET NULL"), nullable=True)

    settlement_batch: Mapped[Optional["SettlementBatch"]] = relationship(back_populates="payments")

class BankTransaction(Base):
    __tablename__ = "bank_transactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    bank_transaction_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    reference: Mapped[str] = mapped_column(String(100), index=True)
    credit_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal(0))
    debit_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal(0))
    transaction_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(String(255))
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    source: Mapped[str] = mapped_column(String(50)) # e.g. HDFC, ICICI
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
