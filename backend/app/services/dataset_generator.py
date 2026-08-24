import os
import random
from datetime import datetime, date, timedelta
from decimal import Decimal, ROUND_HALF_UP
import pandas as pd

def to_dec(val) -> Decimal:
    if isinstance(val, Decimal):
        return val
    return Decimal(str(val)).quantize(Decimal("0.0001"))

def generate_synthetic_data(base_path: str):
    # Set seeds for reproducibility
    random.seed(42)
    
    generated_dir = os.path.join(base_path, "data", "generated")
    evaluation_dir = os.path.join(base_path, "data", "evaluation")
    os.makedirs(generated_dir, exist_ok=True)
    os.makedirs(evaluation_dir, exist_ok=True)
    
    # 1. Generate 500 Payments
    payments = []
    start_date = datetime(2026, 8, 1, 9, 0, 0)
    
    methods = ["UPI", "CARD", "NETBANKING"]
    
    for idx in range(1, 501):
        p_id = f"PAY_{idx:03d}"
        ord_id = f"ORD_{1000 + idx}"
        cust_id = f"CUST_{500 + (idx % 23)}"
        
        # Determine amount
        if idx % 15 == 0:
            amount = Decimal("15000.00") # High value
        else:
            # Deterministic pseudo-random amount
            amount = Decimal(str(100 + (idx * 17) % 4900)) + Decimal("0.50")
            
        currency = "INR"
        method = methods[idx % len(methods)]
        status = "CAPTURED"
        
        # Occasional refunds (about 5%)
        if idx % 20 == 0:
            status = "REFUNDED"
            
        created_at = start_date + timedelta(hours=idx * 2)
        
        payments.append({
            "payment_id": p_id,
            "order_id": ord_id,
            "customer_id": cust_id,
            "amount": to_dec(amount),
            "currency": currency,
            "payment_method": method,
            "status": status,
            "created_at": created_at.strftime("%Y-%m-%dT%H:%M:%S")
        })
        
    # 2. Generate 45 Settlement Batches and Scenarios
    # Each batch contains 10 payments. (45 * 10 = 450 payments are settled, 50 remain unsettled).
    batches = []
    line_items = []
    bank_txs = []
    ground_truth = []
    
    tax_rate = Decimal("0.18")
    
    # We will generate bank transactions with unique IDs
    tx_counter = 1
    
    # Generate the scenarios for 45 batches
    for b_idx in range(1, 46):
        s_id = f"SET_{1000 + b_idx}"
        m_id = "MER_RAZORPAY_01"
        utr = f"UTR_888{b_idx:03d}X"
        settlement_date = date(2026, 8, 3) + timedelta(days=b_idx)
        expected_credit_date = settlement_date + timedelta(days=2)
        
        # Fetch 10 payments for this batch
        batch_p_start = (b_idx - 1) * 10
        batch_p_end = b_idx * 10
        batch_payments = payments[batch_p_start:batch_p_end]
        
        # Calculate financials
        gross = Decimal("0.0000")
        refunds = Decimal("0.0000")
        
        # Assign payments to batch
        for p in batch_payments:
            p["settlement_batch_id"] = s_id
            p_amt = p["amount"]
            if p["status"] == "REFUNDED":
                refunds += p_amt
            else:
                gross += p_amt
                
        # gateway fee: 2% on gross
        gateway_fee = (gross * Decimal("0.02")).quantize(Decimal("0.0001"))
        fee_tax = (gateway_fee * tax_rate).quantize(Decimal("0.0001"))
        
        # Reserves (5% on specific batches)
        reserves = Decimal("0.0000")
        if b_idx % 7 == 0:
            reserves = (gross * Decimal("0.05")).quantize(Decimal("0.0001"))
            
        adjustments = Decimal("0.0000")
        if b_idx % 9 == 0:
            adjustments = Decimal("120.0000") # Small adjustment reversal
            
        net_amount = gross - gateway_fee - fee_tax - refunds - adjustments - reserves
        net_amount = net_amount.quantize(Decimal("0.0001"))
        
        # Determine scenario category
        scenario_type = ""
        # Categories: 0: PERFECT_MATCH, 1: SETTLEMENT_DELAY, 2: FEE_MISMATCH, 
        # 3: PARTIAL_SETTLEMENT, 4: DUPLICATE_CREDIT, 5: MISSING_REFERENCE, 
        # 6: AMBIGUOUS_MATCH, 7: NO_MATCH
        cat = b_idx % 8
        
        # Generate Line Items
        for p in batch_payments:
            p_amt = p["amount"]
            p_fee = Decimal("0.0000")
            p_tax = Decimal("0.0000")
            p_refund = Decimal("0.0000")
            
            if p["status"] == "REFUNDED":
                p_refund = p_amt
            else:
                p_fee = (p_amt * Decimal("0.02")).quantize(Decimal("0.0001"))
                p_tax = (p_fee * tax_rate).quantize(Decimal("0.0001"))
                
            p_contrib = p_amt - p_fee - p_tax - p_refund
            
            # Adjust first line item for adjustments/reserves to keep it exact
            # In a real system adjustment is captured line-by-line, here we allocate to the first item for simplicity
            if p == batch_payments[0]:
                p_contrib = p_contrib - adjustments - reserves
                
            line_items.append({
                "settlement_batch_id": s_id,
                "payment_id": p["payment_id"],
                "gross_amount": to_dec(p_amt),
                "fee_amount": to_dec(p_fee),
                "tax_amount": to_dec(p_tax),
                "adjustment_amount": to_dec(p_refund + adjustments + reserves if p == batch_payments[0] else p_refund),
                "net_contribution": to_dec(p_contrib)
            })
            
        # SCENARIOS SETUP
        if cat == 0:
            scenario_type = "PERFECT_MATCH"
            # Perfect credit matches UTR, Date, and Amount
            tx_id = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            
            bank_txs.append({
                "bank_transaction_id": tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("500000.00") + net_amount),
                "source": "HDFC"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id,
                "true_status": "MATCHED",
                "true_exception_type": "PERFECT_MATCH",
                "expected_decision": "MATCH"
            })
            
        elif cat == 1:
            scenario_type = "SETTLEMENT_DELAY"
            # Delay credit by 5 days (beyond T+2 window)
            tx_id = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            actual_credit_date = expected_credit_date + timedelta(days=5)
            
            bank_txs.append({
                "bank_transaction_id": tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": actual_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("600000.00") + net_amount),
                "source": "HDFC"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id,
                "true_status": "MATCHED",
                "true_exception_type": "SETTLEMENT_DELAY",
                "expected_decision": "MATCH" # Matchable under exact reference (Pass 1) but delayed
            })
            
        elif cat == 2:
            scenario_type = "FEE_MISMATCH"
            # Introduce discrepancy between batch net_amount and bank credit
            # Here: gateway fee calculation in batch is modified, making line contributions not equal to batch net_amount
            # This triggers Pass 0 (batch integrity) failure
            # We also make bank transaction match the batch net_amount but we want it flagged as EXCEPTION
            tx_id = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            
            # Corrupt the batch net_amount to be different from contributions
            net_amount += Decimal("100.00")
            
            bank_txs.append({
                "bank_transaction_id": tx_id,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("700000.00") + net_amount),
                "source": "HDFC"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id,
                "true_status": "EXCEPTION",
                "true_exception_type": "FEE_MISMATCH",
                "expected_decision": "EXCEPTION"
            })
            
        elif cat == 3:
            scenario_type = "PARTIAL_SETTLEMENT"
            # Bank credit is smaller than net_amount
            tx_id = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            partial_credit = (net_amount * Decimal("0.70")).quantize(Decimal("0.01"))
            
            bank_txs.append({
                "bank_transaction_id": tx_id,
                "reference": utr,
                "credit_amount": to_dec(partial_credit),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT PARTIAL FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("800000.00") + partial_credit),
                "source": "HDFC"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id,
                "true_status": "EXCEPTION",
                "true_exception_type": "PARTIAL_SETTLEMENT",
                "expected_decision": "EXCEPTION"
            })
            
        elif cat == 4:
            scenario_type = "DUPLICATE_CREDIT"
            # Generate two bank transactions with identical details
            tx_id1 = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            tx_id2 = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            
            bank_txs.append({
                "bank_transaction_id": tx_id1,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"SETTLEMENT FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("900000.00") + net_amount),
                "source": "ICICI"
            })
            
            bank_txs.append({
                "bank_transaction_id": tx_id2,
                "reference": utr,
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"DUPLICATE SETTLEMENT FROM PG UTR:{utr}",
                "balance": to_dec(Decimal("900000.00") + net_amount + net_amount),
                "source": "ICICI"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id1, # primary candidate
                "true_status": "EXCEPTION",
                "true_exception_type": "DUPLICATE_CREDIT",
                "expected_decision": "EXCEPTION"
            })
            
        elif cat == 5:
            scenario_type = "MISSING_REFERENCE"
            # Bank credit amount matches but reference has no UTR. Fuzzy matching should detect via amount and date.
            tx_id = f"BTX_{tx_counter:03d}"
            tx_counter += 1
            
            bank_txs.append({
                "bank_transaction_id": tx_id,
                "reference": "BANK TRANSFER DEPOSIT",
                "credit_amount": to_dec(net_amount),
                "debit_amount": to_dec(Decimal("0.00")),
                "transaction_date": expected_credit_date.strftime("%Y-%m-%d"),
                "description": f"PAYMENT OUT FROM PG PARTNER",
                "balance": to_dec(Decimal("950000.00") + net_amount),
                "source": "ICICI"
            })
            
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": tx_id,
                "true_status": "MATCHED",
                "true_exception_type": "MISSING_REFERENCE",
                "expected_decision": "MATCH" # Matchable under fuzzy scoring (Pass 3/4)
            })
            
        elif cat == 6:
            scenario_type = "AMBIGUOUS_MATCH"
            # This batch has amount equal to another batch, but reference is missing
            # Let's override its net_amount to match the NEXT batch's net_amount exactly
            # We will force the amount to be a fixed amount, e.g. 25000.00 for both batches
            # Let's adjust this batch and the next batch net amounts
            pass
            
        elif cat == 7:
            scenario_type = "NO_MATCH"
            # No bank transaction credit is generated. Should result in NO_MATCH
            ground_truth.append({
                "settlement_id": s_id,
                "true_bank_transaction_id": "",
                "true_status": "UNMATCHED",
                "true_exception_type": "NO_MATCH",
                "expected_decision": "NO_MATCH"
            })
            
        # Keep track of batches
        batches.append({
            "settlement_id": s_id,
            "merchant_id": m_id,
            "gross_amount": to_dec(gross),
            "gateway_fee": to_dec(gateway_fee),
            "fee_tax": to_dec(fee_tax),
            "refunds": to_dec(refunds),
            "adjustments": to_dec(adjustments),
            "reserves": to_dec(reserves),
            "net_amount": to_dec(net_amount),
            "settlement_date": settlement_date.strftime("%Y-%m-%d"),
            "expected_credit_date": expected_credit_date.strftime("%Y-%m-%d"),
            "status": "PENDING",
            "utr": utr
        })

    # Post-process Ambiguous cases
    # We want Batch 6 and Batch 14 to have identical net_amount = 22222.00, and generate one bank credit with no reference
    # Let's find SET_1006 (b_idx=6) and SET_1014 (b_idx=14) in batches list and edit them
    idx6 = 5 # 0-indexed
    idx14 = 13 # 0-indexed
    
    ambiguous_amount = Decimal("22222.0000")
    batches[idx6]["net_amount"] = to_dec(ambiguous_amount)
    batches[idx14]["net_amount"] = to_dec(ambiguous_amount)
    
    # We will adjust line items of these batches so they still pass integrity checks
    for li in line_items:
        if li["settlement_batch_id"] in [batches[idx6]["settlement_id"], batches[idx14]["settlement_id"]]:
            # Adjust the contributions to match the new net amount
            # E.g. we can just override line contributions to sum up to 22222.00
            # For simplicity, divide 22222.00 by 10 payments = 2222.20 per contribution
            li["net_contribution"] = to_dec(Decimal("2222.2000"))
            
    # Now generate exactly ONE bank transaction with that amount and missing reference
    tx_id_amb = f"BTX_{tx_counter:03d}"
    tx_counter += 1
    
    bank_txs.append({
        "bank_transaction_id": tx_id_amb,
        "reference": "GENERIC CREDIT",
        "credit_amount": to_dec(ambiguous_amount),
        "debit_amount": to_dec(Decimal("0.00")),
        "transaction_date": batches[idx6]["expected_credit_date"],
        "description": "SETTLEMENT FROM PG PARTNER",
        "balance": to_dec(Decimal("1000000.00") + ambiguous_amount),
        "source": "ICICI"
    })
    
    # In ground truth, both these settlements will map to this transaction but the expected decision is ABSTAIN
    # because they are ambiguous (multiple equal candidates)
    ground_truth.append({
        "settlement_id": batches[idx6]["settlement_id"],
        "true_bank_transaction_id": tx_id_amb,
        "true_status": "ABSTAINED",
        "true_exception_type": "AMBIGUOUS_MATCH",
        "expected_decision": "ABSTAIN"
    })
    
    ground_truth.append({
        "settlement_id": batches[idx14]["settlement_id"],
        "true_bank_transaction_id": tx_id_amb,
        "true_status": "ABSTAINED",
        "true_exception_type": "AMBIGUOUS_MATCH",
        "expected_decision": "ABSTAIN"
    })

    # Add a few unrelated bank credits (deposits) as noise (around 5-10 transactions)
    for noise_idx in range(1, 11):
        noise_tx_id = f"BTX_{tx_counter:03d}"
        tx_counter += 1
        noise_amount = Decimal(str(3000 + noise_idx * 150)) + Decimal("0.75")
        noise_date = date(2026, 8, 10) + timedelta(days=noise_idx)
        
        bank_txs.append({
            "bank_transaction_id": noise_tx_id,
            "reference": f"REF_NOISE_{noise_idx:02d}",
            "credit_amount": to_dec(noise_amount),
            "debit_amount": to_dec(Decimal("0.00")),
            "transaction_date": noise_date.strftime("%Y-%m-%d"),
            "description": f"INTEREST CREDIT / NOISE TXN {noise_idx}",
            "balance": to_dec(Decimal("2000000.00") + noise_amount),
            "source": "HDFC"
        })

    # Save to CSV
    pd.DataFrame(payments).to_csv(os.path.join(generated_dir, "payments.csv"), index=False)
    pd.DataFrame(batches).to_csv(os.path.join(generated_dir, "settlement_batches.csv"), index=False)
    pd.DataFrame(line_items).to_csv(os.path.join(generated_dir, "settlement_line_items.csv"), index=False)
    pd.DataFrame(bank_txs).to_csv(os.path.join(generated_dir, "bank_transactions.csv"), index=False)
    pd.DataFrame(ground_truth).to_csv(os.path.join(evaluation_dir, "ground_truth.csv"), index=False)
    
    print(f"Deterministic dataset generated: {len(payments)} payments, {len(batches)} batches, {len(bank_txs)} bank transactions.")
