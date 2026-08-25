import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ExceptionChartProps {
  exceptions: Array<{ exception_type: string }>;
}

export default function ExceptionChart({ exceptions }: ExceptionChartProps) {
  const typeCounts = exceptions.reduce((acc: Record<string, number>, curr) => {
    const type = curr.exception_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const data = Object.keys(typeCounts).map(type => ({
    name: type.replace(/_/g, ' '),
    count: typeCounts[type]
  })).sort((a, b) => b.count - a.count);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-xs font-mono">
        No matching exceptions reported
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 10, left: 40, bottom: 5 }}
        >
          <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
            itemStyle={{ color: '#f8fafc' }}
            cursor={{ fill: 'rgba(51, 65, 85, 0.3)' }}
          />
          <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

