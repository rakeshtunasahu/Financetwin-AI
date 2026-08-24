from pydantic import BaseModel
from typing import Optional

class PolicySchema(BaseModel):
    minimum_match_confidence: float
    minimum_confidence_margin: float
    max_auto_resolve_amount: float
    high_value_transaction_threshold: float
    amount_tolerance: float
    date_tolerance_days: int
    tax_rate: float
    severity_weight_low: float = 0.5
    severity_weight_medium: float = 1.0
    severity_weight_high: float = 2.0
    severity_weight_critical: float = 5.0

class PolicySimulationRequest(BaseModel):
    minimum_match_confidence: Optional[float] = None
    minimum_confidence_margin: Optional[float] = None
    max_auto_resolve_amount: Optional[float] = None
    high_value_transaction_threshold: Optional[float] = None
    amount_tolerance: Optional[float] = None
    date_tolerance_days: Optional[int] = None
    tax_rate: Optional[float] = None

class PolicyImpactMetrics(BaseModel):
    match_count: int
    abstain_count: int
    exception_count: int
    manual_review_count: int
    auto_resolve_count: int
    coverage: float
    false_match_rate: Optional[float] = None
    financial_amount_at_risk: float

class PolicySimulationResponse(BaseModel):
    before: PolicyImpactMetrics
    after: PolicyImpactMetrics
