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
    maximumFractionDigits: 2
  });

  return (
    <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col gap-5 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">Financial Exposure & Capital Safety</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time gateway payout variance analysis and risk exposure monitoring</p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[10px] font-semibold rounded-md uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" />
          Safety Gate Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Net Expected Payout */}
        <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-950/80 text-blue-400 rounded-lg border border-blue-800/60">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Total Net Payout</span>
              <h4 className="text-base font-bold text-slate-100 mt-0.5 font-mono">{formatter.format(totalSettlementsAmount)}</h4>
            </div>
          </div>
        </div>

        {/* Capital Exposure at Risk */}
        <div className="p-4 bg-rose-950/20 rounded-lg border border-rose-900/40 flex items-center justify-between hover:border-rose-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-950 text-rose-400 rounded-lg border border-rose-800/60">
              <AlertCircle className="w-4 h-4 animate-pulse-subtle" />
            </div>
            <div>
              <span className="text-[10px] text-rose-400/90 uppercase tracking-wider font-semibold block">Capital at Risk</span>
              <h4 className="text-base font-bold text-rose-300 mt-0.5 font-mono">{formatter.format(amountAtRisk)}</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-bold text-rose-400 bg-rose-950/80 rounded border border-rose-800/60">
            Action Req.
          </span>
        </div>

        {/* Unresolved Variance */}
        <div className="p-4 bg-amber-950/20 rounded-lg border border-amber-900/40 flex items-center justify-between hover:border-amber-800/60 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/60">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400/90 uppercase tracking-wider font-semibold block">Unresolved Variance</span>
              <h4 className="text-base font-bold text-amber-300 mt-0.5 font-mono">{formatter.format(unresolvedVariance)}</h4>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {unresolvedVariance > 0 ? 'Review' : 'Balanced'}
          </span>
        </div>
      </div>
    </div>
  );
}

