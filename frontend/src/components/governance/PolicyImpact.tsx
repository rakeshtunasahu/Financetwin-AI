import React from 'react';
import { PolicyImpactMetrics } from '../../types';
import { TrendingDown, TrendingUp, BarChart2 } from 'lucide-react';

interface PolicyImpactProps {
  before: PolicyImpactMetrics | null;
  after: PolicyImpactMetrics | null;
}

export default function PolicyImpact({ before, after }: PolicyImpactProps) {
  if (!before || !after) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

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
    <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 font-sans">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <BarChart2 className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Simulation Policy Impact Analysis</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider bg-slate-950/60">
              <th className="py-2.5 px-3">Metric Indicator</th>
              <th className="py-2.5 px-3 text-right">Active Policy</th>
              <th className="py-2.5 px-3 text-right">Simulated Policy</th>
              <th className="py-2.5 px-3 text-right">Impact Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {rows.map((row, idx) => {
              const bVal = typeof row.beforeVal === 'number' ? row.beforeVal : parseFloat(String(row.beforeVal).replace(/[^0-9.-]/g, '')) || 0;
              const aVal = typeof row.afterVal === 'number' ? row.afterVal : parseFloat(String(row.afterVal).replace(/[^0-9.-]/g, '')) || 0;
              const diff = aVal - bVal;
              
              let badgeColor = 'text-slate-400 bg-slate-800/50 border-slate-700/50';
              let icon = null;
              
              if (diff !== 0) {
                const isPositive = diff > 0;
                const isBetter = (row.type === 'higher-better' && isPositive) || (row.type === 'lower-better' && !isPositive);
                badgeColor = isBetter ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/80' : 'text-rose-300 bg-rose-950/80 border-rose-800/80';
                icon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
              }

              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-300">{row.name}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">{row.beforeVal}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-100">{row.afterVal}</td>
                  <td className="py-3 px-3 text-right">
                    {diff !== 0 ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badgeColor}`}>
                        {icon}
                        {diff > 0 ? '+' : ''}{typeof row.beforeVal === 'number' ? diff : diff.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-xs">—</span>
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

