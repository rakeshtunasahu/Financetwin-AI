import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <PageContainer title="System Specifications & Documentation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Core Financial Safety Principle</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            In ledger settlement reconciliation, a <strong>False Match</strong> (matching a settlement batch to the wrong bank transaction) 
            is order-of-magnitude more dangerous than leaving a transaction unmatched. A false match results in direct financial write-offs 
            and compliance integrity breakdown.
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Therefore, FinanceTwin AI implements a <strong>conservative auto-abstain matching policy</strong>. If any matching pass fails 
            to satisfy the minimum match confidence (95%) or minimum confidence margin (5%), the engine aborts automated matching 
            and registers an <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 border border-amber-900/40">ABSTAIN</code> state for human audit review.
          </p>
        </div>

        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Machine Learning Pipeline</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ML acts as a secondary diagnostic layer to deterministic matching, running unsupervised algorithms:
          </p>
          <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4">
            <li>
              <strong>IsolationForest:</strong> Evaluates exception records (amount variance, Expected nets, delayed days, severity) and flags out-of-bounds anomaly deviations.
            </li>
            <li>
              <strong>DBSCAN:</strong> Clusters matching exceptions to discover recurring systemic error patterns (such as duplicate credits or repeated settlement delays).
            </li>
          </ul>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 font-sans mt-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Explainable AI Safety</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          To prevent hallucination, <strong>AI investigator outputs cannot override deterministic decisions</strong>. 
          The AI only receives verified, validated facts (GroundedFactInput schema) and generates root-cause narratives. 
          It cannot execute ledger writes, ensuring the system remains completely secure and auditable.
        </p>
      </div>
    </PageContainer>
  );
}

