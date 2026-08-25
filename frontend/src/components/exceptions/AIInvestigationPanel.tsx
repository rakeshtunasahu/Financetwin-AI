import React, { useState } from 'react';
import { Sparkles, RotateCw, CheckCircle, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../api/client';
import DecisionBadge from '../reconciliation/DecisionBadge';

interface AIInvestigationPanelProps {
  exceptionId: string;
  initialInvestigation: any;
  onInvestigated: (data: any) => void;
}

export default function AIInvestigationPanel({ 
  exceptionId, 
  initialInvestigation, 
  onInvestigated 
}: AIInvestigationPanelProps) {
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inv, setInv] = useState<any>(initialInvestigation);

  const handleInvestigate = async () => {
    setInvestigating(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/api/exceptions/${exceptionId}/investigate`, {
        method: 'POST',
      });
      setInv(res);
      onInvestigated(res);
    } catch (err: any) {
      setError(err.message || 'AI investigation failed.');
    } finally {
      setInvestigating(false);
    }
  };

  return (
    <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Grounded AI Investigation Co-Pilot</h3>
        </div>
        <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          Pydantic Fact-Grounded
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs rounded-lg font-mono">
          {error}
        </div>
      )}

      {inv ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Root Cause Analysis</span>
              <p className="text-xs font-semibold text-slate-100">{inv.root_cause}</p>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Recommended Action Gate</span>
              <div className="mt-1">
                <DecisionBadge decision={inv.recommended_action} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Detailed Investigation Findings</span>
            <p className="text-xs text-slate-300 leading-relaxed">{inv.explanation}</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              <strong>Deterministic Safety:</strong> AI output is validated against system ledger facts and cannot override audit records or monetary values.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
          <p className="text-xs text-slate-400 max-w-sm">
            Run the Grounded AI Investigation engine to automatically analyze exception records and trace variance root causes based strictly on deterministic ledger evidence.
          </p>
          <button
            onClick={handleInvestigate}
            disabled={investigating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            {investigating ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{investigating ? 'Analyzing Ledger Evidence...' : 'Run Grounded AI Investigation'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

