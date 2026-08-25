import React from 'react';

interface DecisionBadgeProps {
  decision: 'MATCH' | 'ABSTAIN' | 'NO_MATCH' | 'EXCEPTION' | string;
}

export default function DecisionBadge({ decision }: DecisionBadgeProps) {
  const normalized = decision ? decision.toUpperCase() : 'NO_MATCH';

  const getStyles = () => {
    switch (normalized) {
      case 'MATCH':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'ABSTAIN':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'EXCEPTION':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'NO_MATCH':
      default:
        return 'bg-slate-800/80 text-slate-400 border-slate-700/60';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${getStyles()}`}>
      {normalized.replace(/_/g, ' ')}
    </span>
  );
}

