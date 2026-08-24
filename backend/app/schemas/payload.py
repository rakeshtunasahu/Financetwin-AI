from pydantic import BaseModel
from typing import Optional, Any

class HealthResponse(BaseModel):
    status: str
    database: str
    environment: str

class ReconciliationRunResponse(BaseModel):
    run_id: str
    status: str
    total_settlements: int
    matched_count: int
    abstained_count: int
    exception_count: int
    started_at: str

class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
