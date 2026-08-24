import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trendType = 'neutral' 
}: MetricCardProps) {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'text-emerald-500';
    if (trendType === 'negative') return 'text-red-500';
    return 'text-zinc-500';
  };

  return (
    <div className="glass-panel p-6 flex flex-col justify-between min-h-[120px] transition-all hover:border-zinc-700">
      <div className="flex justify-between items-start">
        <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">{title}</span>
        <div className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        {subtext && (
          <p className={`text-xs mt-1 font-medium ${getTrendColor()}`}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
