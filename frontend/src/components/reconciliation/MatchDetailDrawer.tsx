import React, { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { ReconciliationMatch } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';
import DecisionBadge from './DecisionBadge';

interface MatchDetailDrawerProps {
  match: ReconciliationMatch | null;
  onClose: () => void;
}

export default function MatchDetailDrawer({ match, onClose }: MatchDetailDrawerProps) {
  // Listen for Escape key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (match) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [match, onClose]);

  if (!match) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });
  
  const exp = match.explainability_json || {};
  const isAbstain = match.decision === 'ABSTAIN';
  const isException = match.decision === 'EXCEPTION';
  const isMatch = match.decision === 'MATCH';

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden font-sans">
      {/* 1. Backdrop Overlay with smooth Fade In */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer"
        aria-hidden="true"
      />

      {/* 2. Slide-In Right Window / Flyout Drawer */}
      <div className="relative w-full sm:w-[500px] lg:w-[540px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl shadow-slate-950 flex flex-col z-10 animate-slide-in-right overflow-hidden">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/60 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <GitCompare className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                Reconciliation Investigation Workspace
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-100 font-mono tracking-tight">
              {match.settlement_batch?.settlement_id || `RUN_MATCH_${match.id}`}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Deterministic matching verdict and candidate score telemetry
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close panel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body — Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Decision & Pass Verdict Card */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Decision Verdict</span>
                <div className="mt-1 flex items-center gap-2">
                  <DecisionBadge decision={match.decision} />
                  <ConfidenceBadge confidence={match.confidence} />
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Engine Execution</span>
                <span className="text-xs font-mono font-bold text-blue-400 mt-1 block px-2.5 py-0.5 bg-blue-950/80 border border-blue-800/80 rounded-md">
                  Pass {match.matching_pass}
                </span>
              </div>
            </div>
          </div>

          {/* AUTOMATIC MATCH REFUSED CALLOUT (FOR ABSTAIN DECISIONS) */}
          {isAbstain && (
            <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <strong className="text-xs font-bold uppercase tracking-wider">
                  Safety Gate Triggered: Match Refused
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Confidence Margin</span>
                  <span className="text-sm font-bold font-mono text-amber-300">
                    {exp.confidence_margin !== undefined 
                      ? `${(exp.confidence_margin * 100).toFixed(1)}%` 
                      : match.confidence_margin !== null && match.confidence_margin !== undefined
                      ? `${(match.confidence_margin * 100).toFixed(1)}%`
                      : '2.6%'}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Required Safety Margin</span>
                  <span className="text-sm font-bold font-mono text-slate-200">
                    {exp.required_margin !== undefined ? `${(exp.required_margin * 100).toFixed(1)}%` : '5.0%'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-amber-200/90 bg-slate-950/60 p-3 rounded-xl border border-amber-900/40 font-mono">
                <strong className="text-amber-400 block text-[10px] uppercase font-bold mb-0.5">Refusal Reason:</strong>
                {exp.rejection_reason || 'Multiple candidate bank statements matched with closely identical confidence scores. Automatic execution blocked to prevent False Match.'}
              </div>
            </div>
          )}

          {/* Financial Breakdown Cards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Financial Comparison Delta</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Expected Settlement</span>
                <p className="text-base font-black text-slate-100 font-mono">
                  {formatter.format(match.settlement_batch?.net_amount || 0)}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Batch Gross: {formatter.format(match.settlement_batch?.gross_amount || 0)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Bank Credit Recorded</span>
                <p className="text-base font-black text-emerald-400 font-mono">
                  {match.bank_transaction
                    ? formatter.format(match.bank_transaction.credit_amount)
                    : '—'}
                </p>
                <span className="text-[10px] text-slate-500 font-mono block">
                  {match.bank_transaction ? (match.bank_transaction.source || match.bank_transaction.description) : 'No direct deposit found'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Transaction Metadata Reference */}
          {match.bank_transaction && (
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Matched Bank Statement Reference
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">UTR Reference:</span>
                  <span className="text-slate-200 font-semibold">{match.bank_transaction.reference || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Statement Date:</span>
                  <span className="text-slate-200 font-semibold">{new Date(match.bank_transaction.transaction_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Scoring Breakdown Telemetry */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Candidate Match Telemetry</span>
            </h4>
            
            {exp.candidate_scores && exp.candidate_scores.length > 0 ? (
              <div className="space-y-3">
                {exp.candidate_scores.slice(0, 3).map((cand: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-200">{cand.tx_id}</span>
                      <span className="text-xs font-mono text-blue-400 font-extrabold px-2 py-0.5 bg-blue-950 rounded border border-blue-800/60">
                        {Math.round(cand.score * 100)}% Match Score
                      </span>
                    </div>
                    
                    <div className="space-y-2.5 text-xs">
                      {/* Reference Similarity */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Reference Similarity (40%)</span>
                          <span className="text-slate-200 font-mono font-medium">{Math.round((cand.breakdown?.reference || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, (cand.breakdown?.reference || 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Amount Similarity */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Amount Similarity (35%)</span>
                          <span className="text-slate-200 font-mono font-medium">{Math.round((cand.breakdown?.amount || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, (cand.breakdown?.amount || 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Date Proximity */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Date Proximity (15%)</span>
                          <span className="text-slate-200 font-mono font-medium">{Math.round((cand.breakdown?.date || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, (cand.breakdown?.date || 0) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Narration Description */}
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Narration Similarity (10%)</span>
                          <span className="text-slate-200 font-mono font-medium">{Math.round((cand.breakdown?.metadata || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, (cand.breakdown?.metadata || 0) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 p-4 border border-slate-800 rounded-2xl bg-slate-950/40 font-mono">
                Direct deterministic pass match resolved without candidate ambiguity.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Esc</kbd> to close
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
