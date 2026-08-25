import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] border border-rose-900/40 rounded-xl p-8 text-center bg-rose-950/20 font-sans">
      <div className="p-3 bg-rose-950 rounded-xl border border-rose-800/80 mb-3">
        <AlertTriangle className="w-6 h-6 text-rose-400" />
      </div>
      <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Ledger Operations Exception</h3>
      <p className="text-xs text-slate-300 font-mono max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Re-establish Connection</span>
        </button>
      )}
    </div>
  );
}

