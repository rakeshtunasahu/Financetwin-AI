"""
RevenueRescue AI — Pydantic Schemas for Recovery API & Priority System
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class RecoveryActionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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


class RecoveryCaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
    
    # Priority Engine Fields
    priority_score: Optional[Decimal] = None
    priority_level: Optional[str] = "P2"
    financial_impact_score: Optional[Decimal] = None
    recovery_probability: Optional[Decimal] = None
    urgency_score: Optional[Decimal] = None
    severity_score: Optional[Decimal] = None
    historical_multiplier: Optional[Decimal] = None
    priority_reason: Optional[str] = None
    priority_breakdown: Optional[Dict[str, Any]] = None
    priority_calculated_at: Optional[datetime] = None

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


class RecoveryCaseDetailSchema(RecoveryCaseSchema):
    diagnosis_evidence: Optional[Dict[str, Any]] = None
    actions: List[RecoveryActionSchema] = []
    audit_history: List[Dict[str, Any]] = []


class PriorityQueueSummary(BaseModel):
    p0_count: int
    p1_count: int
    p2_count: int
    p3_count: int
    total_cases: int
    total_revenue_at_risk: float
    high_priority_revenue: float
    estimated_recoverable_revenue: float
    average_recovery_probability: float
    cases_requiring_action: int


class PriorityQueueResponse(BaseModel):
    items: List[RecoveryCaseSchema]
    total: int
    page: int
    page_size: int
    summary: PriorityQueueSummary


class PrioritySummaryResponse(BaseModel):
    total_cases: int
    p0_cases: int
    p1_cases: int
    p2_cases: int
    p3_cases: int
    total_revenue_at_risk: float
    high_priority_revenue_at_risk: float
    estimated_recoverable_revenue: float
    recovered_revenue: float
    recovery_rate_pct: float
    average_recovery_probability: float
    cases_requiring_manual_action: int
    highest_priority_case: Optional[RecoveryCaseSchema] = None
    recommended_next_action: Optional[str] = None
    funnel: Dict[str, Any]
    priority_distribution: Dict[str, Any]


class RecoverNextResponse(BaseModel):
    eligible: bool
    case: Optional[RecoveryCaseSchema] = None
    why_first_reason: Optional[str] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    recommended_action: Optional[str] = None
    message: Optional[str] = None


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
    
    # Priority Engine Policies
    p0_threshold: float = 85.0
    p1_threshold: float = 70.0
    p2_threshold: float = 40.0
    weight_financial_impact: float = 0.35
    weight_recovery_probability: float = 0.35
    weight_urgency: float = 0.15
    weight_severity: float = 0.15


class RecoveryPolicySimulateRequest(BaseModel):
    max_payment_retries: Optional[int] = None
    max_customer_reminders: Optional[int] = None
    max_workflow_duration_days: Optional[int] = None
    high_value_escalation_threshold: Optional[float] = None
    max_promise_to_pay_misses: Optional[int] = None
    retry_cooldown_hours: Optional[int] = None
    
    p0_threshold: Optional[float] = None
    p1_threshold: Optional[float] = None
    p2_threshold: Optional[float] = None
    weight_financial_impact: Optional[float] = None
    weight_recovery_probability: Optional[float] = None
    weight_urgency: Optional[float] = None
    weight_severity: Optional[float] = None
