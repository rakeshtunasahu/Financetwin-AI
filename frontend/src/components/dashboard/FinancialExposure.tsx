import React from 'react';
import { AlertCircle, TrendingUp, Shield, Wallet, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
    currency: 'INR'
  });

  return (
    <div className="glass-panel glass-panel-hover p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-white tracking-tight">Financial Exposure & Capital Protection</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Real-time gateway payout variance analysis and risk exposure monitoring</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" />
          Ledger Audited
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Net Expected Payout */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 flex items-center justify-between hover:border-zinc-700 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Total Net Expected Payout</span>
              <h4 className="text-lg font-bold text-white mt-0.5 font-mono">{formatter.format(totalSettlementsAmount)}</h4>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-zinc-600" />
        </div>

        {/* Capital at Risk */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-red-500/20 flex items-center justify-between hover:border-red-500/40 transition-all bg-red-500/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-red-400/90 uppercase tracking-widest font-bold">Capital Exposure at Risk</span>
              <h4 className="text-lg font-bold text-red-400 mt-0.5 font-mono">{formatter.format(amountAtRisk)}</h4>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[9px] font-bold text-red-400 bg-red-500/10 rounded uppercase border border-red-500/20">
            Action Req.
          </span>
        </div>

        {/* Unresolved Variance */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-amber-500/20 flex items-center justify-between hover:border-amber-500/40 transition-all bg-amber-500/[0.02]">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-amber-400/90 uppercase tracking-widest font-bold">Unresolved Variance Delta</span>
              <h4 className="text-lg font-bold text-amber-400 mt-0.5 font-mono">{formatter.format(unresolvedVariance)}</h4>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {unresolvedVariance > 0 ? 'Pending' : 'Zero Risk'}
          </span>
        </div>
      </div>
    </div>
  );
}
