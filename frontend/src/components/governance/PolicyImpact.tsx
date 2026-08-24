import React from 'react';
import { PolicyImpactMetrics } from '../../types';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface PolicyImpactProps {
  before: PolicyImpactMetrics | null;
  after: PolicyImpactMetrics | null;
}

export default function PolicyImpact({ before, after }: PolicyImpactProps) {
  if (!before || !after) return null;

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const rows = [
    { name: 'Matched Count', beforeVal: before.match_count, afterVal: after.match_count, type: 'higher-better' },
    { name: 'Abstained Count', beforeVal: before.abstain_count, afterVal: after.abstain_count, type: 'lower-better' },
    { name: 'Exception Count', beforeVal: before.exception_count, afterVal: after.exception_count, type: 'lower-better' },
    { name: 'Manual Review Count', beforeVal: before.manual_review_count, afterVal: after.manual_review_count, type: 'lower-better' },
    { name: 'Auto-Resolve Count', beforeVal: before.auto_resolve_count, afterVal: after.auto_resolve_count, type: 'higher-better' },
    { name: 'Reconciliation Coverage', beforeVal: `${(before.coverage * 100).toFixed(1)}%`, afterVal: `${(after.coverage * 100).toFixed(1)}%`, type: 'higher-better' },
    { name: 'False Match Rate (FMR)', beforeVal: before.false_match_rate !== null ? `${(before.false_match_rate * 100).toFixed(2)}%` : 'N/A', afterVal: after.false_match_rate !== null ? `${(after.false_match_rate * 100).toFixed(2)}%` : 'N/A', type: 'lower-better' },
    { name: 'Exposure Capital at Risk', beforeVal: formatter.format(before.financial_amount_at_risk), afterVal: formatter.format(after.financial_amount_at_risk), type: 'lower-better' }
  ];

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <TrendingUp className="w-5 h-5 text-brand-500" />
        <h3 className="text-sm font-semibold text-zinc-300">Simulation Policy Impact Analysis</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              <th className="pb-3">Metric Name</th>
              <th className="pb-3 text-right">Active Policy</th>
              <th className="pb-3 text-right">Simulated Policy</th>
              <th className="pb-3 text-right">Impact Deviation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
            {rows.map((row, idx) => {
              const bVal = typeof row.beforeVal === 'number' ? row.beforeVal : parseFloat(String(row.beforeVal).replace(/[^0-9.-]/g, '')) || 0;
              const aVal = typeof row.afterVal === 'number' ? row.afterVal : parseFloat(String(row.afterVal).replace(/[^0-9.-]/g, '')) || 0;
              const diff = aVal - bVal;
              
              let badgeColor = 'text-zinc-500 bg-zinc-950/20';
              let icon = null;
              
              if (diff !== 0) {
                const isPositive = diff > 0;
                const isBetter = (row.type === 'higher-better' && isPositive) || (row.type === 'lower-better' && !isPositive);
                badgeColor = isBetter ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
                icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
              }

              return (
                <tr key={idx} className="hover:bg-zinc-900/10">
                  <td className="py-3 font-medium text-zinc-400">{row.name}</td>
                  <td className="py-3 text-right font-mono text-zinc-300">{row.beforeVal}</td>
                  <td className="py-3 text-right font-mono font-semibold text-white">{row.afterVal}</td>
                  <td className="py-3 text-right">
                    {diff !== 0 ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {icon}
                        {diff > 0 ? '+' : ''}{typeof row.beforeVal === 'number' ? diff : diff.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
