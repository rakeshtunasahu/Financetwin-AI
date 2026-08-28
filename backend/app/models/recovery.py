"""
RevenueRescue AI — Recovery Data Models
Defines RecoveryCase, RecoveryAction and their lifecycle enums.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Any, Dict
from sqlalchemy import String, Numeric, ForeignKey, DateTime, Integer, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.base import Base


# ──────────────────────────────────────────────────────────────────────────────
# Enums (stored as string columns for SQLite compatibility)
# ──────────────────────────────────────────────────────────────────────────────

class RecoveryType:
    PAYMENT_FAILURE        = "PAYMENT_FAILURE"
    CHECKOUT_ABANDONMENT   = "CHECKOUT_ABANDONMENT"
    SUBSCRIPTION_FAILURE   = "SUBSCRIPTION_FAILURE"
    OVERDUE_RECEIVABLE     = "OVERDUE_RECEIVABLE"
    MANDATE_FAILURE        = "MANDATE_FAILURE"
    SETTLEMENT_SHORTFALL   = "SETTLEMENT_SHORTFALL"
    PROMISE_TO_PAY_MISSED  = "PROMISE_TO_PAY_MISSED"

    ALL = [
        PAYMENT_FAILURE, CHECKOUT_ABANDONMENT, SUBSCRIPTION_FAILURE,
        OVERDUE_RECEIVABLE, MANDATE_FAILURE, SETTLEMENT_SHORTFALL,
        PROMISE_TO_PAY_MISSED
    ]


class RecoveryCaseStatus:
    DETECTED             = "DETECTED"
    DIAGNOSED            = "DIAGNOSED"
    PRIORITIZED          = "PRIORITIZED"
    ACTION_SELECTED      = "ACTION_SELECTED"
    POLICY_CHECKED       = "POLICY_CHECKED"
    ACTION_EXECUTED      = "ACTION_EXECUTED"
    WAITING_FOR_OUTCOME  = "WAITING_FOR_OUTCOME"
    # Terminal states
    RECOVERED            = "RECOVERED"
    RETRY                = "RETRY"
    STOPPED              = "STOPPED"
    ESCALATED            = "ESCALATED"
    UNRECOVERABLE        = "UNRECOVERABLE"
    EXPIRED              = "EXPIRED"

    TERMINAL = {RECOVERED, STOPPED, ESCALATED, UNRECOVERABLE, EXPIRED}

    # Valid state transitions
    TRANSITIONS: Dict[str, List[str]] = {
        DETECTED:            [DIAGNOSED],
        DIAGNOSED:           [PRIORITIZED],
        PRIORITIZED:         [ACTION_SELECTED],
        ACTION_SELECTED:     [POLICY_CHECKED],
        POLICY_CHECKED:      [ACTION_EXECUTED, ESCALATED, STOPPED],
        ACTION_EXECUTED:     [WAITING_FOR_OUTCOME],
        WAITING_FOR_OUTCOME: [RECOVERED, RETRY, ESCALATED, STOPPED, UNRECOVERABLE],
        RETRY:               [ACTION_SELECTED, STOPPED],
        # Terminal states — no further transitions
        RECOVERED:           [],
        STOPPED:             [],
        ESCALATED:           [],
        UNRECOVERABLE:       [],
        EXPIRED:             [],
    }


class RootCause:
    TEMPORARY_BANK_FAILURE       = "TEMPORARY_BANK_FAILURE"
    NETWORK_TIMEOUT              = "NETWORK_TIMEOUT"
    GATEWAY_TECHNICAL_FAILURE    = "GATEWAY_TECHNICAL_FAILURE"
    INSUFFICIENT_FUNDS           = "INSUFFICIENT_FUNDS"
    EXPIRED_PAYMENT_METHOD       = "EXPIRED_PAYMENT_METHOD"
    CUSTOMER_ABANDONMENT         = "CUSTOMER_ABANDONMENT"
    PAYMENT_METHOD_DECLINED      = "PAYMENT_METHOD_DECLINED"
    INVOICE_OVERDUE              = "INVOICE_OVERDUE"
    MANDATE_FAILURE              = "MANDATE_FAILURE"
    PROMISE_TO_PAY_MISSED        = "PROMISE_TO_PAY_MISSED"
    PERMANENT_FAILURE            = "PERMANENT_FAILURE"
    UNKNOWN_REQUIRES_REVIEW      = "UNKNOWN_REQUIRES_REVIEW"


class ActionType:
    # Payment Failure
    SMART_RETRY                      = "SMART_RETRY"
    SCHEDULED_RETRY                  = "SCHEDULED_RETRY"
    OFFER_ALTERNATIVE_PAYMENT        = "OFFER_ALTERNATIVE_PAYMENT"
    SEND_PAYMENT_REMINDER            = "SEND_PAYMENT_REMINDER"
    # Checkout Abandonment
    SEND_RECOVERY_REMINDER           = "SEND_RECOVERY_REMINDER"
    SEND_PAYMENT_LINK                = "SEND_PAYMENT_LINK"
    PERSONALIZED_FOLLOW_UP           = "PERSONALIZED_FOLLOW_UP"
    # B2B Overdue Receivables
    SEND_INVOICE_REMINDER            = "SEND_INVOICE_REMINDER"
    SEND_PAYMENT_CHASER              = "SEND_PAYMENT_CHASER"
    REQUEST_PROMISE_TO_PAY           = "REQUEST_PROMISE_TO_PAY"
    CHECK_PROMISE_TO_PAY             = "CHECK_PROMISE_TO_PAY"
    ESCALATE_TO_FINANCE_TEAM         = "ESCALATE_TO_FINANCE_TEAM"
    # Mandate
    SCHEDULE_MANDATE_RETRY           = "SCHEDULE_MANDATE_RETRY"
    REQUEST_PAYMENT_METHOD_UPDATE    = "REQUEST_PAYMENT_METHOD_UPDATE"
    ALTERNATIVE_COLLECTION_ACTION    = "ALTERNATIVE_COLLECTION_ACTION"
    # Universal
    ESCALATE_TO_HUMAN                = "ESCALATE_TO_HUMAN"
    STOP_WORKFLOW                    = "STOP_WORKFLOW"


class ExecutionMode:
    SIMULATED = "SIMULATED"
    LIVE      = "LIVE"


class ActionOutcome:
    SUCCESS = "SUCCESS"
    FAILED  = "FAILED"
    PENDING = "PENDING"


class Severity:
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"


# ──────────────────────────────────────────────────────────────────────────────
# SQLAlchemy ORM Models
# ──────────────────────────────────────────────────────────────────────────────

class RecoveryCase(Base):
    """
    Central recovery entity. Created when revenue is detected at risk.
    Tracks the full lifecycle from DETECTED → RECOVERED / STOPPED / ESCALATED.
    """
    __tablename__ = "recovery_cases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    case_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    # Source linkage (optional — may not always link to an exception)
    source_exception_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    source_transaction_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    customer_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    merchant_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Recovery classification
    recovery_type: Mapped[str] = mapped_column(String(50))       # RecoveryType.*
    severity: Mapped[str] = mapped_column(String(20), default=Severity.MEDIUM)

    # Financial amounts
    amount_at_risk: Mapped[Decimal] = mapped_column(Numeric(18, 4))
    amount_recovered: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0.00"))

    # Diagnosis
    root_cause: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    diagnosis_confidence: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)
    diagnosis_evidence: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Prioritization
    priority_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 4), nullable=True)
    recovery_probability: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 4), nullable=True)

    # Decision
    recommended_action: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    action_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # State machine
    current_status: Mapped[str] = mapped_column(String(50), default=RecoveryCaseStatus.DETECTED)

    # Attempt counters
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    reminder_count: Mapped[int] = mapped_column(Integer, default=0)

    # Additional metadata
    days_overdue: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    has_dispute: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(8, 6), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    actions: Mapped[List["RecoveryAction"]] = relationship(
        back_populates="case", cascade="all, delete-orphan"
    )


class RecoveryAction(Base):
    """
    Individual recovery action taken or scheduled for a RecoveryCase.
    Every action is clearly marked SIMULATED or LIVE.
    """
    __tablename__ = "recovery_actions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    action_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    case_id: Mapped[int] = mapped_column(ForeignKey("recovery_cases.id", ondelete="CASCADE"))

    action_type: Mapped[str] = mapped_column(String(100))        # ActionType.*
    execution_mode: Mapped[str] = mapped_column(String(20), default=ExecutionMode.SIMULATED)

    # Policy check result
    policy_result: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # APPROVED / DENIED
    policy_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Execution
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=ActionOutcome.PENDING)  # SUCCESS / FAILED / PENDING

    # Outcome
    outcome: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)        # ActionOutcome.*
    recovered_amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0.00"))
    failure_reason: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    next_action: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    case: Mapped["RecoveryCase"] = relationship(back_populates="actions")
