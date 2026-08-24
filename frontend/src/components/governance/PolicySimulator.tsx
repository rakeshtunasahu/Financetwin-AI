import React, { useState } from 'react';
import { Policy } from '../../types';
import { Play, Save } from 'lucide-react';

interface PolicySimulatorProps {
  policy: Policy | null;
  onSimulate: (values: Partial<Policy>) => void;
  onApply: (values: Policy) => void;
  loading: boolean;
}

export default function PolicySimulator({ policy, onSimulate, onApply, loading }: PolicySimulatorProps) {
  if (!policy) return null;

  const [minimumMatchConfidence, setMinimumMatchConfidence] = useState(policy.minimum_match_confidence);
  const [minimumConfidenceMargin, setMinimumConfidenceMargin] = useState(policy.minimum_confidence_margin);
  const [maxAutoResolveAmount, setMaxAutoResolveAmount] = useState(policy.max_auto_resolve_amount);
  const [highValueTransactionThreshold, setHighValueTransactionThreshold] = useState(policy.high_value_transaction_threshold);
  const [amountTolerance, setAmountTolerance] = useState(policy.amount_tolerance);
  const [dateToleranceDays, setDateToleranceDays] = useState(policy.date_tolerance_days);
  const [taxRate, setTaxRate] = useState(policy.tax_rate);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
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
    <form onSubmit={handleSimulate} className="glass-panel p-6 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-300">Governance Lab Simulator</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Adjust risk settings to evaluate impact on match rates, exceptions, and financial exposure BEFORE applying permanently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Min Match Confidence (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.5"
            max="1.0"
            value={minimumMatchConfidence}
            onChange={(e) => setMinimumMatchConfidence(parseFloat(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Min Confidence Margin (%)</label>
          <input
            type="number"
            step="0.01"
            min="0.0"
            max="0.5"
            value={minimumConfidenceMargin}
            onChange={(e) => setMinimumConfidenceMargin(parseFloat(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Max Auto-Resolve Amount (₹)</label>
          <input
            type="number"
            value={maxAutoResolveAmount}
            onChange={(e) => setMaxAutoResolveAmount(parseFloat(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">High-Value Threshold (₹)</label>
          <input
            type="number"
            value={highValueTransactionThreshold}
            onChange={(e) => setHighValueTransactionThreshold(parseFloat(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Amount Match Tolerance (₹)</label>
          <input
            type="number"
            step="0.01"
            value={amountTolerance}
            onChange={(e) => setAmountTolerance(parseFloat(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-semibold uppercase">Date Tolerance (Days)</label>
          <input
            type="number"
            value={dateToleranceDays}
            onChange={(e) => setDateToleranceDays(parseInt(e.target.value))}
            className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-zinc-800">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-brand-500/10"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          Simulate Policy Impact
        </button>

        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 disabled:opacity-50 rounded-lg text-xs font-bold transition-all hover:bg-zinc-800 active:scale-95 duration-150"
        >
          <Save className="w-3.5 h-3.5" />
          Apply Policy Changes
        </button>
      </div>
    </form>
  );
}
