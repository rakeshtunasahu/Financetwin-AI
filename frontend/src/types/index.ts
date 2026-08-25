export interface Payment {
  id: number;
  payment_id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  settlement_batch_id: number | null;
}

export interface SettlementBatch {
  id: number;
  settlement_id: string;
  merchant_id: string;
  gross_amount: number;
  gateway_fee: number;
  fee_tax: number;
  refunds: number;
  adjustments: number;
  reserves: number;
  net_amount: number;
  settlement_date: string;
  expected_credit_date: string;
  status: 'PENDING' | 'MATCHED' | 'EXCEPTION' | 'ABSTAINED' | 'UNMATCHED';
  utr: string | null;
  created_at: string;
}

export interface BankTransaction {
  id: number;
  bank_transaction_id: string;
  reference: string;
  credit_amount: number;
  debit_amount: number;
  transaction_date: string;
  description: string;
  balance: number;
  source: string;
  created_at: string;
}

export interface ReconciliationRun {
  id: number;
  run_id: string;
  started_at: string;
  completed_at: string | null;
  total_settlements: number;
  matched_count: number;
  abstained_count: number;
  exception_count: number;
  created_at: string;
}

export interface ReconciliationMatch {
  id: number;
  reconciliation_run_id: number;
  settlement_batch_id: number;
  bank_transaction_id: number | null;
  match_type: string;
  confidence: number;
  second_best_confidence: number | null;
  confidence_margin: number | null;
  matching_pass: number;
  decision: 'MATCH' | 'ABSTAIN' | 'NO_MATCH' | 'EXCEPTION';
  explainability_json: {
    pass_0_integrity_passed?: boolean;
    rejection_reason?: string | null;
    scoring_pass?: number;
    selected_candidate_id?: string | null;
    second_best_score?: number;
    confidence_margin?: number;
    required_margin?: number;
    candidate_scores?: Array<{
      tx_id: string;
      score: number;
      breakdown: {
        reference: number;
        amount: number;
        date: number;
        metadata: number;
      };
    }>;
  };
  created_at: string;
  settlement_batch: SettlementBatch;
  bank_transaction: BankTransaction | null;
}


export interface ExceptionRecord {
  id: number;
  exception_id: string;
  reconciliation_run_id: number;
  settlement_batch_id: number | null;
  bank_transaction_id: number | null;
  exception_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expected_amount: number;
  actual_amount: number;
  variance: number;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED' | 'MANUAL_REVIEW';
  anomaly_score: number | null;
  cluster_id: number | null;
  created_at: string;
  settlement_batch?: SettlementBatch;
  bank_transaction?: BankTransaction;
}

export interface AuditLogEntry {
  action: string;
  actor: string;
  decision: string;
  reason: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ExceptionDetail {
  exception_id: string;
  exception_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED' | 'MANUAL_REVIEW';
  expected_amount: number;
  actual_amount: number;
  variance: number;
  anomaly_score: number | null;
  cluster_id: number | null;
  created_at: string;
  settlement_batch: {
    settlement_id: string;
    merchant_id: string;
    gross_amount: number;
    net_amount: number;
    utr: string | null;
    settlement_date: string;
    expected_credit_date: string;
  } | null;
  bank_transaction: {
    bank_transaction_id: string;
    reference: string;
    credit_amount: number;
    transaction_date: string;
    description: string;
    source: string;
  } | null;
  match_details: {
    match_type: string;
    confidence: number;
    explainability: ReconciliationMatch['explainability_json'];
  };
  ai_investigation: {
    exception_type: string;
    root_cause: string;
    investigation_confidence: number;
    evidence_ids: string[];
    recommended_action: string;
    explanation: string;
  } | null;
  audit_history: AuditLogEntry[];
  risk_decision: {
    score: number;
    recommended_action: string;
  };
}

export interface DashboardSummary {
  total_settlements: number;
  matched_count: number;
  abstained_count: number;
  no_match_count: number;
  exception_count: number;
  match_rate: number;
  precision: number | null;
  recall: number;
  false_match_rate: number | null;
  coverage: number;
  auto_resolution_rate: number;
  financial_amount_at_risk: number;
}

export interface Policy {
  minimum_match_confidence: number;
  minimum_confidence_margin: number;
  max_auto_resolve_amount: number;
  high_value_transaction_threshold: number;
  amount_tolerance: number;
  date_tolerance_days: number;
  tax_rate: number;
  severity_weight_low: number;
  severity_weight_medium: number;
  severity_weight_high: number;
  severity_weight_critical: number;
}

export interface PolicyImpactMetrics {
  match_count: number;
  abstain_count: number;
  exception_count: number;
  manual_review_count: number;
  auto_resolve_count: number;
  coverage: number;
  false_match_rate: number | null;
  financial_amount_at_risk: number;
}

export interface PolicySimulationResponse {
  before: PolicyImpactMetrics;
  after: PolicyImpactMetrics;
}

export interface Anomaly {
  exception_id: string;
  exception_type: string;
  severity: string;
  expected_amount: number;
  actual_amount: number;
  variance: number;
  anomaly_score: number;
  anomaly_flag: number;
  cluster_id: number;
}

export interface Cluster {
  cluster_id: number;
  size: number;
  pattern: string;
  exceptions: Array<{
    exception_id: string;
    exception_type: string;
    severity: string;
    expected_amount: number;
    actual_amount: number;
    variance: number;
  }>;
}
