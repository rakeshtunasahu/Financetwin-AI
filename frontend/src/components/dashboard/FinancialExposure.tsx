import React from 'react';
import { AlertCircle, TrendingUp, Shield, Wallet, CheckCircle2 } from 'lucide-react';

interface FinancialExposureProps {
  amountAtRisk: number;
  totalSettlementsAmount: number;
  unresolvedVariance: number;
}

export default function FinancialExposure({ 
  amountAtRisk, 
  totalSettlementsAmount, 
  unresolvedVariance 
}: FinancialExposureProps) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-4 relative overflow-hidden shadow-lg font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400 shrink-0" />
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">Revenue Exposure & Recovery Safety</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time gateway revenue leakage & recoverable pipeline</p>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 text-[10px] font-mono font-bold rounded uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>RECOVERY ACTIVE</span>
        </div>
      </div>

      {/* Vertical Stacking Cards - Clean & Responsive Layout */}
      <div className="flex flex-col gap-3">
        {/* Total Net Expected Payout */}
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-950/80 text-blue-400 rounded-lg border border-blue-800/60 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block truncate">Total Recoverable Pipeline</span>
              <h4 className="text-sm sm:text-base font-bold text-slate-100 font-mono truncate">{formatter.format(totalSettlementsAmount)}</h4>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold text-blue-400 bg-blue-950/80 rounded border border-blue-800/60">
            Captured
          </span>
        </div>

        {/* Capital Exposure at Risk */}
        <div className="p-3.5 bg-rose-950/25 rounded-xl border border-rose-900/50 flex items-center justify-between gap-3 hover:border-rose-800/70 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-rose-950 text-rose-400 rounded-lg border border-rose-800/60 shrink-0">
              <AlertCircle className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold block truncate">Revenue at Risk (Leakage)</span>
              <h4 className="text-sm sm:text-base font-bold text-rose-300 font-mono truncate">{formatter.format(amountAtRisk)}</h4>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold text-rose-300 bg-rose-950 rounded border border-rose-700">
            Action Req.
          </span>
        </div>

        {/* Unresolved Variance */}
        <div className="p-3.5 bg-amber-950/25 rounded-xl border border-amber-900/50 flex items-center justify-between gap-3 hover:border-amber-800/70 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/60 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold block truncate">Unrecovered Revenue Variance</span>
              <h4 className="text-sm sm:text-base font-bold text-amber-300 font-mono truncate">{formatter.format(unresolvedVariance)}</h4>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-300 bg-amber-950 rounded border border-amber-700">
            {unresolvedVariance !== 0 ? 'Discrepancy' : 'Protected'}
          </span>
        </div>
      </div>
    </div>
  );
}
