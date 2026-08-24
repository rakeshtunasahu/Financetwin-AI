from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DashboardSummarySchema(BaseModel):
    total_settlements: int
    matched_count: int
    abstained_count: int
    no_match_count: int
    exception_count: int
    match_rate: float
    precision: Optional[float] = None
    recall: Optional[float] = None
    false_match_rate: Optional[float] = None
    coverage: float
    auto_resolution_rate: float
    financial_amount_at_risk: float

class AnomalySummarySchema(BaseModel):
    anomaly_count: int
    total_exceptions: int
    anomaly_rate: float
    anomalies: List[Dict[str, Any]]

class ClusterSummarySchema(BaseModel):
    cluster_count: int
    clusters: List[Dict[str, Any]]
