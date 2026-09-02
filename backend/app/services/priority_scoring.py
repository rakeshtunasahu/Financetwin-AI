"""
RevenueRescue AI — AI-Driven Revenue Recovery Priority Scoring Engine
Calculates explainable, multi-factor recovery priority scores (0–100) and classifications (P0–P3).
Follows principle: Financial Impact × Recoverability × Urgency × Failure Severity × Historical Behavior.
"""
from decimal import Decimal
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import math

from backend.app.policies.default_policy import get_active_policy


class PriorityLevel:
    P0_CRITICAL = "P0"
    P1_HIGH     = "P1"
    P2_MEDIUM   = "P2"
    P3_LOW      = "P3"

    ALL = [P0_CRITICAL, P1_HIGH, P2_MEDIUM, P3_LOW]


# Historical Yield Benchmarks for Failure Categories
HISTORICAL_MULTIPLIERS = {
    # High recovery yield categories (e.g. temporary technical blips, webhooks, immediate cart drops)
    "TEMPORARY_BANK_FAILURE": 1.08,
    "NETWORK_TIMEOUT": 1.06,
    "GATEWAY_TECHNICAL_FAILURE": 1.05,
    "CUSTOMER_ABANDONMENT": 1.04,
    "SETTLEMENT_DELAY": 1.05,
    "FEE_MISMATCH": 1.02,

    # Moderate recovery yield
    "INVOICE_OVERDUE": 1.00,
    "MANDATE_FAILURE": 0.98,
    "INSUFFICIENT_FUNDS": 0.92,
    "EXPIRED_PAYMENT_METHOD": 0.90,

    # Low recovery yield / high friction categories
    "PROMISE_TO_PAY_MISSED": 0.85,
    "PAYMENT_METHOD_DECLINED": 0.82,
    "PERMANENT_FAILURE": 0.75,
    "INTEGRITY_VIOLATION": 0.70,
    "UNKNOWN_REQUIRES_REVIEW": 1.00
}


class PriorityScoringService:
    """
    Deterministic & Explainable Priority Engine.
    Computes priority scores [0.0 - 100.0] and priority levels [P0, P1, P2, P3].
    """

    @staticmethod
    def calculate_financial_impact(amount: Decimal, threshold: float = 50000.0) -> float:
        """
        Normalize amount at risk into 0.0 - 1.0 range with logarithmic smooth scaling.
        Guarantees that large amounts approach 1.0 without infinite scaling.
        """
        amt_float = max(0.0, float(amount))
        if amt_float <= 0:
            return 0.0

        # Sub-threshold: linear proportion up to 0.65
        # Above threshold: smooth asymptotic curve to 1.0
        if amt_float < threshold:
            normalized = (amt_float / threshold) * 0.65
        else:
            # Scale beyond threshold up to 5x threshold
            excess_ratio = (amt_float - threshold) / (threshold * 4.0)
            normalized = 0.65 + (0.35 * min(1.0, excess_ratio ** 0.6))

        return round(min(1.0, max(0.05, normalized)), 4)

    @staticmethod
    def calculate_urgency_score(
        days_overdue: Optional[int] = None,
        created_at: Optional[datetime] = None,
        attempt_count: int = 0,
        has_dispute: bool = False,
        recovery_type: Optional[str] = None
    ) -> float:
        """
        Computes urgency score [0.0 - 1.0] based on age, retry urgency, and deadlines.
        """
        urgency = 0.50  # baseline medium

        # Age / days overdue factor
        effective_days = days_overdue if days_overdue is not None else 0
        if created_at and effective_days == 0:
            age_hours = (datetime.utcnow() - created_at).total_seconds() / 3600.0
            effective_days = int(age_hours / 24.0)

        if effective_days <= 1:
            # Fresh failure: highest recovery window
            urgency += 0.35
        elif effective_days <= 3:
            urgency += 0.20
        elif effective_days <= 7:
            urgency += 0.05
        else:
            urgency -= 0.15  # stale / aged risk

        # Repetition urgency
        if attempt_count == 1:
            urgency += 0.10  # fast follow-up needed
        elif attempt_count >= 2:
            urgency -= 0.10  # diminishing urgency / approaching limit

        # Disputes require prompt handling
        if has_dispute:
            urgency += 0.15

        # Type-specific urgency
        if recovery_type == "CHECKOUT_ABANDONMENT":
            # Cart abandonment is time-critical (first 24h)
            if effective_days <= 1:
                urgency += 0.15
        elif recovery_type == "MANDATE_FAILURE":
            urgency += 0.05

        return round(min(1.0, max(0.15, urgency)), 4)

    @staticmethod
    def calculate_severity_score(severity: str) -> float:
        """
        Maps severity string to normalized float score.
        """
        sev_upper = str(severity).upper().strip()
        mapping = {
            "CRITICAL": 1.00,
            "HIGH":     0.85,
            "MEDIUM":   0.60,
            "LOW":      0.30
        }
        return mapping.get(sev_upper, 0.60)

    @staticmethod
    def get_historical_multiplier(root_cause: Optional[str]) -> Tuple[float, str]:
        """
        Returns (multiplier, label) indicating historical recovery strength.
        """
        if not root_cause:
            return 1.00, "Baseline (No historical telemetry)"

        rc_clean = str(root_cause).upper().strip()
        mult = HISTORICAL_MULTIPLIERS.get(rc_clean, 1.00)

        if mult >= 1.05:
            label = "Strong historical recovery yield"
        elif mult <= 0.88:
            label = "Low historical recovery yield"
        else:
            label = "Standard historical baseline"

        return round(mult, 4), label

    @classmethod
    def compute_priority(
        cls,
        amount_at_risk: Decimal,
        recovery_probability: Optional[Decimal] = None,
        severity: str = "MEDIUM",
        root_cause: Optional[str] = None,
        days_overdue: Optional[int] = None,
        created_at: Optional[datetime] = None,
        attempt_count: int = 0,
        has_dispute: bool = False,
        recovery_type: Optional[str] = None,
        policy: Optional[dict] = None
    ) -> Dict[str, Any]:
        """
        Evaluates the complete priority model and returns score, level, breakdown, and explanation.
        """
        p = get_active_policy()
        if policy:
            p.update(policy)

        high_val_thresh = float(p.get("high_value_escalation_threshold", 50000.0))
        p0_thresh = float(p.get("p0_threshold", 85.0))
        p1_thresh = float(p.get("p1_threshold", 70.0))
        p2_thresh = float(p.get("p2_threshold", 40.0))

        w_fin = float(p.get("weight_financial_impact", 0.35))
        w_prob = float(p.get("weight_recovery_probability", 0.35))
        w_urg = float(p.get("weight_urgency", 0.15))
        w_sev = float(p.get("weight_severity", 0.15))

        # Ensure weights normalize to 1.0
        total_w = w_fin + w_prob + w_urg + w_sev
        if total_w > 0:
            w_fin /= total_w
            w_prob /= total_w
            w_urg /= total_w
            w_sev /= total_w

        # 1. Financial Impact Score
        fin_score = cls.calculate_financial_impact(amount_at_risk, high_val_thresh)

        # 2. Recovery Probability Score (default 0.50 if not yet diagnosed)
        prob_float = float(recovery_probability) if recovery_probability is not None else 0.50
        prob_score = min(1.0, max(0.05, round(prob_float, 4)))

        # 3. Urgency Score
        urg_score = cls.calculate_urgency_score(
            days_overdue=days_overdue,
            created_at=created_at,
            attempt_count=attempt_count,
            has_dispute=has_dispute,
            recovery_type=recovery_type
        )

        # 4. Severity Score
        sev_score = cls.calculate_severity_score(severity)

        # 5. Historical Multiplier
        hist_mult, hist_label = cls.get_historical_multiplier(root_cause)

        # 6. Composite Score Calculation
        # Expected Recovery Value Component (Financial × Recoverability)
        expected_value_factor = fin_score * prob_score

        # Blended weighted component
        weighted_component = (
            w_fin * fin_score +
            w_prob * prob_score +
            w_urg * urg_score +
            w_sev * sev_score
        )

        # Combined synergy: 55% expected value focus + 45% multi-factor balance
        base_score = (0.55 * expected_value_factor + 0.45 * weighted_component) * 100.0

        # Apply historical multiplier
        final_score = round(min(100.0, max(0.0, base_score * hist_mult)), 1)

        # 7. Priority Level Assignment
        if final_score >= p0_thresh:
            level = PriorityLevel.P0_CRITICAL
        elif final_score >= p1_thresh:
            level = PriorityLevel.P1_HIGH
        elif final_score >= p2_thresh:
            level = PriorityLevel.P2_MEDIUM
        else:
            level = PriorityLevel.P3_LOW

        # 8. Generate Structured Explanation
        reason = cls.generate_priority_reason(
            amount=amount_at_risk,
            priority_score=final_score,
            priority_level=level,
            recovery_probability=prob_score,
            urgency_score=urg_score,
            severity_score=sev_score,
            historical_multiplier=hist_mult,
            root_cause=root_cause
        )

        return {
            "priority_score": final_score,
            "priority_level": level,
            "financial_impact_score": fin_score,
            "recovery_probability": prob_score,
            "urgency_score": urg_score,
            "severity_score": sev_score,
            "historical_multiplier": hist_mult,
            "historical_label": hist_label,
            "priority_reason": reason,
            "score_breakdown": {
                "financial_impact_pct": round(fin_score * 100, 1),
                "recovery_probability_pct": round(prob_score * 100, 1),
                "urgency_score_pct": round(urg_score * 100, 1),
                "severity_score_pct": round(sev_score * 100, 1),
                "historical_multiplier_pct": round(hist_mult * 100, 1),
                "weights": {
                    "financial": round(w_fin * 100, 0),
                    "probability": round(w_prob * 100, 0),
                    "urgency": round(w_urg * 100, 0),
                    "severity": round(w_sev * 100, 0)
                }
            },
            "priority_calculated_at": datetime.utcnow()
        }

    @staticmethod
    def generate_priority_reason(
        amount: Decimal,
        priority_score: float,
        priority_level: str,
        recovery_probability: float,
        urgency_score: float,
        severity_score: float,
        historical_multiplier: float,
        root_cause: Optional[str]
    ) -> str:
        """
        Creates a coherent, numbers-grounded explanation of why this case was prioritized.
        """
        amt_k = float(amount)
        amt_str = f"₹{amt_k:,.0f}" if amt_k < 100000 else f"₹{amt_k/100000:.2f}L"

        prob_pct = int(recovery_probability * 100)
        urg_desc = "critical immediate urgency" if urgency_score >= 0.85 else (
            "moderate urgency" if urgency_score >= 0.55 else "low time sensitivity"
        )

        if priority_level == PriorityLevel.P0_CRITICAL:
            return (
                f"High financial exposure of {amt_str} combined with strong {prob_pct}% recovery likelihood "
                f"and {urg_desc} makes this the highest-value immediate recovery opportunity."
            )
        elif priority_level == PriorityLevel.P1_HIGH:
            if recovery_probability >= 0.80:
                return (
                    f"Strong recovery probability of {prob_pct}% on {amt_str} exposure "
                    f"yields high expected recovery value with favorable historical yield."
                )
            else:
                return (
                    f"Substantial revenue at risk ({amt_str}) with {prob_pct}% recovery probability "
                    f"warrants priority intervention before time degradation."
                )
        elif priority_level == PriorityLevel.P2_MEDIUM:
            if recovery_probability < 0.40 and amt_k >= 100000:
                return (
                    f"Moderate priority due to lower estimated recovery probability ({prob_pct}%) "
                    f"despite high exposure ({amt_str}). Alternative outreach recommended."
                )
            else:
                return (
                    f"Moderate exposure of {amt_str} with {prob_pct}% recovery probability "
                    f"queued for standard automated recovery touchpoint."
                )
        else:  # P3_LOW
            if recovery_probability < 0.30:
                return (
                    f"Low recovery probability ({prob_pct}%) and diminished time urgency indicate "
                    f"limited immediate ROI; case placed in passive monitoring."
                )
            else:
                return (
                    f"Low exposure ({amt_str}) with standard {prob_pct}% recoverability "
                    f"allocated to low-priority automated batch recovery."
                )
