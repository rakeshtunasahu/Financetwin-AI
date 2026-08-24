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
    { name: 'Unmatched', value: unmatched, color: '#71717a' }
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-xs">
        No reconciliation run data loaded
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
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
