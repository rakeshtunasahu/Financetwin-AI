import React from 'react';

interface ConfidenceBadgeProps {
  confidence: number;
}

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const val = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
  const percentage = Math.round(val * 100);
  
  const getColor = () => {
    if (val >= 0.95) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (val >= 0.80) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-red-500/10 text-red-400 border border-red-500/20';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${getColor()}`}>
      {percentage}%
    </span>
  );
}
