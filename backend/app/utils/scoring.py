from decimal import Decimal
from datetime import date
from rapidfuzz import fuzz
from backend.app.utils.money import to_decimal
from backend.app.utils.dates import days_between

def calculate_reference_similarity(ref1: str, ref2: str) -> float:
    if not ref1 or not ref2:
        return 0.0
    r1 = str(ref1).strip().upper()
    r2 = str(ref2).strip().upper()
    
    # Exact match
    if r1 == r2:
        return 1.0
        
    ratio = fuzz.ratio(r1, r2) / 100.0
    partial = fuzz.partial_ratio(r1, r2) / 100.0
    token_sort = fuzz.token_sort_ratio(r1, r2) / 100.0
    
    return max(ratio, partial, token_sort)

def calculate_amount_similarity(amt1: Decimal, amt2: Decimal) -> float:
    a1 = float(to_decimal(amt1))
    a2 = float(to_decimal(amt2))
    if a1 <= 0 or a2 <= 0:
        return 0.0
    
    diff = abs(a1 - a2)
    max_val = max(a1, a2)
    
    if diff == 0:
        return 1.0
    
    # Penalty based on relative variance
    score = 1.0 - (diff / max_val)
    return max(0.0, score)

def calculate_date_proximity_score(date1: date, date2: date, max_days: int = 7) -> float:
    days = days_between(date1, date2)
    if days > max_days:
        return 0.0
    return max(0.0, 1.0 - (days / max_days))

def calculate_fuzzy_match_score(
    ref_similarity: float,
    amount_similarity: float,
    date_proximity: float,
    metadata_similarity: float,
    weights: dict = None
) -> float:
    if weights is None:
        weights = {
            "reference": 0.40,
            "amount": 0.35,
            "date": 0.15,
            "metadata": 0.10
        }
    
    score = (
        ref_similarity * weights.get("reference", 0.40) +
        amount_similarity * weights.get("amount", 0.35) +
        date_proximity * weights.get("date", 0.15) +
        metadata_similarity * weights.get("metadata", 0.10)
    )
    return min(1.0, max(0.0, float(score)))
