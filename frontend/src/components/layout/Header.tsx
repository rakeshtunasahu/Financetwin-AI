import React, { useState } from 'react';
import { Play, RotateCw, Activity, ShieldCheck, Bell } from 'lucide-react';
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
    <header className="h-16 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <span>{title}</span>
        </h2>
        
        {message && (
          <div className="bg-zinc-950 border border-brand-500/30 text-xs px-3.5 py-1.5 rounded-lg text-brand-400 font-medium animate-fade-in flex items-center gap-2 shadow-lg">
            <Activity className="w-3.5 h-3.5 animate-pulse text-brand-500" />
            {message}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Safety Gate Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>FMR Protection: <strong className="text-white">Active</strong></span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunReconciliation}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all duration-200 shadow-lg shadow-brand-500/20"
        >
          {running ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {running ? 'Processing Cycle...' : 'Run Reconciliation'}
        </button>
      </div>
    </header>
  );
}
