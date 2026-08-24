import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
    if (trendType === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (trendType === 'negative') return 'text-red-400 bg-red-500/10 border-red-500/20';
    return 'text-zinc-400 bg-zinc-800/40 border-zinc-700/50';
  };

  const getTrendIcon = () => {
    if (trendType === 'positive') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (trendType === 'negative') return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Activity className="w-3 h-3 text-zinc-400" />;
  };

  const getIconContainerColor = () => {
    if (trendType === 'positive') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (trendType === 'negative') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
  };

  return (
    <div className="glass-panel glass-panel-hover p-6 flex flex-col justify-between min-h-[135px] relative group overflow-hidden">
      {/* Subtle Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex justify-between items-start">
        <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">{title}</span>
        <div className={`p-2.5 rounded-xl border ${getIconContainerColor()} transition-transform group-hover:scale-110 duration-200`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h3 className="text-2.5xl font-extrabold text-white tracking-tight font-sans">{value}</h3>
          {subtext && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 rounded border text-[10px] font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{subtext}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
