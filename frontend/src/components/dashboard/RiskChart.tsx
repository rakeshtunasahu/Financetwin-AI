import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RiskChartProps {
  exceptions: Array<{ severity: string; expected_amount: number }>;
}

export default function RiskChart({ exceptions }: RiskChartProps) {
  const severityCounts = exceptions.reduce((acc: Record<string, number>, curr) => {
    const sev = curr.severity ? curr.severity.toUpperCase() : 'LOW';
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Low Risk', count: severityCounts['LOW'] || 0, color: '#3b82f6' }, 
    { name: 'Medium Risk', count: severityCounts['MEDIUM'] || 0, color: '#eab308' }, 
    { name: 'High Risk', count: severityCounts['HIGH'] || 0, color: '#f97316' }, 
    { name: 'Critical', count: severityCounts['CRITICAL'] || 0, color: '#f43f5e' }
  ];

  const totalExceptions = data.reduce((sum, d) => sum + d.count, 0);

  if (totalExceptions === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-slate-500 text-xs font-mono gap-1">
        <span className="text-slate-400 font-semibold">Zero Active Risk Flags</span>
        <span className="text-[11px] text-slate-500">No exception severities recorded</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  const pct = totalExceptions > 0 ? ((d.count / totalExceptions) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs font-mono">
                      <div className="font-semibold text-slate-200">{d.name}</div>
                      <div className="text-slate-300 mt-1">
                        Count: <strong className="text-white">{d.count}</strong> ({pct}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-slate-950/60 rounded border border-slate-800 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-400 truncate">{item.name}:</span>
            <span className="font-bold text-slate-200 ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


