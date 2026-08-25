import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export default function EmptyState({ 
  message = 'No reconciliation records found', 
  subMessage = 'Trigger a reconciliation execution cycle to process incoming gateway settlements.' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] border border-slate-800 rounded-xl p-8 text-center bg-slate-900/60 font-sans">
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-3">
        <Database className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{message}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{subMessage}</p>
    </div>
  );
}

