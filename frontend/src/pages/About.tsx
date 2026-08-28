import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <PageContainer title="System Specifications & Architecture">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Autonomous Recovery Principles</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            RevenueRescue AI operates under strict <strong>policy-bounded guardrails</strong>. Autonomous interventions (Smart Retries, Recovery Links, Reminders) are bound by hard retry limits (max 3), 24h cooldown periods, and automated escalation to human controllers for high-value exposures (&ge; ₹50,000).
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every recovery case follows a 10-step state machine from Risk Detection to Forensic Audit with SHA-256 tamper-evident logs.
          </p>
        </div>

        <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Machine Learning & Prioritization</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ML acts as a predictive prioritization layer across recovery queues:
          </p>
          <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-4">
            <li>
              <strong>Priority Scoring:</strong> Computes financial exposure &times; ML recovery probability &times; urgency decay.
            </li>
            <li>
              <strong>IsolationForest & DBSCAN:</strong> Flags anomaly deviations and clusters recurring checkout or gateway failure patterns.
            </li>
          </ul>
        </div>
      </div>

      <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 font-sans mt-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Explainable AI Diagnosis & Safety</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          To ensure financial safety, <strong>AI diagnosis agent outputs cannot execute unbounded mutations</strong>. 
          The agent analyzes grounded telemetry, diagnoses root causes, recommends bounded actions, and logs all transitions to immutable cryptographic audit trails.
        </p>
      </div>
    </PageContainer>
  );
}


