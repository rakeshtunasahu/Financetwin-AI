import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ReconciliationChartProps {
  matched: number;
  abstained: number;
  exceptions: number;
  unmatched: number;
}

export default function ReconciliationChart({ 
  matched, 
  abstained, 
  exceptions, 
  unmatched 
}: ReconciliationChartProps) {
  const data = [
    { name: 'Matched', value: matched, color: '#10b981' }, 
    { name: 'Abstained', value: abstained, color: '#f59e0b' }, 
    { name: 'Exceptions', value: exceptions, color: '#ef4444' }, 
    { name: 'Unmatched', value: unmatched, color: '#64748b' }
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
        No reconciliation data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

