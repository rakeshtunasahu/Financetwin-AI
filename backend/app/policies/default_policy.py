import os
import json
from backend.app.core.config import settings

POLICY_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "active_policy.json"
)

DEFAULT_POLICY = {
    # ── Reconciliation matching thresholds ───────────────────────────────────
    "minimum_match_confidence": settings.MINIMUM_MATCH_CONFIDENCE,
    "minimum_confidence_margin": settings.MINIMUM_CONFIDENCE_MARGIN,
    "max_auto_resolve_amount": settings.MAX_AUTO_RESOLVE_AMOUNT,
    "high_value_transaction_threshold": settings.HIGH_VALUE_TRANSACTION_THRESHOLD,
    "amount_tolerance": settings.AMOUNT_TOLERANCE,
    "date_tolerance_days": settings.DATE_TOLERANCE_DAYS,
    "tax_rate": settings.TAX_RATE,
    "severity_weight_low": 0.5,
    "severity_weight_medium": 1.0,
    "severity_weight_high": 2.0,
    "severity_weight_critical": 5.0,

    # ── RevenueRescue AI — Recovery Guardrails ───────────────────────────────
    # Maximum number of payment retry attempts per recovery case
    "max_payment_retries": 3,
    # Maximum number of customer reminders/chasers per recovery case
    "max_customer_reminders": 3,
    # Maximum days before a recovery workflow expires automatically
    "max_workflow_duration_days": 7,
    # Cases above this amount (INR) must be escalated to a human reviewer
    "high_value_escalation_threshold": 50000.0,
    # Maximum number of broken promise-to-pay commitments before escalation
    "max_promise_to_pay_misses": 2,
    # Minimum hours between consecutive retry attempts (cooldown period)
    "retry_cooldown_hours": 24,

    # ── AI Recovery Priority Engine Thresholds & Weights ─────────────────────
    "p0_threshold": 85.0,
    "p1_threshold": 70.0,
    "p2_threshold": 40.0,
    "weight_financial_impact": 0.35,
    "weight_recovery_probability": 0.35,
    "weight_urgency": 0.15,
    "weight_severity": 0.15,
}

def get_active_policy() -> dict:
    if os.path.exists(POLICY_FILE_PATH):
        try:
            with open(POLICY_FILE_PATH, "r") as f:
                policy = json.load(f)
                # Ensure all default keys exist
                for k, v in DEFAULT_POLICY.items():
                    if k not in policy:
                        policy[k] = v
                return policy
        except Exception:
            return DEFAULT_POLICY.copy()
    return DEFAULT_POLICY.copy()

def save_policy(policy_data: dict):
    os.makedirs(os.path.dirname(POLICY_FILE_PATH), exist_ok=True)
    with open(POLICY_FILE_PATH, "w") as f:
        json.dump(policy_data, f, indent=4)
