import React, { useState } from 'react';
import { Play, RotateCw } from 'lucide-react';
import { apiFetch } from '../../api/client';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
}

export default function Header({ title, onRefresh }: HeaderProps) {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRunReconciliation = async () => {
    setRunning(true);
    setMessage(null);
    try {
      const res = await apiFetch<any>('/api/reconciliation/run', {
        method: 'POST',
      });
      setMessage(`Reconciliation Complete! Matched: ${res.matched_count}, Abstained: ${res.abstained_count}, Exceptions: ${res.exception_count}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMessage(`Reconciliation Failed: ${err.message}`);
    } finally {
      setRunning(false);
      setTimeout(() => setMessage(null), 7000);
    }
  };

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {message && (
          <div className="bg-zinc-950 border border-zinc-800 text-xs px-3 py-1.5 rounded-lg text-zinc-300">
            {message}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleRunReconciliation}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md shadow-brand-500/20"
        >
          {running ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {running ? 'Processing...' : 'Run Reconciliation'}
        </button>
      </div>
    </header>
  );
}
