import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import DecisionBadge from '../components/reconciliation/DecisionBadge';
import { Calculator as CalcIcon, Percent, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

export default function Calculator() {
  const [grossAmount, setGrossAmount] = useState<number>(50000);
  const [feeRate, setFeeRate] = useState<number>(2.0);
  const [taxRate, setTaxRate] = useState<number>(18.0);
  const [delayDays, setDelayDays] = useState<number>(1);
  const [refMatchQuality, setRefMatchQuality] = useState<number>(98);

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  // Calculations
  const calculatedFee = (grossAmount * feeRate) / 100;
  const calculatedTax = (calculatedFee * taxRate) / 100;
  const netPayout = grossAmount - calculatedFee - calculatedTax;

  // Estimated Risk Confidence Score
  const baseConfidence = (refMatchQuality / 100) * 0.70 + (delayDays <= 2 ? 0.30 : 0.15);
  const confidencePct = Math.min(Math.round(baseConfidence * 100), 100);

  let recommendedAction = 'AUTO_RESOLVE';
  if (confidencePct < 90 || netPayout > 200000) {
    recommendedAction = 'MANUAL_REVIEW';
  } else if (confidencePct < 80) {
    recommendedAction = 'GENERATE_DISPUTE';
  }

  return (
    <PageContainer title="Interactive Settlement & Risk Calculator">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters Form */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <CalcIcon className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-semibold text-zinc-300">Transaction Parameters</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-semibold uppercase">Gross Settlement Payout (₹)</label>
              <input
                type="number"
                value={grossAmount}
                onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
                className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-semibold uppercase">Gateway Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={feeRate}
                  onChange={(e) => setFeeRate(parseFloat(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-semibold uppercase">Fee Tax / GST (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-semibold uppercase">Expected Credit Delay (Days)</label>
                <input
                  type="number"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-semibold uppercase">UTR Ref Similarity (%)</label>
                <input
                  type="number"
                  value={refMatchQuality}
                  onChange={(e) => setRefMatchQuality(parseInt(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="glass-panel p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300">Live Breakdown Results</h3>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Calculated Instantaneously
              </span>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 flex justify-between items-center">
                <span className="text-xs text-zinc-400 font-semibold">Net Payout Expected</span>
                <span className="text-xl font-bold text-white font-mono">{formatter.format(netPayout)}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-zinc-850 text-zinc-400">
                  <span>Gross Payout Base</span>
                  <span className="font-mono text-white">{formatter.format(grossAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850 text-zinc-400">
                  <span>Deducted Gateway Fee ({feeRate}%)</span>
                  <span className="font-mono text-red-400">-{formatter.format(calculatedFee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-850 text-zinc-400">
                  <span>GST Tax on Fee ({taxRate}%)</span>
                  <span className="font-mono text-red-400">-{formatter.format(calculatedTax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-zinc-400 uppercase">Match Safety Score</span>
              <span className="text-sm font-bold font-mono text-brand-500">{confidencePct}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-850">
              <span className="text-xs text-zinc-400 font-semibold">Engine Automation Decision</span>
              <DecisionBadge decision={recommendedAction} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
