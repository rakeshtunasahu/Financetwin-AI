from decimal import Decimal
from typing import Dict, Any
from backend.app.utils.money import to_decimal

def classify_exception(
    expected_amount: Decimal,
    actual_amount: Decimal,
    days_delayed: int,
    has_reference: bool,
    has_duplicate_ref: bool,
    has_multiple_candidates: bool,
    line_item_integrity_failed: bool
) -> Dict[str, Any]:
    expected = to_decimal(expected_amount)
    actual = to_decimal(actual_amount)
    variance = actual - expected
    
    if line_item_integrity_failed:
        return {
            "type": "FEE_MISMATCH",
            "severity": "CRITICAL",
            "reason": "Financial integrity check failed. Line items sum does not equal batch net amount."
        }
    
    if has_duplicate_ref:
        return {
            "type": "DUPLICATE_CREDIT",
            "severity": "HIGH",
            "reason": "Multiple bank credits found with the same reference/UTR, indicating duplicate transmission."
        }
        
    if has_multiple_candidates:
        return {
            "type": "AMBIGUOUS_MATCH",
            "severity": "MEDIUM",
            "reason": "Multiple matching bank transaction candidates exist with identical amounts, creating ambiguity."
        }
        
    if expected > 0 and actual == 0:
        # No matching bank transaction
        return {
            "type": "UNKNOWN_ANOMALY",
            "severity": "HIGH",
            "reason": "No matching bank transaction found for this expected settlement."
        }
        
    if not has_reference:
        return {
            "type": "MISSING_REFERENCE",
            "severity": "LOW",
            "reason": "Bank credit matches expected amount, but bank transaction details lack the PG settlement reference/UTR."
        }
        
    if abs(variance) > Decimal("0.01"):
        if actual < expected:
            return {
                "type": "PARTIAL_SETTLEMENT",
                "severity": "HIGH",
                "reason": f"Underpayment detected. Expected {expected}, got {actual}. Variance: {variance}."
            }
        else:
            return {
                "type": "FEE_MISMATCH",
                "severity": "MEDIUM",
                "reason": f"Overpayment detected. Expected {expected}, got {actual}. Variance: {variance}."
            }
            
    if days_delayed > 2:
        return {
            "type": "SETTLEMENT_DELAY",
            "severity": "LOW",
            "reason": f"Settlement delay detected. Credited {days_delayed} days after settlement date."
        }
        
    return {
        "type": "UNKNOWN_ANOMALY",
        "severity": "MEDIUM",
        "reason": "Unidentified reconciliation exception."
    }
