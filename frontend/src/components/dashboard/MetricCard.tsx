import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Activity, ShieldAlert } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  isProminent?: boolean;
}

export default function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  subtext, 
  trendType = 'neutral',
  isProminent = false
}: MetricCardProps) {
  // Auto-detect high priority financial safety metrics if not explicitly passed
  const isHighPriority = isProminent || 
    title.toLowerCase().includes('false match') || 
    title.toLowerCase().includes('coverage') || 
    title.toLowerCase().includes('amount at risk');

  const getTrendBadge = () => {
    if (trendType === 'positive') return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
    if (trendType === 'negative') return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    return 'text-slate-400 bg-slate-800/60 border-slate-700/60';
  };

  const getTrendIcon = () => {
    if (trendType === 'positive') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (trendType === 'negative') return <TrendingDown className="w-3 h-3 text-rose-400" />;
    return <Activity className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div
      className={`p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between relative group ${
        isHighPriority
          ? 'bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-950/20 ring-1 ring-blue-500/20'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {isHighPriority && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" title="Primary Safety Metric" />
          )}
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
        </div>
        <div
          className={`p-2 rounded-lg border ${
            isHighPriority
              ? 'bg-blue-950/80 text-blue-400 border-blue-800/60'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/50'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className={`font-mono font-bold tracking-tight text-slate-100 ${
            isHighPriority ? 'text-2xl sm:text-3xl text-white' : 'text-xl sm:text-2xl'
          }`}>
            {value}
          </div>
          {subtext && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded border text-[10px] font-semibold ${getTrendBadge()}`}>
              {getTrendIcon()}
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

