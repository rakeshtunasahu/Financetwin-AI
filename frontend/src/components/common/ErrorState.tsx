import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] border border-red-900/30 rounded-xl p-8 text-center bg-red-950/10">
      <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
      <h3 className="text-sm font-semibold text-red-400">Database Connection Mismatch</h3>
      <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs font-semibold border border-zinc-800 transition-colors"
        >
          Re-establish Connection
        </button>
      )}
    </div>
  );
}
