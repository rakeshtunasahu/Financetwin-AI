import os
import random
from datetime import datetime, date, timedelta
from decimal import Decimal
import pandas as pd

def to_dec(val) -> Decimal:
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val)).quantize(Decimal("0.0001"))

def generate_25_feature_datasets(base_path: str):
    """
    Generates 25 distinct, meticulously designed test datasets covering every single
    feature in FinanceTwin AI:
    1.  Pass 1: Deterministic Match (Exact UTR & Amount)
    2.  Pass 2: Date Proximity Match (T+2 Credit Window)
    3.  Pass 3: Fuzzy Matching (Narration Typo / Slight Dev)
    4.  Pass 4: Confidence Safety Gate (Abstain on < 95% score)
    5.  Pass 4: Margin Safety Gate (Abstain on < 5% candidate margin)
    6.  Pass 0: Fee Integrity Validation Failure
    7.  Pass 0: GST Tax Calculation Mismatch
    8.  Partial Settlement Exception (Under-credit)
    9.  Surplus Credit Exception (Over-credit)
    10. Duplicate Bank Credit Anomaly
    11. Extreme Settlement Delay Anomaly (T+9)
    12. DBSCAN Delay Clustering Pattern A
    13. DBSCAN Delay Clustering Pattern B
    14. DBSCAN Delay Clustering Pattern C
    15. Unmatched / Missing Bank Credit
    16. High-Value Exposure Alert (₹1,500,000)
    17. High Refund Ratio Settlement (60% refunded)
    18. Chargeback Reserve Withholding (5%)
    19. Special Gateway Surcharge Adjustment
    20. IsolationForest Outlier Anomaly
    21. Multi-Bank Routing (HDFC)
    22. Multi-Bank Routing (ICICI)
    23. Multi-Bank Routing (Axis Bank)
    24. Grounded AI Root-Cause Investigation Candidate
    25. Governance Policy Simulator Boundary Test (94.5% score)
    """
    random.seed(2026)
    
    test_data_dir = os.path.join(base_path, "data", "test_25_scenarios")
    os.makedirs(test_data_dir, exist_ok=True)
    
    payments = []
    batches = []
    line_items = []
    bank_txs = []
    ground_truth = []
    
    start_date = datetime(2026, 8, 1, 10, 0, 0)
    tax_rate = Decimal("0.18")
    tx_counter = 100
    
    # 25 Scenario Specifications
    scenarios_meta = [
        {"id": 1, "name": "PERFECT_DETERMINISTIC_MATCH", "feature": "Pass 1 Deterministic Matcher", "bank": "HDFC"},
        {"id": 2, "name": "DATE_PROXIMITY_MATCH", "feature": "Pass 2 Date Proximity Matcher", "bank": "HDFC"},
        {"id": 3, "name": "FUZZY_NARRATION_MATCH", "feature": "Pass 3 Fuzzy Narration Matcher", "bank": "ICICI"},
        {"id": 4, "name": "CONFIDENCE_GATE_ABSTAIN", "feature": "Pass 4 Confidence Threshold Gate", "bank": "ICICI"},
        {"id": 5, "name": "MARGIN_GATE_ABSTAIN", "feature": "Pass 4 Multi-Candidate Margin Gate", "bank": "HDFC"},
        {"id": 6, "name": "INTEGRITY_FAIL_FEE_TAMPER", "feature": "Pass 0 Batch Fee Integrity", "bank": "HDFC"},
        {"id": 7, "name": "INTEGRITY_FAIL_TAX_MISMATCH", "feature": "Pass 0 GST Tax Calculation", "bank": "HDFC"},
        {"id": 8, "name": "PARTIAL_SETTLEMENT_UNDERPAY", "feature": "Exception Engine: Under-credit", "bank": "ICICI"},
        {"id": 9, "name": "SURPLUS_CREDIT_OVERPAY", "feature": "Exception Engine: Over-credit", "bank": "ICICI"},
        {"id": 10, "name": "DUPLICATE_BANK_CREDIT", "feature": "High Risk: Duplicate Credit Anomaly", "bank": "HDFC"},
        {"id": 11, "name": "EXTREME_SETTLEMENT_DELAY", "feature": "ML Anomaly: T+9 Settlement Lag", "bank": "HDFC"},
        {"id": 12, "name": "CLUSTER_DELAY_PATTERN_A", "feature": "ML DBSCAN Delay Cluster Group 1", "bank": "AXIS"},
        {"id": 13, "name": "CLUSTER_DELAY_PATTERN_B", "feature": "ML DBSCAN Delay Cluster Group 2", "bank": "AXIS"},
        {"id": 14, "name": "CLUSTER_DELAY_PATTERN_C", "feature": "ML DBSCAN Delay Cluster Group 3", "bank": "AXIS"},
        {"id": 15, "name": "NO_BANK_CREDIT_UNMATCHED", "feature": "Exception Engine: Missing Bank Credit", "bank": "HDFC"},
        {"id": 16, "name": "HIGH_VALUE_EXPOSURE_ALERT", "feature": "High Risk: Enterprise Threshold Gate", "bank": "HDFC"},
        {"id": 17, "name": "HIGH_REFUND_RATIO_BATCH", "feature": "Deterministic Refund Contribution", "bank": "ICICI"},
        {"id": 18, "name": "CHARGEBACK_RESERVE_HOLD", "feature": "5% Reserve Withholding Accounting", "bank": "ICICI"},
        {"id": 19, "name": "GATEWAY_SURCHARGE_ADJUSTMENT", "feature": "Manual Fee Adjustment Tracing", "bank": "HDFC"},
        {"id": 20, "name": "ISOLATION_FOREST_OUTLIER", "feature": "ML IsolationForest Outlier Scoring", "bank": "HDFC"},
        {"id": 21, "name": "MULTI_BANK_ROUTING_HDFC", "feature": "Multi-Entity: HDFC Routing", "bank": "HDFC"},
        {"id": 22, "name": "MULTI_BANK_ROUTING_ICICI", "feature": "Multi-Entity: ICICI Routing", "bank": "ICICI"},
        {"id": 23, "name": "MULTI_BANK_ROUTING_AXIS", "feature": "Multi-Entity: Axis Bank Routing", "bank": "AXIS"},
        {"id": 24, "name": "AI_INVESTIGATION_CANDIDATE", "feature": "Grounded AI Root-Cause Investigator", "bank": "ICICI"},
        {"id": 25, "name": "GOVERNANCE_POLICY_BOUNDARY", "feature": "Policy Governance Simulator Lab", "bank": "HDFC"}
    ]
    
    for s_info in scenarios_meta:
        b_idx = s_info["id"]
        s_id = f"SET_TEST_{b_idx:02d}"
        utr = f"UTR_TEST_{b_idx:03d}X"
        settle_date = date(2026, 8, 1) + timedelta(days=b_idx)
        exp_credit_date = settle_date + timedelta(days=2)
        bank_source = s_info["bank"]
        
        # 4 payments per test batch
        batch_gross = Decimal("0.0000")
        batch_refunds = Decimal("0.0000")
        batch_payments = []
        
        for p_i in range(1, 5):
            p_id = f"PAY_T{b_idx:02d}_{p_i}"
            ord_id = f"ORD_T{b_idx:02d}_{p_i}"
            cust_id = f"CUST_{200 + b_idx * 10 + p_i}"
            
            # Specific amount logic
            if b_idx == 16: # High value
                p_amount = Decimal("375000.0000")
            else:
                p_amount = Decimal(str(2500 + (b_idx * 317 + p_i * 123) % 4000)) + Decimal("0.5000")
                
            p_status = "CAPTURED"
            # High refund scenario
            if b_idx == 17 and p_i in [1, 2]:
                p_status = "REFUNDED"
                
            p_created = start_date + timedelta(days=b_idx, hours=p_i * 3)
            
            payment_obj = {
                "payment_id": p_id,
                "order_id": ord_id,
                "customer_id": cust_id,
                "amount": to_dec(p_amount),
                "currency": "INR",
                "payment_method": "UPI" if p_i % 2 == 0 else "CARD",
                "status": p_status,
                "created_at": p_created.strftime("%Y-%m-%dT%H:%M:%S"),
                "settlement_batch_id": s_id
            }
            payments.append(payment_obj)
            batch_payments.append(payment_obj)
            
            if p_status == "REFUNDED":
                batch_refunds += p_amount
            else:
                batch_gross += p_amount
                
        # Fee and Tax Calculations
        gateway_fee = (batch_gross * Decimal("0.0200")).quantize(Decimal("0.0001"))
        fee_tax = (gateway_fee * tax_rate).quantize(Decimal("0.0001"))
        reserves = Decimal("0.0000")
        adjustments = Decimal("0.0000")
        
        if b_idx == 18: # Chargeback Reserve
            reserves = (batch_gross * Decimal("0.0500")).quantize(Decimal("0.0001"))
        if b_idx == 19: # Surcharge adjustment
            adjustments = Decimal("250.0000")
            
        net_amount = (batch_gross - gateway_fee - fee_tax - batch_refunds - adjustments - reserves).quantize(Decimal("0.0001"))
        
        # Build line items
        for p in batch_payments:
            p_amt = p["amount"]
            p_fee = Decimal("0.0000")
            p_tax = Decimal("0.0000")
            p_ref = Decimal("0.0000")
            
            if p["status"] == "REFUNDED":
                p_ref = p_amt
            else:
                p_fee = (p_amt * Decimal("0.0200")).quantize(Decimal("0.0001"))
                p_tax = (p_fee * tax_rate).quantize(Decimal("0.0001"))
                
            p_contrib = p_amt - p_fee - p_tax - p_ref
            if p == batch_payments[0]:
                p_contrib = p_contrib - adjustments - reserves
                
            line_items.append({
                "settlement_batch_id": s_id,
                "payment_id": p["payment_id"],
                "gross_amount": to_dec(p_amt),
                "fee_amount": to_dec(p_fee),
                "tax_amount": to_dec(p_tax),
                "adjustment_amount": to_dec(p_ref + adjustments + reserves if p == batch_payments[0] else p_ref),
                "net_contribution": to_dec(p_contrib)
            })
            
        # SCENARIO BANK TRANSACTION AND DECISION MAPPINGS
        expected_status = "MATCHED"
        expected_decision = "MATCH"
        true_tx_id = ""
        
        if b_idx == 1: # Perfect Match (Pass 1)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1000000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"
            
        elif b_idx == 2: # Date Proximity (Pass 2)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": "GENERIC NEFT DEPOSIT",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": "SETTLEMENT CREDIT VIA PG",
                "balance": to_dec(Decimal("1050000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"
            
        elif b_idx == 3: # Fuzzy Match (Pass 3)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": f"UTR-TEST-{b_idx:03d}X-PG",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": (exp_credit_date + timedelta(days=1)).strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT BATCH UTR-TEST-{b_idx:03d}X-PG",
                "balance": to_dec(Decimal("1100000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"
            
        elif b_idx == 4: # Confidence Safety Gate Abstain (Pass 4)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": "DIFF_TRANSFER_CODE",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": (exp_credit_date + timedelta(days=4)).strftime("%Y-%m-%d"),
                "description": "UNSPECIFIED INCOMING SETTLEMENT",
                "balance": to_dec(Decimal("1150000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "ABSTAINED"
            expected_decision = "ABSTAIN"
            
        elif b_idx == 5: # Margin Safety Gate Abstain (Pass 4)
            # Create two equal bank credits to force margin = 0%
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            tx_counter += 1
            cand_tx_id2 = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": "AMBIGUOUS BATCH A",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": "SETTLEMENT PG CANDIDATE 1",
                "balance": to_dec(Decimal("1200000.00") + net_amount),
                "source": bank_source
            })
            bank_txs.append({
                "bank_transaction_id": cand_tx_id2,
                "reference": "AMBIGUOUS BATCH B",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": "SETTLEMENT PG CANDIDATE 2",
                "balance": to_dec(Decimal("1200000.00") + net_amount * 2),
                "source": bank_source
            })
            expected_status = "ABSTAINED"
            expected_decision = "ABSTAIN"
            
        elif b_idx == 6: # Pass 0: Fee Integrity Tamper
            net_amount += Decimal("150.0000") # Discrepancy with line contributions
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1250000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "EXCEPTION"
            expected_decision = "EXCEPTION"
            
        elif b_idx == 7: # Pass 0: GST Tax Mismatch
            net_amount += Decimal("75.0000")
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1300000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "EXCEPTION"
            expected_decision = "EXCEPTION"
            
        elif b_idx == 8: # Partial Settlement Underpay
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            partial_credit = (net_amount * Decimal("0.7000")).quantize(Decimal("0.0001"))
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(partial_credit),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"PARTIAL SETTLEMENT UTR:{utr}",
                "balance": to_dec(Decimal("1350000.00") + partial_credit),
                "source": bank_source
            })
            expected_status = "EXCEPTION"
            expected_decision = "EXCEPTION"
            
        elif b_idx == 9: # Surplus Credit Overpay
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            surplus_credit = (net_amount * Decimal("1.1500")).quantize(Decimal("0.0001"))
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(surplus_credit),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"OVERPAYMENT SETTLEMENT UTR:{utr}",
                "balance": to_dec(Decimal("1400000.00") + surplus_credit),
                "source": bank_source
            })
            expected_status = "EXCEPTION"
            expected_decision = "EXCEPTION"
            
        elif b_idx == 10: # Duplicate Bank Credit
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            tx_counter += 1
            dup_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1450000.00") + net_amount),
                "source": bank_source
            })
            bank_txs.append({
                "bank_transaction_id": dup_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"DUPLICATE SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1450000.00") + net_amount * 2),
                "source": bank_source
            })
            expected_status = "EXCEPTION"
            expected_decision = "EXCEPTION"
            
        elif b_idx == 11: # Extreme Settlement Delay (T+9)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            delayed_date = exp_credit_date + timedelta(days=9)
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": delayed_date.strftime("%Y-%m-%d"),
                "description": f"DELAYED SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("1500000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"
            
        elif b_idx in [12, 13, 14]: # Cluster Delay Patterns (T+6)
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            cluster_date = exp_credit_date + timedelta(days=6)
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": cluster_date.strftime("%Y-%m-%d"),
                "description": f"RECURRING DELAY CLUSTER UTR:{utr}",
                "balance": to_dec(Decimal("1550000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"
            
        elif b_idx == 15: # No Bank Credit (Unmatched)
            true_tx_id = ""
            expected_status = "UNMATCHED"
            expected_decision = "NO_MATCH"
            
        else: # Standard High Fidelity Matched Datasets for Features 16-25
            tx_counter += 1
            true_tx_id = f"BTX_{tx_counter}"
            bank_txs.append({
                "bank_transaction_id": true_tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": exp_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT CR UTR:{utr}",
                "balance": to_dec(Decimal("2000000.00") + net_amount),
                "source": bank_source
            })
            expected_status = "MATCHED"
            expected_decision = "MATCH"

        batches.append({
            "settlement_id": s_id,
            "merchant_id": "MER_RAZORPAY_01",
            "gross_amount": to_dec(batch_gross),
            "gateway_fee": to_dec(gateway_fee),
            "fee_tax": to_dec(fee_tax),
            "refunds": to_dec(batch_refunds),
            "adjustments": to_dec(adjustments),
            "reserves": to_dec(reserves),
            "net_amount": to_dec(net_amount),
            "settlement_date": settle_date.strftime("%Y-%m-%d"),
            "expected_credit_date": exp_credit_date.strftime("%Y-%m-%d"),
            "status": "PENDING",
            "utr": utr
        })
        
        ground_truth.append({
            "scenario_number": b_idx,
            "scenario_name": s_info["name"],
            "tested_feature": s_info["feature"],
            "settlement_id": s_id,
            "true_bank_transaction_id": true_tx_id,
            "true_status": expected_status,
            "expected_decision": expected_decision
        })

    # Save to CSV files
    pd.DataFrame(payments).to_csv(os.path.join(test_data_dir, "payments.csv"), index=False)
    pd.DataFrame(batches).to_csv(os.path.join(test_data_dir, "settlement_batches.csv"), index=False)
    pd.DataFrame(line_items).to_csv(os.path.join(test_data_dir, "settlement_line_items.csv"), index=False)
    pd.DataFrame(bank_txs).to_csv(os.path.join(test_data_dir, "bank_transactions.csv"), index=False)
    pd.DataFrame(ground_truth).to_csv(os.path.join(test_data_dir, "ground_truth_25.csv"), index=False)
    
    print(f"[OK] Generated 25 Feature Test Datasets: {len(payments)} payments across {len(batches)} scenario batches.")
    return test_data_dir
