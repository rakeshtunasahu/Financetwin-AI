import React from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { ReconciliationMatch } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';
import DecisionBadge from './DecisionBadge';

interface MatchDetailDrawerProps {
  match: ReconciliationMatch | null;
  onClose: () => void;
}

export default function MatchDetailDrawer({ match, onClose }: MatchDetailDrawerProps) {
  if (!match) return null;

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const exp = match.explainability_json;

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col z-50 animate-slide-in">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/20">
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reconciliation Analysis</h3>
          <h4 className="text-base font-bold text-white mt-1">{match.settlement_batch.settlement_id}</h4>
        </div>
        <button onClick={onClose} className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status Indicators */}
        <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Engine Decision</span>
            <div className="mt-1.5 flex items-center gap-2">
              <DecisionBadge decision={match.decision} />
              <ConfidenceBadge confidence={match.confidence} />
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Pass Level</span>
            <span className="text-xs font-semibold text-white mt-1.5 block">Pass {match.matching_pass}</span>
          </div>
        </div>

        {/* Financial Comparison */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Financial Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-zinc-950/20 rounded border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block">Expected Net</span>
              <p className="text-sm font-bold text-white font-mono mt-1">
                {formatter.format(match.settlement_batch.net_amount)}
              </p>
            </div>
            <div className="p-3 bg-zinc-950/20 rounded border border-zinc-800">
              <span className="text-[9px] text-zinc-500 block">Bank Credited</span>
              <p className="text-sm font-bold text-white font-mono mt-1">
                {match.bank_transaction
                  ? formatter.format(match.bank_transaction.credit_amount)
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Explainability Breakdown */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Scoring & Safety Reasons</h4>
          
          {exp.rejection_reason && (
            <div className="p-4 bg-red-950/15 border border-red-500/20 text-xs text-red-400 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Decision Explanation</span>
                <span>{exp.rejection_reason}</span>
              </div>
            </div>
          )}

          {exp.candidate_scores && exp.candidate_scores.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs text-zinc-400 font-semibold block uppercase">Candidates Ranked:</span>
              {exp.candidate_scores.slice(0, 3).map((cand, idx) => (
                <div key={idx} className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-semibold text-white">{cand.tx_id}</span>
                    <span className="text-xs font-mono text-brand-500 font-bold">{Math.round(cand.score * 100)}% Match</span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Reference Similarity (40%)</span>
                      <span className="text-zinc-300 font-mono">{Math.round(cand.breakdown.reference * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Amount Similarity (35%)</span>
                      <span className="text-zinc-300 font-mono">{Math.round(cand.breakdown.amount * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date Proximity (15%)</span>
                      <span className="text-zinc-300 font-mono">{Math.round(cand.breakdown.date * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Metadata Description (10%)</span>
                      <span className="text-zinc-300 font-mono">{Math.round(cand.breakdown.metadata * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-zinc-500 p-4 border border-zinc-800 rounded-lg">
              No matching scores calculated (Pass level {match.matching_pass} resolved directly).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
