import os
import pandas as pd
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.schemas.governance import PolicySchema, PolicySimulationRequest, PolicySimulationResponse, PolicyImpactMetrics
from backend.app.policies.default_policy import get_active_policy, save_policy
from backend.app.models.entities import SettlementBatch, BankTransaction
from backend.app.services.matcher import match_batch
from backend.app.services.risk_engine import calculate_risk_score, recommend_action
from backend.app.services.audit_service import log_action

router = APIRouter(prefix="/api/governance", tags=["Governance"])

@router.get("/policy", response_model=PolicySchema)
def get_policy():
    return get_active_policy()

@router.post("/policy", response_model=PolicySchema)
def update_policy(policy: PolicySchema, db: Session = Depends(get_db)):
    policy_dict = policy.model_dump()
    save_policy(policy_dict)
    
    log_action(
        db,
        entity_type="Policy",
        entity_id="current_active_policy",
        action="POLICY_APPLIED",
        actor="governance_manager",
        decision="APPLY",
        reason="Updated global reconciliation safety limits and thresholds.",
        metadata_json=policy_dict
    )
    return policy_dict

@router.post("/simulate", response_model=PolicySimulationResponse)
def simulate_policy_change(req: PolicySimulationRequest, db: Session = Depends(get_db)):
    current_policy = get_active_policy()
    
    # Build simulated policy dictionary overriding only set parameters
    sim_policy = current_policy.copy()
    req_dict = req.model_dump(exclude_unset=True)
    for k, v in req_dict.items():
        if v is not None:
            sim_policy[k] = v
            
    # Load evaluation ground truth if exists to honestly calculate simulation FMR
    base_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    gt_path = os.path.join(base_path, "data", "evaluation", "ground_truth.csv")
    gt_df = pd.read_csv(gt_path) if os.path.exists(gt_path) else None
    
    batches = db.query(SettlementBatch).all()
    bank_txs = db.query(BankTransaction).all()
    
    def calculate_metrics(policy_to_use: dict) -> PolicyImpactMetrics:
        match_count = 0
        abstain_count = 0
        exception_count = 0
        manual_review = 0
        auto_resolve = 0
        exposure = 0.0
        
        predicted_matches = 0
        incorrect_matches = 0
        
        used_tx_ids = set()
        
        for batch in batches:
            avail_txs = [tx for tx in bank_txs if tx.id not in used_tx_ids]
            res = match_batch(batch, avail_txs, policy_to_use)
            dec = res["decision"]
            tx_id = res["bank_transaction_id"]
            tx = next((t for t in bank_txs if t.id == tx_id), None) if tx_id else None
            
            # Ground truth accuracy tracking for simulation
            if gt_df is not None:
                gt_row = gt_df[gt_df["settlement_id"] == batch.settlement_id]
                if not gt_row.empty:
                    true_btx = gt_row.iloc[0]["true_bank_transaction_id"] if not pd.isna(gt_row.iloc[0]["true_bank_transaction_id"]) else ""
                    true_dec = gt_row.iloc[0]["expected_decision"]
                    
                    if dec == "MATCH":
                        predicted_matches += 1
                        pred_btx_id = tx.bank_transaction_id if tx else ""
                        # If ground truth doesn't match or bank transaction doesn't match
                        if not (true_dec == "MATCH" and pred_btx_id == true_btx):
                            incorrect_matches += 1
            
            if dec == "MATCH":
                match_count += 1
                if tx:
                    used_tx_ids.add(tx.id)
            elif dec == "ABSTAIN":
                abstain_count += 1
                r_score = calculate_risk_score(batch.net_amount, float(res["confidence"]), "MEDIUM", "AMBIGUOUS_MATCH", policy_to_use)
                rec_act = recommend_action(batch.net_amount, float(res["confidence"]), "MEDIUM", "AMBIGUOUS_MATCH", r_score, policy_to_use)
                if rec_act == "MANUAL_REVIEW":
                    manual_review += 1
                    exposure += float(batch.net_amount)
                else:
                    auto_resolve += 1
            elif dec == "EXCEPTION":
                exception_count += 1
                r_score = calculate_risk_score(batch.net_amount, float(res["confidence"]), "HIGH", "FEE_MISMATCH", policy_to_use)
                rec_act = recommend_action(batch.net_amount, float(res["confidence"]), "HIGH", "FEE_MISMATCH", r_score, policy_to_use)
                if rec_act == "MANUAL_REVIEW":
                    manual_review += 1
                    exposure += float(batch.net_amount)
                else:
                    auto_resolve += 1
            else: # NO_MATCH
                exception_count += 1
                manual_review += 1
                exposure += float(batch.net_amount)
                
        cov = float(match_count) / len(batches) if batches else 0.0
        fmr = float(incorrect_matches) / predicted_matches if predicted_matches > 0 else None
        
        return PolicyImpactMetrics(
            match_count=match_count,
            abstain_count=abstain_count,
            exception_count=exception_count,
            manual_review_count=manual_review,
            auto_resolve_count=auto_resolve,
            coverage=cov,
            false_match_rate=fmr,
            financial_amount_at_risk=exposure
        )
        
    before_metrics = calculate_metrics(current_policy)
    after_metrics = calculate_metrics(sim_policy)
    
    return PolicySimulationResponse(
        before=before_metrics,
        after=after_metrics
    )
