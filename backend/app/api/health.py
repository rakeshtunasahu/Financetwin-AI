from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.schemas.payload import HealthResponse
from backend.app.db.session import get_db
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        
    return HealthResponse(
        status="healthy",
        database=db_status,
        environment=settings.APP_ENV
    )
