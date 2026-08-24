from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Any, Dict

class PaymentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    payment_id: str
    order_id: str
    customer_id: str
    amount: Decimal
    currency: str
    payment_method: str
    status: str
    created_at: datetime
    settlement_batch_id: Optional[int] = None

class SettlementLineItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    settlement_batch_id: int
    payment_id: str
    gross_amount: Decimal
    fee_amount: Decimal
    tax_amount: Decimal
    adjustment_amount: Decimal
    net_contribution: Decimal

class SettlementBatchSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    settlement_id: str
    merchant_id: str
    gross_amount: Decimal
    gateway_fee: Decimal
    fee_tax: Decimal
    refunds: Decimal
    adjustments: Decimal
    reserves: Decimal
    net_amount: Decimal
    settlement_date: date
    expected_credit_date: date
    status: str
    utr: Optional[str] = None
    created_at: datetime

class BankTransactionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bank_transaction_id: str
    reference: str
    credit_amount: Decimal
    debit_amount: Decimal
    transaction_date: date
    description: str
    balance: Decimal
    source: str
    created_at: datetime

class ReconciliationRunSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    run_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_settlements: int
    matched_count: int
    abstained_count: int
    exception_count: int
    created_at: datetime

class ReconciliationMatchSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reconciliation_run_id: int
    settlement_batch_id: int
    bank_transaction_id: Optional[int] = None
    match_type: str
    confidence: Decimal
    second_best_confidence: Optional[Decimal] = None
    confidence_margin: Optional[Decimal] = None
    matching_pass: int
    decision: str
    explainability_json: Dict[str, Any]
    created_at: datetime
    settlement_batch: Optional[SettlementBatchSchema] = None
    bank_transaction: Optional[BankTransactionSchema] = None

class ExceptionRecordSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exception_id: str
    reconciliation_run_id: int
    settlement_batch_id: Optional[int] = None
    bank_transaction_id: Optional[int] = None
    exception_type: str
    severity: str
    expected_amount: Decimal
    actual_amount: Decimal
    variance: Decimal
    status: str
    anomaly_score: Optional[Decimal] = None
    cluster_id: Optional[int] = None
    created_at: datetime
    settlement_batch: Optional[SettlementBatchSchema] = None
    bank_transaction: Optional[BankTransactionSchema] = None

class AuditLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_type: str
    entity_id: str
    action: str
    actor: str
    decision: str
    reason: str
    metadata_json: Dict[str, Any]
    created_at: datetime
