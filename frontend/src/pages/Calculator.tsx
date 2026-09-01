import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import DecisionBadge from '../components/reconciliation/DecisionBadge';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Calculator() {
  const [grossAmount, setGrossAmount] = useState<number>(50000);
  const [feeRate, setFeeRate] = useState<number>(2.0);
  const [taxRate, setTaxRate] = useState<number>(18.0);
  const [delayDays, setDelayDays] = useState<number>(1);
  const [refMatchQuality, setRefMatchQuality] = useState<number>(98);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

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
    <PageContainer title="Revenue Recovery & Leakage Calculator">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Input Parameters Form */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CalcIcon className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Revenue Transaction Parameters</h3>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Gross Revenue Transaction Volume (₹)</label>
              <input
                type="number"
                value={grossAmount}
                onChange={(e) => setGrossAmount(parseFloat(e.target.value) || 0)}
                className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Gateway Fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={feeRate}
                  onChange={(e) => setFeeRate(parseFloat(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Fee GST Tax (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Gateway Delay Window (Days)</label>
                <input
                  type="number"
                  value={delayDays}
                  onChange={(e) => setDelayDays(parseInt(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Reference Signature Quality (%)</label>
                <input
                  type="number"
                  value={refMatchQuality}
                  onChange={(e) => setRefMatchQuality(parseInt(e.target.value) || 0)}
                  className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Results Panel */}
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Recoverable Revenue Breakdown</h3>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 uppercase">
                Recovery Model
              </span>
            </div>

            <div className="space-y-4 mt-6">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold uppercase">Net Recoverable Revenue</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">{formatter.format(netPayout)}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Gross Revenue Volume</span>
                  <span className="font-mono text-slate-200">{formatter.format(grossAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>Gateway Fee Leakage ({feeRate}%)</span>
                  <span className="font-mono text-rose-400">-{formatter.format(calculatedFee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800 text-slate-400">
                  <span>GST Tax Impact ({taxRate}%)</span>
                  <span className="font-mono text-rose-400">-{formatter.format(calculatedTax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recovery Confidence Score</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{confidencePct}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Autonomous Recovery Action</span>
              <DecisionBadge decision={recommendedAction} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

