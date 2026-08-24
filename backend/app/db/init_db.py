from backend.app.db.base import Base
from backend.app.db.session import engine

# Import all models to register them on the metadata
from backend.app.models.entities import Payment, SettlementBatch, SettlementLineItem, BankTransaction
from backend.app.models.reconciliation import (
    ReconciliationRun,
    ReconciliationMatch,
    ExceptionRecord,
    AIInvestigation,
    AuditLog
)

def init_db():
    Base.metadata.create_all(bind=engine)
