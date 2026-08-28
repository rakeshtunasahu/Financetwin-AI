"""
RevenueRescue AI — Pydantic Schemas for Recovery API
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RecoveryActionSchema(BaseModel):
    id: int
    action_id: str
    case_id: int
    action_type: str
    execution_mode: str
    policy_result: Optional[str] = None
    policy_reason: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None
    status: str
    outcome: Optional[str] = None
    recovered_amount: Decimal
    failure_reason: Optional[str] = None
    next_action: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RecoveryCaseSchema(BaseModel):
    id: int
    case_id: str
    source_exception_id: Optional[str] = None
    source_transaction_id: Optional[str] = None
    customer_id: Optional[str] = None
    merchant_id: Optional[str] = None
    recovery_type: str
    severity: str
    amount_at_risk: Decimal
    amount_recovered: Decimal
    root_cause: Optional[str] = None
    diagnosis_confidence: Optional[Decimal] = None
    priority_score: Optional[Decimal] = None
    recovery_probability: Optional[Decimal] = None
    recommended_action: Optional[str] = None
    action_reason: Optional[str] = None
    current_status: str
    attempt_count: int
    reminder_count: int
    days_overdue: Optional[int] = None
    has_dispute: bool
    anomaly_score: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecoveryCaseDetailSchema(RecoveryCaseSchema):
    diagnosis_evidence: Optional[Dict[str, Any]] = None
    actions: List[RecoveryActionSchema] = []
    audit_history: List[Dict[str, Any]] = []


class ExecuteActionRequest(BaseModel):
    action_type: Optional[str] = None  # If not provided, agent selects automatically
    notes: Optional[str] = None


class BatchRecoveryRequest(BaseModel):
    payment_failures: int = Field(default=30, ge=1, le=100)
    checkout_abandonments: int = Field(default=25, ge=1, le=100)
    overdue_receivables: int = Field(default=25, ge=1, le=100)
    policy_override: Optional[Dict[str, Any]] = None


class RecoveryMetricsResponse(BaseModel):
    total_revenue_at_risk: float
    total_amount_recovered: float
    recovery_rate_pct: float
    active_recovery_cases: int
    cases_recovered: int
    cases_stopped: int
    cases_escalated: int
    cases_in_progress: int
    avg_recovery_time_hours: float
    funnel: Dict[str, Any]
    by_intervention: Dict[str, Any]
    by_type: Dict[str, Any]
    human_attention_queue: List[Dict[str, Any]]


class RecoveryPolicySchema(BaseModel):
    max_payment_retries: int = 3
    max_customer_reminders: int = 3
    max_workflow_duration_days: int = 7
    high_value_escalation_threshold: float = 50000.0
    max_promise_to_pay_misses: int = 2
    retry_cooldown_hours: int = 24


class RecoveryPolicySimulateRequest(BaseModel):
    max_payment_retries: Optional[int] = None
    max_customer_reminders: Optional[int] = None
    max_workflow_duration_days: Optional[int] = None
    high_value_escalation_threshold: Optional[float] = None
    max_promise_to_pay_misses: Optional[int] = None
    retry_cooldown_hours: Optional[int] = None
