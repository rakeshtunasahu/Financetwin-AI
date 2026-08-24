from pydantic import BaseModel, Field
from decimal import Decimal
from typing import List, Optional

class GroundedFactInput(BaseModel):
    exception_id: str
    settlement_id: Optional[str] = None
    bank_transaction_id: Optional[str] = None
    expected_amount: Decimal
    actual_amount: Decimal
    variance: Decimal
    expected_fee: Decimal
    actual_fee: Decimal
    days_delayed: int
    triggered_rules: List[str] = Field(default_factory=list)
    evidence_ids: List[str] = Field(default_factory=list)
    anomaly_score: Optional[float] = None
    cluster_id: Optional[int] = None

class AIInvestigationOutput(BaseModel):
    exception_type: str
    root_cause: str
    investigation_confidence: float
    evidence_ids: List[str] = Field(default_factory=list)
    recommended_action: str  # AUTO_RESOLVE, WAIT_AND_MONITOR, GENERATE_DISPUTE, MANUAL_REVIEW
    explanation: str
