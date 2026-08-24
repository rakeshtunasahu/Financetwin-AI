from decimal import Decimal
from backend.app.services.risk_engine import calculate_risk_score, recommend_action

def test_low_value_high_confidence():
    score = calculate_risk_score(
        amount=Decimal("100.00"),
        match_confidence=0.99,
        exception_severity="LOW",
        exception_type="SETTLEMENT_DELAY"
    )
    assert score < 0.2
    
    action = recommend_action(
        amount=Decimal("100.00"),
        match_confidence=0.99,
        exception_severity="LOW",
        exception_type="SETTLEMENT_DELAY",
        risk_score=score
    )
    assert action == "AUTO_RESOLVE"

def test_high_value_high_confidence():
    # Above max auto-resolve limit of 5000.00
    score = calculate_risk_score(
        amount=Decimal("6000.00"),
        match_confidence=0.99,
        exception_severity="LOW",
        exception_type="SETTLEMENT_DELAY"
    )
    action = recommend_action(
        amount=Decimal("6000.00"),
        match_confidence=0.99,
        exception_severity="LOW",
        exception_type="SETTLEMENT_DELAY",
        risk_score=score
    )
    assert action == "MANUAL_REVIEW"

def test_low_confidence():
    score = calculate_risk_score(
        amount=Decimal("500.00"),
        match_confidence=0.30,
        exception_severity="HIGH",
        exception_type="UNKNOWN_ANOMALY"
    )
    action = recommend_action(
        amount=Decimal("500.00"),
        match_confidence=0.30,
        exception_severity="HIGH",
        exception_type="UNKNOWN_ANOMALY",
        risk_score=score
    )
    assert action == "MANUAL_REVIEW"

def test_dispute_exceptions():
    score = calculate_risk_score(
        amount=Decimal("200.00"),
        match_confidence=0.90,
        exception_severity="HIGH",
        exception_type="PARTIAL_SETTLEMENT"
    )
    action = recommend_action(
        amount=Decimal("200.00"),
        match_confidence=0.90,
        exception_severity="HIGH",
        exception_type="PARTIAL_SETTLEMENT",
        risk_score=score
    )
    assert action == "GENERATE_DISPUTE"
