"""
RevenueRescue AI — Synthetic Recovery Dataset Generator
Generates 80 realistic recovery cases across 3 primary scenarios:
  - PAYMENT_FAILURE (30 cases)
  - CHECKOUT_ABANDONMENT (25 cases)
  - OVERDUE_RECEIVABLE (25 cases)
All amounts in INR. Designed for the Batch Recovery demo.
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Dict, Any

SEED = 42
random.seed(SEED)

# ──────────────────────────────────────────────────────────────────────────────
# Helper data pools
# ──────────────────────────────────────────────────────────────────────────────

CUSTOMER_IDS = [f"CUST-{str(i).zfill(5)}" for i in range(1001, 1051)]
MERCHANT_IDS = [f"MERCH-{str(i).zfill(4)}" for i in range(101, 121)]
INVOICE_PREFIXES = ["INV", "ORD", "TXN", "PAY"]

PAYMENT_FAILURE_REASONS = [
    ("TEMPORARY_BANK_FAILURE",   "Bank timeout response received from issuing bank", 0.82),
    ("NETWORK_TIMEOUT",          "Gateway connection timed out during authorization", 0.75),
    ("GATEWAY_TECHNICAL_FAILURE","Payment gateway returned error code 5xx",          0.70),
    ("INSUFFICIENT_FUNDS",       "Issuing bank declined: insufficient balance",       0.25),
    ("EXPIRED_PAYMENT_METHOD",   "Card expired or payment credentials invalid",       0.20),
    ("PAYMENT_METHOD_DECLINED",  "Issuer declined — contact bank for details",        0.15),
]

ABANDONMENT_TRIGGERS = [
    ("CUSTOMER_ABANDONMENT", "Checkout session expired after 30 minutes of inactivity", 0.45),
    ("CUSTOMER_ABANDONMENT", "User navigated away before completing payment step",      0.50),
    ("CUSTOMER_ABANDONMENT", "Payment page timeout — user did not retry",              0.40),
]

OVERDUE_REASONS = [
    ("INVOICE_OVERDUE",       "Net-30 payment terms breached by 18 days",             0.55),
    ("INVOICE_OVERDUE",       "Invoice disputed; partial payment pending resolution",  0.30),
    ("PROMISE_TO_PAY_MISSED", "Customer promised payment on Day 5; no payment received", 0.40),
    ("MANDATE_FAILURE",       "NACH mandate debit failed — insufficient funds",        0.35),
]


def _random_amount(min_val: float, max_val: float, step: float = 500.0) -> Decimal:
    steps = int((max_val - min_val) / step)
    val = min_val + random.randint(0, steps) * step
    return Decimal(str(round(val, 2)))


def _days_ago(n: int) -> datetime:
    return datetime.utcnow() - timedelta(days=n)


def _case_id(idx: int) -> str:
    return f"REC-{str(idx).zfill(4)}"


def _action_id(case_idx: int, action_idx: int) -> str:
    return f"ACT-{str(case_idx).zfill(4)}-{str(action_idx).zfill(2)}"


def _tx_id(idx: int) -> str:
    prefixes = INVOICE_PREFIXES
    return f"{random.choice(prefixes)}-{str(idx * 137 + 10000)}"


# ──────────────────────────────────────────────────────────────────────────────
# Scenario Generators
# ──────────────────────────────────────────────────────────────────────────────

def _make_payment_failure(idx: int) -> Dict[str, Any]:
    reason_tuple = random.choice(PAYMENT_FAILURE_REASONS)
    root_cause, evidence_text, recovery_prob = reason_tuple

    amount = _random_amount(1000, 50000, 500)
    prev_successful = random.randint(0, 12)
    attempt_count   = random.randint(0, 2)
    days_since      = random.randint(0, 3)
    severity = "HIGH" if float(amount) >= 20000 else ("MEDIUM" if float(amount) >= 5000 else "LOW")

    # Adjust probability based on prior success
    if prev_successful > 3:
        recovery_prob = min(0.95, recovery_prob + 0.10)
    if attempt_count > 1:
        recovery_prob = max(0.05, recovery_prob - 0.15 * attempt_count)

    priority = min(100.0, round(
        float(amount) / 1000 * 0.4
        + recovery_prob * 30
        + (3 - attempt_count) * 10
        + (5 if prev_successful > 5 else 0)
    , 1))

    return {
        "case_id": _case_id(idx),
        "recovery_type": "PAYMENT_FAILURE",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": random.choice(CUSTOMER_IDS),
        "merchant_id": random.choice(MERCHANT_IDS),
        "source_transaction_id": _tx_id(idx),
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.72 + random.random() * 0.25, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Previous successful payments: {prev_successful}",
            f"Previous retry attempts: {attempt_count}",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": priority,
        "attempt_count": attempt_count,
        "reminder_count": 0,
        "days_overdue": days_since,
        "has_dispute": False,
        "anomaly_score": round(random.random() * 0.4, 4),
        "created_at": _days_ago(days_since),
    }


def _make_checkout_abandonment(idx: int) -> Dict[str, Any]:
    reason_tuple = random.choice(ABANDONMENT_TRIGGERS)
    root_cause, evidence_text, recovery_prob = reason_tuple

    amount = _random_amount(500, 15000, 250)
    minutes_since = random.randint(15, 180)
    reminder_count = random.randint(0, 2)
    severity = "MEDIUM" if float(amount) >= 3000 else "LOW"

    # Urgency penalty for old abandonments
    if minutes_since > 60:
        recovery_prob = max(0.10, recovery_prob - 0.10)
    if reminder_count > 0:
        recovery_prob = max(0.10, recovery_prob - 0.08 * reminder_count)

    priority = min(100.0, round(
        float(amount) / 500 * 0.3
        + recovery_prob * 25
        + max(0, (90 - minutes_since) / 90 * 20)
    , 1))

    return {
        "case_id": _case_id(idx),
        "recovery_type": "CHECKOUT_ABANDONMENT",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": random.choice(CUSTOMER_IDS),
        "merchant_id": random.choice(MERCHANT_IDS),
        "source_transaction_id": _tx_id(idx),
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.60 + random.random() * 0.30, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Time since abandonment: {minutes_since} minutes",
            f"Previous reminders sent: {reminder_count}",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": priority,
        "attempt_count": 0,
        "reminder_count": reminder_count,
        "days_overdue": 0,
        "has_dispute": False,
        "anomaly_score": round(random.random() * 0.3, 4),
        "created_at": _days_ago(0),
    }


def _make_overdue_receivable(idx: int) -> Dict[str, Any]:
    reason_tuple = random.choice(OVERDUE_REASONS)
    root_cause, evidence_text, recovery_prob = reason_tuple

    amount = _random_amount(5000, 200000, 5000)
    days_overdue = random.randint(5, 45)
    reminders = random.randint(0, 3)
    severity = (
        "CRITICAL" if float(amount) >= 100000 else
        "HIGH"     if float(amount) >= 50000 else
        "MEDIUM"   if float(amount) >= 10000 else "LOW"
    )
    has_dispute = random.random() < 0.08

    # Aging penalty
    if days_overdue > 30:
        recovery_prob = max(0.10, recovery_prob - 0.15)
    if reminders >= 3:
        recovery_prob = max(0.08, recovery_prob - 0.10)

    priority = min(100.0, round(
        float(amount) / 5000 * 0.5
        + recovery_prob * 20
        + min(days_overdue / 45 * 25, 25)
        + (10 if severity in ("HIGH", "CRITICAL") else 0)
        - (5 if has_dispute else 0)
    , 1))

    return {
        "case_id": _case_id(idx),
        "recovery_type": "OVERDUE_RECEIVABLE",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": random.choice(CUSTOMER_IDS),
        "merchant_id": random.choice(MERCHANT_IDS),
        "source_transaction_id": _tx_id(idx),
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.65 + random.random() * 0.30, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Invoice overdue by {days_overdue} days",
            f"Reminders sent: {reminders}",
            "Payment terms: Net-30",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": priority,
        "attempt_count": reminders,
        "reminder_count": reminders,
        "days_overdue": days_overdue,
        "has_dispute": has_dispute,
        "anomaly_score": round(random.random() * 0.5, 4),
        "created_at": _days_ago(days_overdue),
    }


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def generate_recovery_batch(
    payment_failures: int = 30,
    checkout_abandonments: int = 25,
    overdue_receivables: int = 25,
) -> List[Dict[str, Any]]:
    """
    Generate a complete synthetic recovery batch.
    Returns list of dicts representing raw case parameters.
    """
    cases: List[Dict[str, Any]] = []
    idx = 1

    for _ in range(payment_failures):
        cases.append(_make_payment_failure(idx))
        idx += 1

    for _ in range(checkout_abandonments):
        cases.append(_make_checkout_abandonment(idx))
        idx += 1

    for _ in range(overdue_receivables):
        cases.append(_make_overdue_receivable(idx))
        idx += 1

    # Shuffle for realistic mixed queue
    random.shuffle(cases)
    return cases


def get_recovery_type_summary(cases: List[Dict[str, Any]]) -> Dict[str, Any]:
    summary: Dict[str, Any] = {}
    for case in cases:
        rt = case["recovery_type"]
        if rt not in summary:
            summary[rt] = {"count": 0, "total_at_risk": 0.0}
        summary[rt]["count"] += 1
        summary[rt]["total_at_risk"] += case["amount_at_risk"]
    return summary
