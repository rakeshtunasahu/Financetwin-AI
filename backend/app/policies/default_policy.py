import os
import json
from backend.app.core.config import settings

POLICY_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "active_policy.json"
)

DEFAULT_POLICY = {
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
    "severity_weight_critical": 5.0
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
