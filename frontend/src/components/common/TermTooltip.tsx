import React, { useState, createContext, useContext } from 'react';
import { HelpCircle, Info, Sparkles, BookOpen, ShieldCheck, TrendingUp, AlertTriangle, Layers } from 'lucide-react';

export interface TermDefinition {
  title: string;
  category: 'Financial Core' | 'Reconciliation' | 'Autonomous Engine' | 'Governance & Risk' | 'Settlement & Banking';
  shortDef: string;
  details: string;
  formulaOrRule?: string;
  icon?: React.ReactNode;
}

export const FINANCIAL_GLOSSARY: Record<string, TermDefinition> = {
  'variance': {
    title: 'Financial Variance',
    category: 'Financial Core',
    shortDef: 'Difference between expected settlement and actual received amount.',
    details: 'Occurs when gateway fees, statutory taxes, currency conversion, or unbilled adjustments cause net received cash to deviate from gross transaction sum.',
    formulaOrRule: 'Variance = Expected Amount - Actual Bank Credit'
  },
  'expected recovery': {
    title: 'Expected Recovery Math',
    category: 'Autonomous Engine',
    shortDef: 'Projected cash recoverable weighted by AI diagnosis confidence.',
    details: 'RevenueRescue AI calculates probable recovery by multiplying the transaction variance with the historical channel success probability and ML model confidence.',
    formulaOrRule: 'Expected Recovery = Amount × P(Channel Success) × Model Confidence'
  },
  'revenue at risk': {
    title: 'Revenue at Risk / Financial Exposure',
    category: 'Financial Core',
    shortDef: 'Total unsettled, failing, or mismatched receivables vulnerable to leakage.',
    details: 'Unreconciled transactions exceeding aging thresholds without active resolution or automated intervention workflows.'
  },
  'financial exposure': {
    title: 'Financial Exposure',
    category: 'Financial Core',
    shortDef: 'Total potential financial loss from unreconciled or disputed payment batches.',
    details: 'Aggregated exposure across ghost transactions, fee discrepancies, aging receivables, and pending gateway payouts.'
  },
  'settlement batch': {
    title: 'Settlement Batch (UTR)',
    category: 'Settlement & Banking',
    shortDef: 'Aggregated net payout transferred by payment gateway to merchant bank.',
    details: 'Payment aggregators group multiple client payments into a single lump sum linked by a unique UTR (Unique Transaction Reference) number.'
  },
  'mdr / gateway fee': {
    title: 'Merchant Discount Rate (MDR)',
    category: 'Financial Core',
    shortDef: 'Fee percentage charged by payment processors per transaction.',
    details: 'Gateway commissions typically range from 1.5% to 2.5% plus GST/taxes. Discrepancies in MDR tiers lead to financial reconciliation leakage.',
    formulaOrRule: 'Gateway Fee = (Gross Amount × MDR Rate) + Applicable GST'
  },
  'mdr': {
    title: 'Merchant Discount Rate (MDR)',
    category: 'Financial Core',
    shortDef: 'Fee percentage charged by payment processors per transaction.',
    details: 'Gateway commissions typically range from 1.5% to 2.5% plus GST/taxes. Discrepancies in MDR tiers lead to financial reconciliation leakage.'
  },
  'ghost transaction': {
    title: 'Ghost Transaction',
    category: 'Reconciliation',
    shortDef: 'Payment recorded in bank statement with no corresponding internal order.',
    details: 'Customer paid successfully via banking rail but payment gateway webhook dropped or network timed out before internal order creation.'
  },
  'disputed chargeback': {
    title: 'Disputed Chargeback',
    category: 'Governance & Risk',
    shortDef: 'Customer or issuing bank clawback due to alleged fraud or non-delivery.',
    details: 'Requires immediate temporary freeze, evidence submission, and reserve hold adjustment within statutory dispute deadlines.'
  },
  'deterministic guardrail': {
    title: 'Deterministic Guardrail',
    category: 'Governance & Risk',
    shortDef: 'Hard bounded financial policy preventing unauthorized AI execution.',
    details: 'Enforces strict ceiling limits (e.g., max ₹10,000 auto-recovery), multi-signature manager approval requirements, and velocity caps.',
    formulaOrRule: 'Auto-Execution Allowed IF Amount ≤ Policy Cap AND Confidence ≥ 90%'
  },
  'guardrail engine': {
    title: 'Autonomous Guardrail Engine',
    category: 'Governance & Risk',
    shortDef: 'Continuous boundary checker verifying execution limits before dispatching actions.',
    details: 'Intercepts every autonomous recovery command and prevents actions that violate risk policies or require human approval.'
  },
  '4-pass reconciliation': {
    title: '4-Pass Conservative Reconciliation',
    category: 'Reconciliation',
    shortDef: 'Multi-stage deterministic matching engine guaranteeing zero false-positives.',
    details: 'Pass 1: Exact 1-to-1 Order ID Match • Pass 2: Amount + Timestamp + Reference • Pass 3: Batch Aggregate Group Sum • Pass 4: Split Multi-Leg Payouts.'
  },
  '10-step lifecycle': {
    title: '10-Step Autonomous Recovery Lifecycle',
    category: 'Autonomous Engine',
    shortDef: 'Complete pipeline from ingestion to final ledger reconciliation.',
    details: 'Ingestion → Anomaly Detection → ML Clustering → Root Cause Diagnosis → Policy Simulation → Approval Verification → Bounded Execution → Webhook Retry / Force Settle → Ledger Credit → Telemetry Audit.'
  },
  're-trigger webhook': {
    title: 'Re-trigger Webhook',
    category: 'Autonomous Engine',
    shortDef: 'Idempotent resend of payment notification to update merchant internal ledger.',
    details: 'Safely resolves dropped callbacks without double-charging the customer or generating duplicate transactions.'
  },
  'force settle': {
    title: 'Force Settle with Gateway Clearance',
    category: 'Autonomous Engine',
    shortDef: 'Manual or automated ledger synchronization after verifying bank UTR.',
    details: 'Validates that banking settlement is complete, updates payment state from PENDING to SETTLED, and records audit trail.'
  },
  'idempotency': {
    title: 'Idempotency Protection',
    category: 'Governance & Risk',
    shortDef: 'Guarantee that an action executed multiple times produces the identical result.',
    details: 'Uses unique deterministic cryptographic keys per transaction to prevent double refunds, duplicate payouts, or redundant ledger credits.'
  },
  'aging bucket': {
    title: 'Aging Bucket',
    category: 'Financial Core',
    shortDef: 'Categorization of unresolved receivables by duration since transaction.',
    details: 'Common brackets: 0-7 Days (Immediate Action), 8-30 Days (Escalated Review), 30-90 Days (High Risk), 90+ Days (Doubtful Debt).'
  },
  'anomaly clustering': {
    title: 'ML Anomaly Clustering',
    category: 'Autonomous Engine',
    shortDef: 'Unsupervised Machine Learning grouping similar payment failure patterns.',
    details: 'Uses Scikit-Learn DBSCAN / K-Means algorithms over variance, latency, fee ratio, and failure codes to pinpoint systemic root causes.'
  },
  'audit trail': {
    title: 'Immutable Audit Trail',
    category: 'Governance & Risk',
    shortDef: 'Append-only chronological record of all system decisions and operator actions.',
    details: 'Logs every autonomous recovery, simulated policy, manager approval, and user login with timestamp, actor name, and masked metadata.'
  },
  'policy simulation': {
    title: 'Policy Simulation (What-If Analysis)',
    category: 'Governance & Risk',
    shortDef: 'Sandboxed impact evaluation before activating financial governance rules.',
    details: 'Simulates changes to confidence thresholds or exposure caps on historical data to predict recovery yield and false match rate.'
  },
  'net expected': {
    title: 'Net Expected Amount',
    category: 'Financial Core',
    shortDef: 'Net receivable cash expected in merchant bank account after deductions.',
    details: 'Calculated by subtracting contractual gateway MDR fees and applicable GST from the gross transaction value.',
    formulaOrRule: 'Net Expected = Gross Transaction Amount - Gateway Fee - GST'
  }
};

// Global Context to toggle Tooltip Explainers across whole app
interface GlossaryContextType {
  tooltipsEnabled: boolean;
  setTooltipsEnabled: (enabled: boolean) => void;
  activeGlossaryTerm: TermDefinition | null;
  openTermModal: (termKey: string) => void;
  closeTermModal: () => void;
}

const GlossaryContext = createContext<GlossaryContextType>({
  tooltipsEnabled: true,
  setTooltipsEnabled: () => {},
  activeGlossaryTerm: null,
  openTermModal: () => {},
  closeTermModal: () => {}
});

export const GlossaryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tooltipsEnabled, setTooltipsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('revenuerescue_tooltips_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<TermDefinition | null>(null);

  const toggleTooltips = (enabled: boolean) => {
    setTooltipsEnabled(enabled);
    localStorage.setItem('revenuerescue_tooltips_enabled', String(enabled));
  };

  const openTermModal = (termKey: string) => {
    const key = termKey.toLowerCase().trim();
    if (FINANCIAL_GLOSSARY[key]) {
      setActiveGlossaryTerm(FINANCIAL_GLOSSARY[key]);
    }
  };

  const closeTermModal = () => {
    setActiveGlossaryTerm(null);
  };

  return (
    <GlossaryContext.Provider
      value={{
        tooltipsEnabled,
        setTooltipsEnabled: toggleTooltips,
        activeGlossaryTerm,
        openTermModal,
        closeTermModal
      }}
    >
      {children}
      {/* Active Modal Detail Popup if user clicks term */}
      {activeGlossaryTerm && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeTermModal}
        >
          <div
            className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{activeGlossaryTerm.title}</h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {activeGlossaryTerm.category}
                  </span>
                </div>
              </div>
              <button
                onClick={closeTermModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <p className="font-medium text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {activeGlossaryTerm.shortDef}
              </p>
              <p>{activeGlossaryTerm.details}</p>

              {activeGlossaryTerm.formulaOrRule && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60">
                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block mb-1">
                    📐 Formula / Policy Rule:
                  </span>
                  <code className="text-[11px] font-mono text-cyan-300 block">
                    {activeGlossaryTerm.formulaOrRule}
                  </code>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={closeTermModal}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </GlossaryContext.Provider>
  );
};

export const useGlossary = () => useContext(GlossaryContext);

// Reusable Hover Term Explainer Component
interface TermProps {
  name?: string;
  word?: string;
  children?: React.ReactNode;
  inline?: boolean;
}

export const Term: React.FC<TermProps> = ({ name, word, children, inline = true }) => {
  const { tooltipsEnabled, openTermModal } = useGlossary();
  const [showTooltip, setShowTooltip] = useState(false);

  const termKey = (name || word || (typeof children === 'string' ? children : '')).toLowerCase().trim();
  const definition = FINANCIAL_GLOSSARY[termKey];

  if (!definition) {
    return <>{children || name || word}</>;
  }

  const getCategoryColor = (cat: TermDefinition['category']) => {
    switch (cat) {
      case 'Financial Core':
        return 'text-amber-400 bg-amber-950/70 border-amber-800';
      case 'Autonomous Engine':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-800';
      case 'Governance & Risk':
        return 'text-rose-400 bg-rose-950/70 border-rose-800';
      case 'Settlement & Banking':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800';
      default:
        return 'text-indigo-400 bg-indigo-950/70 border-indigo-800';
    }
  };

  return (
    <span
      className={`relative inline-flex items-center group cursor-help ${
        inline ? 'align-baseline' : ''
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        openTermModal(termKey);
      }}
    >
      <span
        className={`transition-colors ${
          tooltipsEnabled
            ? 'underline decoration-dotted decoration-indigo-400/70 underline-offset-4 hover:text-indigo-300 hover:decoration-indigo-300'
            : ''
        }`}
      >
        {children || definition.title}
      </span>

      {tooltipsEnabled && (
        <HelpCircle className="w-3 h-3 text-indigo-400/80 inline ml-1 opacity-60 group-hover:opacity-100 group-hover:text-cyan-400 transition-all shrink-0" />
      )}

      {/* Floating Hover Card */}
      {tooltipsEnabled && showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-slate-950/95 border border-indigo-500/40 rounded-xl shadow-2xl shadow-indigo-950/80 backdrop-blur-xl z-50 text-left pointer-events-none animate-in fade-in zoom-in-95"
          style={{ transformOrigin: 'bottom center' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{definition.title}</span>
            </div>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold uppercase ${getCategoryColor(
                definition.category
              )}`}
            >
              {definition.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-200 font-medium leading-relaxed mb-1.5">
            {definition.shortDef}
          </p>

          <p className="text-[10px] text-slate-400 leading-normal mb-2">
            {definition.details}
          </p>

          {/* Formula or rule if available */}
          {definition.formulaOrRule && (
            <div className="p-1.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 mb-1.5">
              <span className="text-[9px] font-mono text-indigo-400 block font-semibold">Rule:</span>
              <code className="text-[10px] font-mono text-cyan-300 block truncate">
                {definition.formulaOrRule}
              </code>
            </div>
          )}

          {/* Footer hint */}
          <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>💡 Click term for full info</span>
            <span className="text-cyan-400">RevenueRescue AI Glossary</span>
          </div>
        </div>
      )}
    </span>
  );
};
