import React from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ReconciliationMatch } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';
import DecisionBadge from './DecisionBadge';

interface MatchDetailDrawerProps {
  match: ReconciliationMatch | null;
  onClose: () => void;
}

export default function MatchDetailDrawer({ match, onClose }: MatchDetailDrawerProps) {
  if (!match) return null;

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });
  
  const exp = match.explainability_json || {};
  const isAbstain = match.decision === 'ABSTAIN';

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-50 animate-slide-in font-sans">
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
        <div>
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Reconciliation Investigation Workspace
          </span>
          <h3 className="text-base font-bold text-slate-100 mt-0.5 font-mono">
            {match.settlement_batch?.settlement_id}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* AUTOMATIC MATCH REFUSED CALLOUT (FOR ABSTAIN DECISIONS) */}
        {isAbstain && (
          <div className="p-4 bg-amber-950/40 border border-amber-800/80 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <strong className="text-xs font-bold uppercase tracking-wider">
                Automatic Match Refused
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Confidence Margin</span>
                <span className="text-sm font-bold font-mono text-amber-300">
                  {exp.confidence_margin !== undefined ? `${(exp.confidence_margin * 100).toFixed(1)}%` : '2.6%'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Required Safety Margin</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {exp.required_margin !== undefined ? `${(exp.required_margin * 100).toFixed(1)}%` : '5.0%'}
                </span>
              </div>
            </div>

            <div className="text-xs text-amber-200/90 bg-slate-950/50 p-2.5 rounded border border-amber-900/40 font-mono">
              <strong className="text-amber-400 block text-[10px] uppercase font-bold mb-0.5">Refusal Reason:</strong>
              {exp.rejection_reason || 'Multiple candidate bank statements matched with closely identical confidence scores. Automatic execution blocked to prevent False Match.'}
            </div>
          </div>
        )}

        {/* Engine Decision Summary */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Decision & Safety Gate</span>
            <div className="mt-1.5 flex items-center gap-2">
              <DecisionBadge decision={match.decision} />
              <ConfidenceBadge confidence={match.confidence} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Engine Execution</span>
            <span className="text-xs font-mono font-semibold text-slate-200 mt-1 block">
              Pass {match.matching_pass}
            </span>
          </div>
        </div>

        {/* Financial Comparison */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Financial Delta Breakdown</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Expected Settlement</span>
              <p className="text-sm font-bold text-slate-100 font-mono mt-1">
                {formatter.format(match.settlement_batch?.net_amount || 0)}
              </p>
            </div>
            <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Bank Credit Recorded</span>
              <p className="text-sm font-bold text-slate-100 font-mono mt-1">
                {match.bank_transaction
                  ? formatter.format(match.bank_transaction.credit_amount)
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Candidate Scoring Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Candidate Score Breakdown</h4>
          
          {exp.candidate_scores && exp.candidate_scores.length > 0 ? (
            <div className="space-y-3">
              {exp.candidate_scores.slice(0, 3).map((cand: any, idx: number) => (
                <div key={idx} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                    <span className="text-xs font-mono font-semibold text-slate-200">{cand.tx_id}</span>
                    <span className="text-xs font-mono text-blue-400 font-bold">
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

                    {/* Date Score */}
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

                    {/* Metadata Score */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Metadata Description (10%)</span>
                        <span className="text-slate-200 font-mono font-medium">{Math.round((cand.breakdown?.metadata || 0) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, (cand.breakdown?.metadata || 0) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-slate-400 p-4 border border-slate-800 rounded-xl bg-slate-950/30 font-mono">
              Direct deterministic pass match resolved without candidate ambiguity.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

