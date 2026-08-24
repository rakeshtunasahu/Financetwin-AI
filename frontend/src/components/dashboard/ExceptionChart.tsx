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
      <div className="flex items-center justify-center h-64 text-zinc-500 text-xs">
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
          margin={{ top: 10, right: 10, left: 30, bottom: 5 }}
        >
          <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} />
          <YAxis type="category" dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
