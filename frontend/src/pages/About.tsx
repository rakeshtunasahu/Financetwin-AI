import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <PageContainer title="System Specifications & Documentation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-zinc-300 font-sans">Core Safety Principle</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            In ledger settlement reconciliation, a <strong>False Match</strong> (matching a settlement batch to the wrong bank transaction) 
            is order-of-magnitude more dangerous than leaving a transaction unmatched. A false match results in direct financial write-offs 
            and compliance integrity breakdown.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Therefore, FinanceTwin AI implements a <strong>conservative auto-abstain matching policy</strong>. If any matching pass fails 
            to satisfy the minimum match confidence (95%) or minimum confidence margin (5%), the engine aborts automated matching 
            and registers an <code>ABSTAIN</code> state for human audit review.
          </p>
        </div>

        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Cpu className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-semibold text-zinc-300 font-sans">Machine Learning Pipeline</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            ML acts as a secondary layer to deterministic matching, running unsupervised algorithms:
          </p>
          <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
            <li>
              <strong>IsolationForest:</strong> Evaluates exception records (amount variance, Expected nets, delayed days, severity) and flags out-of-bounds anomaly deviations.
            </li>
            <li>
              <strong>DBSCAN:</strong> Clusters matching exceptions to discover recurring systemic error patterns (such as duplicate credits or repeated settlement delays).
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-semibold text-zinc-300 font-sans">Explainable AI Safety</h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          To prevent hallucination, <strong>AI investigator outputs cannot override deterministic decisions</strong>. 
          The AI only receives verified, validated facts (GroundedFactInput schema) and generates root-cause narratives. 
          It cannot execute ledger writes, ensuring the system remains completely secure.
        </p>
      </div>
    </PageContainer>
  );
}
