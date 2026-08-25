import React from 'react';
import { RotateCw } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 font-sans">
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
        <RotateCw className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <span className="text-xs text-slate-200 font-semibold uppercase tracking-wider block">Retrieving Ledger Datasets</span>
        <span className="text-[11px] text-slate-400 font-mono block">Querying gateway settlement batches & bank feeds...</span>
      </div>
    </div>
  );
}

