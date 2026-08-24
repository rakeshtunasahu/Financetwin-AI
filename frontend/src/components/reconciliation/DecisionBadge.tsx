import React from 'react';

interface DecisionBadgeProps {
  decision: 'MATCH' | 'ABSTAIN' | 'NO_MATCH' | 'EXCEPTION' | string;
}

export default function DecisionBadge({ decision }: DecisionBadgeProps) {
  const getStyles = () => {
    switch (decision.toUpperCase()) {
      case 'MATCH':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'ABSTAIN':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'EXCEPTION':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'NO_MATCH':
      default:
        return 'bg-zinc-850 text-zinc-400 border border-zinc-700/50';
    }
  };

  return (
    <span className={`badge px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${getStyles()}`}>
      {decision.replace(/_/g, ' ')}
    </span>
  );
}
