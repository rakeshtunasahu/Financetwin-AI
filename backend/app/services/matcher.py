from decimal import Decimal
from typing import List, Dict, Any, Optional
from datetime import date
from backend.app.models.entities import SettlementBatch, BankTransaction, SettlementLineItem
from backend.app.core.config import settings
from backend.app.utils.money import to_decimal, is_amount_close
from backend.app.utils.dates import days_between, is_date_within_tolerance
from backend.app.utils.scoring import (
    calculate_reference_similarity,
    calculate_amount_similarity,
    calculate_date_proximity_score,
    calculate_fuzzy_match_score
)

def verify_batch_integrity(batch: SettlementBatch, tolerance: Decimal = Decimal("0.05")) -> bool:
    # Pass 0: Verify line items sum roughly equals batch net amount
    if not batch.line_items:
        return True # If no line items, bypass (e.g. empty batch)
        
    line_sum = sum(to_decimal(item.net_contribution) for item in batch.line_items)
    batch_net = to_decimal(batch.net_amount)
    
    # Financial integrity validation
    if abs(line_sum - batch_net) > tolerance:
        return False
    return True

def match_batch(
    batch: SettlementBatch,
    bank_transactions: List[BankTransaction],
    policy: dict = None
) -> Dict[str, Any]:
    # Extract configurations from policy or defaults
    min_match_conf = policy.get("minimum_match_confidence", settings.MINIMUM_MATCH_CONFIDENCE) if policy else settings.MINIMUM_MATCH_CONFIDENCE
    min_margin = policy.get("minimum_confidence_margin", settings.MINIMUM_CONFIDENCE_MARGIN) if policy else settings.MINIMUM_CONFIDENCE_MARGIN
    amt_tolerance = to_decimal(policy.get("amount_tolerance", settings.AMOUNT_TOLERANCE) if policy else settings.AMOUNT_TOLERANCE)
    date_tolerance = policy.get("date_tolerance_days", settings.DATE_TOLERANCE_DAYS) if policy else settings.DATE_TOLERANCE_DAYS

    explainability = {
        "pass_0_integrity_passed": True,
        "rejection_reason": None,
        "scoring_pass": 0,
        "candidate_scores": [],
        "second_best_score": 0.0,
        "selected_candidate_id": None
    }

    # --- PASS 0: Integrity Verification ---
    if not verify_batch_integrity(batch, tolerance=amt_tolerance):
        explainability["pass_0_integrity_passed"] = False
        explainability["rejection_reason"] = "BATCH_INTEGRITY_FAIL: Line items contribution sum does not equal batch net amount."
        return {
            "decision": "EXCEPTION",
            "match_type": "INTEGRITY_VIOLATION",
            "confidence": Decimal("0.0000"),
            "second_best_confidence": Decimal("0.0000"),
            "confidence_margin": Decimal("0.0000"),
            "matching_pass": 0,
            "bank_transaction_id": None,
            "explainability_json": explainability
        }

    # --- PASS 1: Exact Reference/UTR Match ---
    if batch.utr:
        for tx in bank_transactions:
            # Check credit amount is > 0 and matches expected net_amount
            tx_amount = to_decimal(tx.credit_amount)
            if tx_amount > 0 and is_amount_close(tx_amount, batch.net_amount, amt_tolerance):
                # Clean UTR reference comparison
                ref_sim = calculate_reference_similarity(batch.utr, tx.reference)
                if ref_sim == 1.0:
                    explainability["scoring_pass"] = 1
                    explainability["selected_candidate_id"] = tx.bank_transaction_id
                    return {
                        "decision": "MATCH",
                        "match_type": "EXACT",
                        "confidence": Decimal("1.0000"),
                        "second_best_confidence": Decimal("0.0000"),
                        "confidence_margin": Decimal("1.0000"),
                        "matching_pass": 1,
                        "bank_transaction_id": tx.id,
                        "explainability_json": explainability
                    }

    # --- PASS 2: Exact Amount + Date Proximity Match ---
    # Look for bank credits that match the amount exactly and date within tolerance (T+2)
    p2_candidates = []
    for tx in bank_transactions:
        tx_amount = to_decimal(tx.credit_amount)
        if tx_amount > 0 and is_amount_close(tx_amount, batch.net_amount, amt_tolerance):
            if is_date_within_tolerance(batch.expected_credit_date, tx.transaction_date, date_tolerance):
                p2_candidates.append(tx)

    if len(p2_candidates) == 1:
        tx = p2_candidates[0]
        explainability["scoring_pass"] = 2
        explainability["selected_candidate_id"] = tx.bank_transaction_id
        return {
            "decision": "MATCH",
            "match_type": "AMOUNT_DATE",
            "confidence": Decimal("0.9800"),
            "second_best_confidence": Decimal("0.0000"),
            "confidence_margin": Decimal("0.9800"),
            "matching_pass": 2,
            "bank_transaction_id": tx.id,
            "explainability_json": explainability
        }
    elif len(p2_candidates) > 1:
        # Multiple candidates found for same amount & date: Abstain to prevent false matching!
        explainability["scoring_pass"] = 2
        explainability["rejection_reason"] = "AMBIGUITY_GATE: Multiple bank transactions found matching expected amount and date window."
        return {
            "decision": "ABSTAIN",
            "match_type": "AMOUNT_DATE_AMBIGUOUS",
            "confidence": Decimal("0.9800"),
            "second_best_confidence": Decimal("0.9800"),
            "confidence_margin": Decimal("0.0000"),
            "matching_pass": 2,
            "bank_transaction_id": None,
            "explainability_json": explainability
        }

    # --- PASS 3 & 4: Fuzzy Scoring and Ambiguity Safety Gate ---
    candidate_scores = []
    
    for tx in bank_transactions:
        tx_amount = to_decimal(tx.credit_amount)
        if tx_amount <= 0:
            continue
            
        # 1. Reference similarity (UTR vs bank reference)
        ref_sim = calculate_reference_similarity(batch.utr, tx.reference) if batch.utr else 0.0
        
        # 2. Amount similarity
        amt_sim = calculate_amount_similarity(batch.net_amount, tx_amount)
        
        # 3. Date proximity
        date_sim = calculate_date_proximity_score(batch.expected_credit_date, tx.transaction_date, max_days=7)
        
        # 4. Metadata similarity (UTR / ID vs description)
        desc_sim = 0.0
        if tx.description:
            # Check if UTR is in description or compare fuzzy
            if batch.utr and batch.utr.upper() in tx.description.upper():
                desc_sim = 1.0
            else:
                desc_sim = calculate_reference_similarity(batch.utr or batch.settlement_id, tx.description)

        # Calculate final score
        final_score = calculate_fuzzy_match_score(ref_sim, amt_sim, date_sim, desc_sim)
        
        candidate_scores.append({
            "tx_db_id": tx.id,
            "tx_id": tx.bank_transaction_id,
            "score": final_score,
            "breakdown": {
                "reference": ref_sim,
                "amount": amt_sim,
                "date": date_sim,
                "metadata": desc_sim
            }
        })

    # Sort descending by score
    candidate_scores.sort(key=lambda x: x["score"], reverse=True)
    explainability["candidate_scores"] = candidate_scores[:5] # keep top 5

    if not candidate_scores:
        explainability["rejection_reason"] = "NO_CANDIDATES: No bank transaction credits available."
        return {
            "decision": "NO_MATCH",
            "match_type": "FUZZY",
            "confidence": Decimal("0.0000"),
            "second_best_confidence": Decimal("0.0000"),
            "confidence_margin": Decimal("0.0000"),
            "matching_pass": 3,
            "bank_transaction_id": None,
            "explainability_json": explainability
        }

    best_candidate = candidate_scores[0]
    best_score = best_candidate["score"]
    
    second_best_score = candidate_scores[1]["score"] if len(candidate_scores) > 1 else 0.0
    confidence_margin = best_score - second_best_score
    
    explainability["second_best_score"] = second_best_score
    explainability["selected_candidate_id"] = best_candidate["tx_id"]

    # PASS 4: Ambiguity Safety Gate
    if best_score < min_match_conf:
        explainability["rejection_reason"] = f"SAFETY_GATE_FAIL: Best candidate confidence ({best_score:.4f}) is below minimum match confidence ({min_match_conf:.4f})."
        return {
            "decision": "ABSTAIN",
            "match_type": "FUZZY",
            "confidence": Decimal(f"{best_score:.4f}"),
            "second_best_confidence": Decimal(f"{second_best_score:.4f}"),
            "confidence_margin": Decimal(f"{confidence_margin:.4f}"),
            "matching_pass": 4,
            "bank_transaction_id": None,
            "explainability_json": explainability
        }

    if confidence_margin < min_margin:
        explainability["rejection_reason"] = f"SAFETY_GATE_FAIL: Confidence margin ({confidence_margin:.4f}) is below minimum margin ({min_margin:.4f}). Too ambiguous."
        return {
            "decision": "ABSTAIN",
            "match_type": "FUZZY_AMBIGUOUS",
            "confidence": Decimal(f"{best_score:.4f}"),
            "second_best_confidence": Decimal(f"{second_best_score:.4f}"),
            "confidence_margin": Decimal(f"{confidence_margin:.4f}"),
            "matching_pass": 4,
            "bank_transaction_id": None,
            "explainability_json": explainability
        }

    # High-confidence matched candidate
    return {
        "decision": "MATCH",
        "match_type": "FUZZY",
        "confidence": Decimal(f"{best_score:.4f}"),
        "second_best_confidence": Decimal(f"{second_best_score:.4f}"),
        "confidence_margin": Decimal(f"{confidence_margin:.4f}"),
        "matching_pass": 3,
        "bank_transaction_id": best_candidate["tx_db_id"],
        "explainability_json": explainability
    }
