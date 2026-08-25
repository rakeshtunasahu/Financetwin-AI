import React from 'react';

interface ConfidenceBadgeProps {
  confidence: number;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const val = typeof confidence === 'string' ? parseFloat(confidence) : (confidence || 0);
  const percentage = Math.round(val * 100);
  
  const getColor = () => {
    if (val >= 0.95) return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    if (val >= 0.80) return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${getColor()}`}>
      {percentage}%
    </span>
  );
}

