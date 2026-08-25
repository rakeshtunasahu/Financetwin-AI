import React, { useState } from 'react';
import { Play, RotateCw, Activity, ShieldCheck, Menu } from 'lucide-react';
import { apiFetch } from '../../api/client';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  onOpenMobileMenu?: () => void;
}

export default function Header({ title, onRefresh, onOpenMobileMenu }: HeaderProps) {
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
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
          {title}
        </h2>
        
        {message && (
          <div className="hidden md:flex bg-slate-950 border border-blue-500/40 text-xs px-3 py-1.5 rounded-md text-blue-400 font-medium items-center gap-2 shadow-lg">
            <Activity className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span className="truncate">{message}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Safety Gate Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-md text-xs font-medium text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px]">FMR Protection: <strong className="text-slate-100 font-semibold">Active</strong></span>
        </div>

        {/* Refresh Action if provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="hidden sm:flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-all"
            title="Refresh Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        {/* Run Reconciliation Action Button */}
        <button
          onClick={handleRunReconciliation}
          disabled={running}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-md text-xs font-semibold transition-all shadow-sm"
        >
          {running ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          <span>{running ? 'Processing...' : 'Run Reconciliation'}</span>
        </button>
      </div>
    </header>
  );
}

