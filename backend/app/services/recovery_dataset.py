"""
RevenueRescue AI — Synthetic Recovery Dataset Generator
Generates realistic recovery cases across payment failures, checkout abandonments,
and overdue receivables. Integrates PriorityScoringService to compute authentic
explainable AI priority scores and classifications.
"""
import random
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from typing import List, Dict, Any

from backend.app.services.priority_scoring import PriorityScoringService

SEED = 42
random.seed(SEED)

CUSTOMER_IDS = [f"CUST-{str(i).zfill(5)}" for i in range(1001, 1051)]
MERCHANT_IDS = [f"MERCH-{str(i).zfill(4)}" for i in range(101, 121)]
INVOICE_PREFIXES = ["INV", "ORD", "TXN", "PAY"]

PAYMENT_FAILURE_REASONS = [
    ("TEMPORARY_BANK_FAILURE",   "Bank timeout response received from issuing bank", 0.92),
    ("NETWORK_TIMEOUT",          "Gateway connection timed out during authorization", 0.88),
    ("GATEWAY_TECHNICAL_FAILURE","Payment gateway returned error code 5xx",          0.82),
    ("INSUFFICIENT_FUNDS",       "Issuing bank declined: insufficient balance",       0.35),
    ("EXPIRED_PAYMENT_METHOD",   "Card expired or payment credentials invalid",       0.28),
    ("PAYMENT_METHOD_DECLINED",  "Issuer declined — contact bank for details",        0.20),
]

ABANDONMENT_TRIGGERS = [
    ("CUSTOMER_ABANDONMENT", "Checkout session expired after 30 minutes of inactivity", 0.84),
    ("CUSTOMER_ABANDONMENT", "User navigated away before completing payment step",      0.76),
    ("CUSTOMER_ABANDONMENT", "Payment page timeout — user did not retry",              0.68),
]

OVERDUE_REASONS = [
    ("INVOICE_OVERDUE",       "Net-30 payment terms breached by 18 days",             0.65),
    ("INVOICE_OVERDUE",       "Invoice disputed; partial payment pending resolution",  0.35),
    ("PROMISE_TO_PAY_MISSED", "Customer promised payment on Day 5; no payment received", 0.40),
    ("MANDATE_FAILURE",       "NACH mandate debit failed — insufficient funds",        0.52),
    ("SETTLEMENT_DELAY",      "Settlement delayed past 48h SLA on payment rail",       0.89),
]


def _random_amount(min_val: float, max_val: float, step: float = 500.0) -> Decimal:
    steps = int((max_val - min_val) / step)
    val = min_val + random.randint(0, steps) * step
    return Decimal(str(round(val, 2)))


def _days_ago(n: int) -> datetime:
    return datetime.utcnow() - timedelta(days=n)


def _case_id(idx: int) -> str:
    suffix = uuid.uuid4().hex[:4].upper()
    return f"REC-{str(idx).zfill(4)}-{suffix}"


def _tx_id(idx: int) -> str:
    prefixes = INVOICE_PREFIXES
    return f"{random.choice(prefixes)}-{str(idx * 137 + 10000)}"


def _make_payment_failure(idx: int, custom_data: Dict[str, Any] = None) -> Dict[str, Any]:
    if custom_data:
        amount = Decimal(str(custom_data["amount_at_risk"]))
        root_cause = custom_data["root_cause"]
        evidence_text = custom_data.get("evidence", "Payment failure telemetry captured")
        recovery_prob = float(custom_data["recovery_probability"])
        severity = custom_data.get("severity", "HIGH")
        days_since = custom_data.get("days_overdue", 1)
        attempt_count = custom_data.get("attempt_count", 0)
        cust_id = custom_data.get("customer_id", random.choice(CUSTOMER_IDS))
        merch_id = custom_data.get("merchant_id", random.choice(MERCHANT_IDS))
        tx_id = custom_data.get("source_transaction_id", f"TXN-{idx * 100 + 1042}")
        case_id_val = custom_data.get("case_id", _case_id(idx))
    else:
        reason_tuple = random.choice(PAYMENT_FAILURE_REASONS)
        root_cause, evidence_text, recovery_prob = reason_tuple
        amount = _random_amount(5000, 150000, 1000)
        prev_successful = random.randint(1, 10)
        attempt_count = random.randint(0, 2)
        days_since = random.randint(0, 3)
        severity = "CRITICAL" if float(amount) >= 100000 else ("HIGH" if float(amount) >= 30000 else "MEDIUM")
        
        if prev_successful > 3:
            recovery_prob = min(0.96, recovery_prob + 0.08)
        if attempt_count > 1:
            recovery_prob = max(0.10, recovery_prob - 0.15 * attempt_count)
        
        cust_id = random.choice(CUSTOMER_IDS)
        merch_id = random.choice(MERCHANT_IDS)
        tx_id = _tx_id(idx)
        case_id_val = _case_id(idx)

    created_at = _days_ago(days_since)

    # Compute genuine priority signals using PriorityScoringService
    p_info = PriorityScoringService.compute_priority(
        amount_at_risk=amount,
        recovery_probability=Decimal(str(round(recovery_prob, 2))),
        severity=severity,
        root_cause=root_cause,
        days_overdue=days_since,
        created_at=created_at,
        attempt_count=attempt_count,
        has_dispute=False,
        recovery_type="PAYMENT_FAILURE"
    )

    return {
        "case_id": case_id_val,
        "recovery_type": "PAYMENT_FAILURE",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": cust_id,
        "merchant_id": merch_id,
        "source_transaction_id": tx_id,
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.75 + random.random() * 0.20, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Gateway Response: {root_cause}",
            f"Previous retry attempts: {attempt_count}",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": p_info["priority_score"],
        "priority_level": p_info["priority_level"],
        "financial_impact_score": p_info["financial_impact_score"],
        "urgency_score": p_info["urgency_score"],
        "severity_score": p_info["severity_score"],
        "historical_multiplier": p_info["historical_multiplier"],
        "priority_reason": p_info["priority_reason"],
        "priority_breakdown": p_info["score_breakdown"],
        "priority_calculated_at": p_info["priority_calculated_at"],
        "attempt_count": attempt_count,
        "reminder_count": 0,
        "days_overdue": days_since,
        "has_dispute": False,
        "anomaly_score": round(random.random() * 0.35, 4),
        "created_at": created_at,
    }


def _make_checkout_abandonment(idx: int, custom_data: Dict[str, Any] = None) -> Dict[str, Any]:
    if custom_data:
        amount = Decimal(str(custom_data["amount_at_risk"]))
        root_cause = custom_data["root_cause"]
        evidence_text = custom_data.get("evidence", "Cart drop detected")
        recovery_prob = float(custom_data["recovery_probability"])
        severity = custom_data.get("severity", "MEDIUM")
        minutes_since = custom_data.get("minutes_since", 25)
        reminders = custom_data.get("reminder_count", 0)
        cust_id = custom_data.get("customer_id", random.choice(CUSTOMER_IDS))
        merch_id = custom_data.get("merchant_id", random.choice(MERCHANT_IDS))
        tx_id = custom_data.get("source_transaction_id", _tx_id(idx))
        case_id_val = custom_data.get("case_id", _case_id(idx))
    else:
        reason_tuple = random.choice(ABANDONMENT_TRIGGERS)
        root_cause, evidence_text, recovery_prob = reason_tuple
        amount = _random_amount(1500, 35000, 500)
        minutes_since = random.randint(10, 120)
        reminders = random.randint(0, 1)
        severity = "HIGH" if float(amount) >= 20000 else "MEDIUM"
        if minutes_since > 60:
            recovery_prob = max(0.20, recovery_prob - 0.12)
        cust_id = random.choice(CUSTOMER_IDS)
        merch_id = random.choice(MERCHANT_IDS)
        tx_id = _tx_id(idx)
        case_id_val = _case_id(idx)

    created_at = _days_ago(0)

    p_info = PriorityScoringService.compute_priority(
        amount_at_risk=amount,
        recovery_probability=Decimal(str(round(recovery_prob, 2))),
        severity=severity,
        root_cause=root_cause,
        days_overdue=0,
        created_at=created_at,
        attempt_count=0,
        has_dispute=False,
        recovery_type="CHECKOUT_ABANDONMENT"
    )

    return {
        "case_id": case_id_val,
        "recovery_type": "CHECKOUT_ABANDONMENT",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": cust_id,
        "merchant_id": merch_id,
        "source_transaction_id": tx_id,
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.70 + random.random() * 0.25, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Time since checkout abandonment: {minutes_since} mins",
            f"Reminders dispatched: {reminders}",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": p_info["priority_score"],
        "priority_level": p_info["priority_level"],
        "financial_impact_score": p_info["financial_impact_score"],
        "urgency_score": p_info["urgency_score"],
        "severity_score": p_info["severity_score"],
        "historical_multiplier": p_info["historical_multiplier"],
        "priority_reason": p_info["priority_reason"],
        "priority_breakdown": p_info["score_breakdown"],
        "priority_calculated_at": p_info["priority_calculated_at"],
        "attempt_count": 0,
        "reminder_count": reminders,
        "days_overdue": 0,
        "has_dispute": False,
        "anomaly_score": round(random.random() * 0.25, 4),
        "created_at": created_at,
    }


def _make_overdue_receivable(idx: int, custom_data: Dict[str, Any] = None) -> Dict[str, Any]:
    if custom_data:
        amount = Decimal(str(custom_data["amount_at_risk"]))
        root_cause = custom_data["root_cause"]
        evidence_text = custom_data.get("evidence", "Overdue ledger balance")
        recovery_prob = float(custom_data["recovery_probability"])
        severity = custom_data.get("severity", "HIGH")
        days_overdue = custom_data.get("days_overdue", 12)
        reminders = custom_data.get("reminder_count", 1)
        has_dispute = custom_data.get("has_dispute", False)
        cust_id = custom_data.get("customer_id", random.choice(CUSTOMER_IDS))
        merch_id = custom_data.get("merchant_id", random.choice(MERCHANT_IDS))
        tx_id = custom_data.get("source_transaction_id", _tx_id(idx))
        case_id_val = custom_data.get("case_id", _case_id(idx))
    else:
        reason_tuple = random.choice(OVERDUE_REASONS)
        root_cause, evidence_text, recovery_prob = reason_tuple
        amount = _random_amount(10000, 300000, 5000)
        days_overdue = random.randint(3, 30)
        reminders = random.randint(0, 2)
        severity = (
            "CRITICAL" if float(amount) >= 150000 else
            "HIGH"     if float(amount) >= 50000 else "MEDIUM"
        )
        has_dispute = random.random() < 0.05
        if days_overdue > 20:
            recovery_prob = max(0.15, recovery_prob - 0.12)
        cust_id = random.choice(CUSTOMER_IDS)
        merch_id = random.choice(MERCHANT_IDS)
        tx_id = _tx_id(idx)
        case_id_val = _case_id(idx)

    created_at = _days_ago(days_overdue)

    p_info = PriorityScoringService.compute_priority(
        amount_at_risk=amount,
        recovery_probability=Decimal(str(round(recovery_prob, 2))),
        severity=severity,
        root_cause=root_cause,
        days_overdue=days_overdue,
        created_at=created_at,
        attempt_count=reminders,
        has_dispute=has_dispute,
        recovery_type="OVERDUE_RECEIVABLE"
    )

    return {
        "case_id": case_id_val,
        "recovery_type": "OVERDUE_RECEIVABLE",
        "severity": severity,
        "amount_at_risk": float(amount),
        "customer_id": cust_id,
        "merchant_id": merch_id,
        "source_transaction_id": tx_id,
        "root_cause": root_cause,
        "diagnosis_confidence": round(0.70 + random.random() * 0.25, 2),
        "diagnosis_evidence": [
            evidence_text,
            f"Overdue window: {days_overdue} days",
            f"Reminders issued: {reminders}",
        ],
        "recovery_probability": round(recovery_prob, 2),
        "priority_score": p_info["priority_score"],
        "priority_level": p_info["priority_level"],
        "financial_impact_score": p_info["financial_impact_score"],
        "urgency_score": p_info["urgency_score"],
        "severity_score": p_info["severity_score"],
        "historical_multiplier": p_info["historical_multiplier"],
        "priority_reason": p_info["priority_reason"],
        "priority_breakdown": p_info["score_breakdown"],
        "priority_calculated_at": p_info["priority_calculated_at"],
        "attempt_count": reminders,
        "reminder_count": reminders,
        "days_overdue": days_overdue,
        "has_dispute": has_dispute,
        "anomaly_score": round(random.random() * 0.40, 4),
        "created_at": created_at,
    }


def generate_recovery_batch(
    payment_failures: int = 30,
    checkout_abandonments: int = 25,
    overdue_receivables: int = 25,
) -> List[Dict[str, Any]]:
    """
    Generate a complete synthetic recovery batch with priority ranking.
    Includes controlled benchmark demonstration cases.
    """
    cases: List[Dict[str, Any]] = []

    # Inject Flagship Demonstration Cases (Section 22 of specification)
    # Demo Case 1: P0 Critical — ₹8,50,000, 94% prob, Urgency HIGH
    cases.append(_make_payment_failure(1, {
        "case_id": "REC-1042-P0",
        "source_transaction_id": "TXN-1042",
        "customer_id": "CUST-10420",
        "amount_at_risk": 850000.0,
        "recovery_probability": 0.94,
        "severity": "CRITICAL",
        "root_cause": "TEMPORARY_BANK_FAILURE",
        "evidence": "Issuing bank NPCI gateway timeout during high-volume window; card is fully active",
        "days_overdue": 0,
        "attempt_count": 0
    }))

    # Demo Case 2: P1 High — ₹2,40,000, 89% prob, Urgency HIGH
    cases.append(_make_overdue_receivable(2, {
        "case_id": "REC-1088-P1",
        "source_transaction_id": "SETTL-9821",
        "customer_id": "CUST-10884",
        "amount_at_risk": 240000.0,
        "recovery_probability": 0.89,
        "severity": "HIGH",
        "root_cause": "SETTLEMENT_DELAY",
        "evidence": "Settlement batch shortfall due to intermediate gateway delay",
        "days_overdue": 1,
        "reminder_count": 0
    }))

    # Demo Case 3: P2 / Moderate — ₹5,00,000, 35% prob, Urgency LOW
    # Proves "highest amount != highest priority"
    cases.append(_make_payment_failure(3, {
        "case_id": "REC-1099-P2",
        "source_transaction_id": "TXN-5001",
        "customer_id": "CUST-10991",
        "amount_at_risk": 500000.0,
        "recovery_probability": 0.35,
        "severity": "MEDIUM",
        "root_cause": "PAYMENT_METHOD_DECLINED",
        "evidence": "Card declined repeatedly for high-risk velocity check",
        "days_overdue": 5,
        "attempt_count": 2
    }))

    # Demo Case 4: P2 Partial — ₹1,10,000, 71% prob
    cases.append(_make_payment_failure(4, {
        "case_id": "REC-1102-P2",
        "source_transaction_id": "TXN-7721",
        "customer_id": "CUST-11020",
        "amount_at_risk": 110000.0,
        "recovery_probability": 0.71,
        "severity": "MEDIUM",
        "root_cause": "GATEWAY_TECHNICAL_FAILURE",
        "evidence": "Intermittent 503 response from core aggregator rail",
        "days_overdue": 1,
        "attempt_count": 1
    }))

    # Demo Case 5: P3 Low — ₹18,000, 28% score
    cases.append(_make_payment_failure(5, {
        "case_id": "REC-1150-P3",
        "source_transaction_id": "TXN-3312",
        "customer_id": "CUST-11502",
        "amount_at_risk": 18000.0,
        "recovery_probability": 0.30,
        "severity": "LOW",
        "root_cause": "EXPIRED_PAYMENT_METHOD",
        "evidence": "Customer debit card expired past valid month",
        "days_overdue": 8,
        "attempt_count": 2
    }))

    # Demo Case 6: ₹25,000, 96% prob
    cases.append(_make_checkout_abandonment(6, {
        "case_id": "REC-1180-P2",
        "source_transaction_id": "ORD-9912",
        "customer_id": "CUST-11805",
        "amount_at_risk": 25000.0,
        "recovery_probability": 0.96,
        "severity": "MEDIUM",
        "root_cause": "CUSTOMER_ABANDONMENT",
        "evidence": "High-intent customer dropped at OTP verification; session active within 15 min",
        "minutes_since": 15,
        "reminder_count": 0
    }))

    idx = 7
    # Generate remaining batch cases
    for _ in range(max(0, payment_failures - 4)):
        cases.append(_make_payment_failure(idx))
        idx += 1

    for _ in range(max(0, checkout_abandonments - 1)):
        cases.append(_make_checkout_abandonment(idx))
        idx += 1

    for _ in range(max(0, overdue_receivables - 1)):
        cases.append(_make_overdue_receivable(idx))
        idx += 1

    # Shuffle for realistic queue presentation
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
