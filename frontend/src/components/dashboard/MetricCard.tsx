import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
  const isHighPriority = isProminent || 
    title.toLowerCase().includes('false match') || 
    title.toLowerCase().includes('coverage') || 
    title.toLowerCase().includes('amount at risk');

  const getTrendBadge = () => {
    if (trendType === 'positive') return 'text-emerald-300 bg-emerald-950/80 border-emerald-800/80';
    if (trendType === 'negative') return 'text-rose-300 bg-rose-950/80 border-rose-800/80';
    return 'text-slate-300 bg-slate-800/80 border-slate-700/80';
  };

  const getTrendIcon = () => {
    if (trendType === 'positive') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (trendType === 'negative') return <TrendingDown className="w-3 h-3 text-rose-400" />;
    return <Activity className="w-3 h-3 text-slate-400" />;
  };

  return (
    <div
      className={`p-5.5 rounded-xl border transition-all duration-300 flex flex-col justify-between relative group hover:scale-[1.015] ${
        isHighPriority
          ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-blue-500/40 shadow-xl shadow-blue-950/30 ring-1 ring-blue-500/30'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/40'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isHighPriority && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
          )}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
            {title}
          </span>
        </div>
        <div
          className={`p-2 rounded-xl border transition-transform duration-200 group-hover:scale-110 ${
            isHighPriority
              ? 'bg-blue-950/90 text-blue-400 border-blue-800/80 shadow-inner'
              : 'bg-slate-800/90 text-slate-300 border-slate-700/80'
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
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2.5 rounded-md border text-[10px] font-mono font-medium ${getTrendBadge()}`}>
              {getTrendIcon()}
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


