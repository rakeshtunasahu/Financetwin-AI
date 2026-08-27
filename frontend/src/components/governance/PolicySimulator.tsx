import React, { useState } from 'react';
import { Policy } from '../../types';
import { Play, Save, SlidersHorizontal, Lock, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PolicySimulatorProps {
  policy: Policy | null;
  onSimulate: (values: Partial<Policy>) => void;
  onApply: (values: Policy) => void;
  loading: boolean;
}

export default function PolicySimulator({ policy, onSimulate, onApply, loading }: PolicySimulatorProps) {
  const { currentUser, hasPermission, isRole } = useAuth();
  if (!policy) return null;

  const [minimumMatchConfidence, setMinimumMatchConfidence] = useState(policy.minimum_match_confidence);
  const [minimumConfidenceMargin, setMinimumConfidenceMargin] = useState(policy.minimum_confidence_margin);
  const [maxAutoResolveAmount, setMaxAutoResolveAmount] = useState(policy.max_auto_resolve_amount);
  const [highValueTransactionThreshold, setHighValueTransactionThreshold] = useState(policy.high_value_transaction_threshold);
  const [amountTolerance, setAmountTolerance] = useState(policy.amount_tolerance);
  const [dateToleranceDays, setDateToleranceDays] = useState(policy.date_tolerance_days);
  const [taxRate, setTaxRate] = useState(policy.tax_rate);

  const canSimulate = hasPermission('can_simulate_policy');
  const canApply = hasPermission('can_apply_policy');

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSimulate) return;
    onSimulate({
      minimum_match_confidence: minimumMatchConfidence,
      minimum_confidence_margin: minimumConfidenceMargin,
      max_auto_resolve_amount: maxAutoResolveAmount,
      high_value_transaction_threshold: highValueTransactionThreshold,
      amount_tolerance: amountTolerance,
      date_tolerance_days: dateToleranceDays,
      tax_rate: taxRate,
    });
  };

  const handleApply = () => {
    if (!canApply) return;
    onApply({
      minimum_match_confidence: minimumMatchConfidence,
      minimum_confidence_margin: minimumConfidenceMargin,
      max_auto_resolve_amount: maxAutoResolveAmount,
      high_value_transaction_threshold: highValueTransactionThreshold,
      amount_tolerance: amountTolerance,
      date_tolerance_days: dateToleranceDays,
      tax_rate: taxRate,
      severity_weight_low: policy.severity_weight_low,
      severity_weight_medium: policy.severity_weight_medium,
      severity_weight_high: policy.severity_weight_high,
      severity_weight_critical: policy.severity_weight_critical,
    });
  };

  return (
    <form onSubmit={handleSimulate} className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">SIMULATED POLICY CONTROLS</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adjust safety parameters to simulate the before-vs-after impact on Match Count, Coverage, and Financial Exposure.
          </p>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded border border-blue-800/80 font-bold uppercase">
          {canApply ? 'FULL ADMIN ACCESS' : canSimulate ? 'SIMULATION ONLY' : 'READ ONLY'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Min Match Confidence (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.5"
            max="1.0"
            disabled={!canSimulate}
            value={minimumMatchConfidence}
            onChange={(e) => setMinimumMatchConfidence(parseFloat(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Min Safety Margin (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.0"
            max="0.5"
            disabled={!canSimulate}
            value={minimumConfidenceMargin}
            onChange={(e) => setMinimumConfidenceMargin(parseFloat(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Max Auto-Resolve Amount (₹)</label>
          <input
            type="number"
            disabled={!canSimulate}
            value={maxAutoResolveAmount}
            onChange={(e) => setMaxAutoResolveAmount(parseFloat(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">High-Value Threshold (₹)</label>
          <input
            type="number"
            disabled={!canSimulate}
            value={highValueTransactionThreshold}
            onChange={(e) => setHighValueTransactionThreshold(parseFloat(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Amount Match Tolerance (₹)</label>
          <input
            type="number"
            step="0.01"
            disabled={!canSimulate}
            value={amountTolerance}
            onChange={(e) => setAmountTolerance(parseFloat(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Date Tolerance (Days)</label>
          <input
            type="number"
            disabled={!canSimulate}
            value={dateToleranceDays}
            onChange={(e) => setDateToleranceDays(parseInt(e.target.value))}
            className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {canSimulate && (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-sm w-full sm:w-auto"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulate Policy Impact</span>
            </button>
          )}

          {canApply ? (
            <button
              type="button"
              onClick={handleApply}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50 rounded-lg text-xs font-semibold transition-all w-full sm:w-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Policy Changes Live</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Apply Restricted ({currentUser.role})</span>
            </div>
          )}
        </div>

        {!canApply && (
          <p className="text-[11px] font-mono text-slate-500">
            * Live policy modifications are restricted to Admin role to prevent accidental configuration drift.
          </p>
        )}
      </div>
    </form>
  );
}
