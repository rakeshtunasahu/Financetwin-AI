from decimal import Decimal
from backend.app.core.config import settings

def calculate_risk_score(
    amount: Decimal,
    match_confidence: float,
    exception_severity: str,
    exception_type: str,
    policy: dict = None,
    historical_risk_multiplier: float = 1.0
) -> float:
    # Read settings/policy
    high_value_threshold = float(policy.get("high_value_transaction_threshold", settings.HIGH_VALUE_TRANSACTION_THRESHOLD) if policy else settings.HIGH_VALUE_TRANSACTION_THRESHOLD)
    
    amt_val = float(amount)
    normalized_amount = min(amt_val / high_value_threshold, 1.0)
    
    # Match uncertainty
    uncertainty = 1.0 - float(match_confidence)
    
    # Severity weight mapping
    severity_weights = {
        "LOW": policy.get("severity_weight_low", 0.5) if policy else 0.5,
        "MEDIUM": policy.get("severity_weight_medium", 1.0) if policy else 1.0,
        "HIGH": policy.get("severity_weight_high", 2.0) if policy else 2.0,
        "CRITICAL": policy.get("severity_weight_critical", 5.0) if policy else 5.0,
    }
    weight = severity_weights.get(exception_severity.upper(), 1.0)
    
    base_risk = normalized_amount * weight * uncertainty
    final_risk = base_risk * historical_risk_multiplier
    
    return min(1.0, max(0.0, final_risk))

def recommend_action(
    amount: Decimal,
    match_confidence: float,
    exception_severity: str,
    exception_type: str,
    risk_score: float,
    policy: dict = None
) -> str:
    # Read policy thresholds
    max_auto_resolve = float(policy.get("max_auto_resolve_amount", settings.MAX_AUTO_RESOLVE_AMOUNT) if policy else settings.MAX_AUTO_RESOLVE_AMOUNT)
    min_match_conf = float(policy.get("minimum_match_confidence", settings.MINIMUM_MATCH_CONFIDENCE) if policy else settings.MINIMUM_MATCH_CONFIDENCE)
    
    amt_val = float(amount)
    
    # High risk or critical exceptions must require manual intervention
    if exception_severity == "CRITICAL" or amt_val > max_auto_resolve:
        return "MANUAL_REVIEW"
        
    if risk_score > 0.6:
        return "MANUAL_REVIEW"
        
    # Standard disputes
    if exception_type in ("PARTIAL_SETTLEMENT", "DUPLICATE_CREDIT"):
        return "GENERATE_DISPUTE"
        
    # Safe auto-resolution
    if match_confidence >= min_match_conf and risk_score < 0.2:
        return "AUTO_RESOLVE"
        
    # Delayed settlements can wait
    if exception_type == "SETTLEMENT_DELAY":
        return "WAIT_AND_MONITOR"
        
    return "MANUAL_REVIEW"
