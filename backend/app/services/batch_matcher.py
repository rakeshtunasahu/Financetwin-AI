from datetime import datetime
import uuid
from decimal import Decimal
from sqlalchemy.orm import Session
from backend.app.models.entities import SettlementBatch, BankTransaction
from backend.app.models.reconciliation import ReconciliationRun, ReconciliationMatch, ExceptionRecord
from backend.app.services.matcher import match_batch
from backend.app.services.exception_classifier import classify_exception
from backend.app.services.risk_engine import calculate_risk_score, recommend_action
from backend.app.services.audit_service import log_action

def run_reconciliation(db: Session, run_id: str, policy: dict = None) -> ReconciliationRun:
    started_at = datetime.utcnow()
    
    # Create the run record
    run = ReconciliationRun(
        run_id=run_id,
        started_at=started_at,
        total_settlements=0,
        matched_count=0,
        abstained_count=0,
        exception_count=0
    )
    db.add(run)
    db.flush()
    
    batches = db.query(SettlementBatch).filter(SettlementBatch.status == "PENDING").all()
    bank_txs = db.query(BankTransaction).all()
    
    matched_tx_ids = set()
    
    total = len(batches)
    matched = 0
    abstained = 0
    exceptions = 0
    
    for batch in batches:
        # Get only available unmatched bank transactions
        available_txs = [tx for tx in bank_txs if tx.id not in matched_tx_ids]
        
        # Match single batch
        res = match_batch(batch, available_txs, policy)
        decision = res["decision"]
        
        tx_id = res["bank_transaction_id"]
        tx = db.query(BankTransaction).filter(BankTransaction.id == tx_id).first() if tx_id else None
        
        # Save ReconciliationMatch
        match = ReconciliationMatch(
            reconciliation_run_id=run.id,
            settlement_batch_id=batch.id,
            bank_transaction_id=tx_id,
            match_type=res["match_type"],
            confidence=Decimal(str(res["confidence"])),
            second_best_confidence=Decimal(str(res["second_best_confidence"])) if res["second_best_confidence"] else None,
            confidence_margin=Decimal(str(res["confidence_margin"])) if res["confidence_margin"] else None,
            matching_pass=res["matching_pass"],
            decision=decision,
            explainability_json=res["explainability_json"]
        )
        db.add(match)
        
        # Check duplicate references
        has_duplicate_ref = False
        if batch.utr:
            ref_txs = [t for t in bank_txs if t.reference == batch.utr]
            if len(ref_txs) > 1:
                has_duplicate_ref = True
                
        has_multiple_candidates = (decision == "ABSTAIN" and res["match_type"] in ("AMOUNT_DATE_AMBIGUOUS", "FUZZY_AMBIGUOUS"))
        line_item_integrity_failed = (decision == "EXCEPTION" and res["match_type"] == "INTEGRITY_VIOLATION")
        
        days_delayed = 0
        if tx:
            days_delayed = abs((tx.transaction_date - batch.expected_credit_date).days)
            
        if decision == "MATCH":
            batch.status = "MATCHED"
            matched += 1
            if tx:
                matched_tx_ids.add(tx.id)
                if not batch.utr and tx.reference:
                    batch.utr = tx.reference
            
            log_action(
                db,
                entity_type="SettlementBatch",
                entity_id=batch.settlement_id,
                action="MATCH_DECISION",
                actor="matching_engine",
                decision="MATCH",
                reason=f"Settlement matched with bank transaction {tx.bank_transaction_id if tx else 'N/A'} via pass {res['matching_pass']}.",
                metadata_json={"confidence": float(res["confidence"]), "match_type": res["match_type"]}
            )
            
        elif decision in ("EXCEPTION", "ABSTAIN"):
            batch.status = "EXCEPTION" if decision == "EXCEPTION" else "ABSTAINED"
            if decision == "EXCEPTION":
                exceptions += 1
            else:
                abstained += 1
                
            # Classify exception deterministically
            cls = classify_exception(
                expected_amount=batch.net_amount,
                actual_amount=tx.credit_amount if tx else Decimal("0.00"),
                days_delayed=days_delayed,
                has_reference=bool(tx and tx.reference and tx.reference != "BANK TRANSFER DEPOSIT" and tx.reference != "GENERIC CREDIT"),
                has_duplicate_ref=has_duplicate_ref,
                has_multiple_candidates=has_multiple_candidates,
                line_item_integrity_failed=line_item_integrity_failed
            )
            
            # Risk calculation
            r_score = calculate_risk_score(
                amount=batch.net_amount,
                match_confidence=float(res["confidence"]),
                exception_severity=cls["severity"],
                exception_type=cls["type"],
                policy=policy
            )
            
            rec_action = recommend_action(
                amount=batch.net_amount,
                match_confidence=float(res["confidence"]),
                exception_severity=cls["severity"],
                exception_type=cls["type"],
                risk_score=r_score,
                policy=policy
            )
            
            # Create Exception Record
            exc = ExceptionRecord(
                exception_id=f"EXC_{uuid.uuid4().hex[:8].upper()}",
                reconciliation_run_id=run.id,
                settlement_batch_id=batch.id,
                bank_transaction_id=tx.id if tx else None,
                exception_type=cls["type"],
                severity=cls["severity"],
                expected_amount=batch.net_amount,
                actual_amount=tx.credit_amount if tx else Decimal("0.00"),
                variance=(tx.credit_amount - batch.net_amount) if tx else -batch.net_amount,
                status="UNRESOLVED"
            )
            db.add(exc)
            db.flush()
            
            log_action(
                db,
                entity_type="ExceptionRecord",
                entity_id=exc.exception_id,
                action="EXCEPTION_CREATED",
                actor="matching_engine",
                decision=rec_action,
                reason=cls["reason"],
                metadata_json={
                    "risk_score": r_score,
                    "severity": cls["severity"],
                    "type": cls["type"],
                    "rejection_reason": res["explainability_json"].get("rejection_reason")
                }
            )
            
        else: # NO_MATCH
            batch.status = "UNMATCHED"
            exceptions += 1
            
            # Create Exception Record for unmatched settlement
            exc = ExceptionRecord(
                exception_id=f"EXC_{uuid.uuid4().hex[:8].upper()}",
                reconciliation_run_id=run.id,
                settlement_batch_id=batch.id,
                bank_transaction_id=None,
                exception_type="UNKNOWN_ANOMALY",
                severity="HIGH",
                expected_amount=batch.net_amount,
                actual_amount=Decimal("0.00"),
                variance=-batch.net_amount,
                status="UNRESOLVED"
            )
            db.add(exc)
            db.flush()
            
            log_action(
                db,
                entity_type="SettlementBatch",
                entity_id=batch.settlement_id,
                action="MATCH_DECISION",
                actor="matching_engine",
                decision="NO_MATCH",
                reason="No candidate bank transaction found matching expected amount or details.",
                metadata_json={}
            )

    run.total_settlements = total
    run.matched_count = matched
    run.abstained_count = abstained
    run.exception_count = exceptions
    run.completed_at = datetime.utcnow()
    
    db.commit()
    return run
