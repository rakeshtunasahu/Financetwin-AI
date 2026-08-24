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
    <div className="glass-panel p-6 space-y-4 border-brand-500/20 bg-brand-500/[0.01]">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h3 className="text-sm font-semibold text-zinc-300">Grounded AI Co-Pilot Investigator</h3>
        </div>
        <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 flex items-center gap-1.5">
          <CheckCircle className="w-3 h-3 text-brand-500" />
          Validated Schema
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      {inv ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-950/30 rounded border border-zinc-850 space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Root Cause Identification</span>
              <p className="text-xs font-semibold text-white">{inv.root_cause}</p>
            </div>
            <div className="p-3 bg-zinc-950/30 rounded border border-zinc-850 space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">AI Recommended Action</span>
              <div className="mt-1">
                <DecisionBadge decision={inv.recommended_action} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-850 space-y-1.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Detailed Findings Explanation</span>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{inv.explanation}</p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 bg-zinc-950/20 p-2.5 rounded border border-zinc-850">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-500/80 shrink-0" />
            <span>
              <strong>Fact-Grounded Safety Policy:</strong> AI output is validated by Pydantic; the AI receives only verified, deterministic ledger facts and cannot modify financial figures.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
          <p className="text-xs text-zinc-500 max-w-sm">
            Execute the Grounded AI Investigation engine to automatically trace the ledger variance and identify root causes based on deterministic facts.
          </p>
          <button
            onClick={handleInvestigate}
            disabled={investigating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all hover:bg-brand-600 active:scale-95 duration-150"
          >
            {investigating ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {investigating ? 'Running Diagnosis...' : 'Trigger Grounded AI Investigation'}
          </button>
        </div>
      )}
    </div>
  );
}
