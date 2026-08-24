import json
from sqlalchemy.orm import Session
from backend.app.models.reconciliation import ExceptionRecord, AIInvestigation
from backend.app.schemas.ai_schema import GroundedFactInput, AIInvestigationOutput
from backend.app.ai.provider import LLMProvider
from backend.app.services.audit_service import log_action
from backend.app.utils.money import to_decimal

def investigate_exception(db: Session, exception: ExceptionRecord) -> AIInvestigation:
    s_batch = exception.settlement_batch
    btx = exception.bank_transaction
    
    # Calculate delay days
    days_delayed = 0
    if s_batch and btx:
        days_delayed = abs((btx.transaction_date - s_batch.expected_credit_date).days)
        
    # Gather facts strictly
    facts = GroundedFactInput(
        exception_id=exception.exception_id,
        settlement_id=s_batch.settlement_id if s_batch else "N/A",
        bank_transaction_id=btx.bank_transaction_id if btx else "N/A",
        expected_amount=exception.expected_amount,
        actual_amount=exception.actual_amount,
        variance=exception.variance,
        expected_fee=(s_batch.gateway_fee + s_batch.fee_tax) if s_batch else to_decimal(0),
        actual_fee=to_decimal(0),
        days_delayed=days_delayed,
        triggered_rules=[exception.exception_type],
        evidence_ids=[exception.exception_id],
        anomaly_score=float(exception.anomaly_score) if exception.anomaly_score else None,
        cluster_id=exception.cluster_id
    )
    
    # Formulate facts-based prompt (prevents model hallucinations/inventing details)
    prompt = f"""
Analyze the following verified reconciliation facts and explain the variance:
exception_id: {facts.exception_id}
exception_type: {exception.exception_type}
settlement_id: {facts.settlement_id}
bank_transaction_id: {facts.bank_transaction_id}
expected_amount: {facts.expected_amount}
actual_amount: {facts.actual_amount}
variance: {facts.variance}
expected_fee: {facts.expected_fee}
days_delayed: {facts.days_delayed}
cluster_id: {facts.cluster_id if facts.cluster_id is not None else -1}

Required output schema format:
AIInvestigationOutput
"""
    
    provider = LLMProvider()
    
    try:
        # Generate output and validate
        output: AIInvestigationOutput = provider.generate_structured_output(prompt, AIInvestigationOutput)
    except Exception as e:
        # Structured validation fallback safety gate
        output = AIInvestigationOutput(
            exception_type=exception.exception_type,
            root_cause="Validation error occurred during investigation parsing.",
            investigation_confidence=0.50,
            evidence_ids=[exception.exception_id],
            recommended_action="MANUAL_REVIEW",
            explanation=f"The structured AI output failed safety validation: {str(e)}."
        )
        
        log_action(
            db,
            entity_type="ExceptionRecord",
            entity_id=exception.exception_id,
            action="AI_INVESTIGATION_FAILED",
            actor="ai_investigator",
            decision="MANUAL_REVIEW",
            reason=f"Structured output validation failed: {str(e)}"
        )
        
    # Save investigation
    investigation = AIInvestigation(
        exception_id=exception.id,
        model_name=provider.provider_type,
        model_version="v1-mock" if provider.provider_type == "mock" else "v1-prod",
        input_facts_json=facts.model_dump(mode="json"),
        output_json=output.model_dump(mode="json")
    )
    db.add(investigation)
    
    # Update exception record state
    exception.status = "MANUAL_REVIEW" if output.recommended_action == "MANUAL_REVIEW" else "INVESTIGATING"
    db.commit()
    
    log_action(
        db,
        entity_type="ExceptionRecord",
        entity_id=exception.exception_id,
        action="AI_INVESTIGATION_COMPLETED",
        actor="ai_investigator",
        decision=output.recommended_action,
        reason=output.root_cause,
        metadata_json=output.model_dump(mode="json")
    )
    
    return investigation
