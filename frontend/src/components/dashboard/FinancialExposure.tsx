import React from 'react';
import { AlertCircle, TrendingUp, Shield } from 'lucide-react';

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
    <div className="glass-panel p-6 flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-300">Financial Exposure Analytics</h3>
        <p className="text-xs text-zinc-500 mt-1">Real-time settlement variance and capital exposure analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Total Net Expected</span>
            <h4 className="text-base font-bold text-white mt-0.5">{formatter.format(totalSettlementsAmount)}</h4>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
            <AlertCircle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Capital at Risk</span>
            <h4 className="text-base font-bold text-red-400 mt-0.5">{formatter.format(amountAtRisk)}</h4>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Unresolved Variance</span>
            <h4 className="text-base font-bold text-amber-400 mt-0.5">{formatter.format(unresolvedVariance)}</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
