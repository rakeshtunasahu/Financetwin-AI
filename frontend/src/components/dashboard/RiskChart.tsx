import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RiskChartProps {
  exceptions: Array<{ severity: string; expected_amount: number }>;
}

export default function RiskChart({ exceptions }: RiskChartProps) {
  const severityCounts = exceptions.reduce((acc: Record<string, number>, curr) => {
    const sev = curr.severity.toUpperCase();
    acc[sev] = (acc[sev] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Low Risk', count: severityCounts['LOW'] || 0, color: '#3b82f6' }, 
    { name: 'Medium Risk', count: severityCounts['MEDIUM'] || 0, color: '#f59e0b' }, 
    { name: 'High Risk', count: severityCounts['HIGH'] || 0, color: '#f97316' }, 
    { name: 'Critical', count: severityCounts['CRITICAL'] || 0, color: '#ef4444' }
  ];

  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
        No risk profiles detected
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
            itemStyle={{ color: '#f8fafc' }}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

