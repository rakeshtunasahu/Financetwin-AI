import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import {
  Calculator as CalcIcon,
  Zap,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { RecoveryCase } from '../types';

const CANDIDATE_ACTIONS = [
  {
    type: 'SEND_PAYMENT_LINK',
    label: 'Dynamic Payment Link',
    channel: 'SMS / WhatsApp / Email',
    success_prob: 0.88,
    cost: 0,
    risk: 'LOW',
    desc: 'Instant one-click checkout link via multi-channel messaging'
  },
  {
    type: 'SMART_RETRY',
    label: 'Autonomous Smart Retry',
    channel: 'Gateway Re-routing',
    success_prob: 0.72,
    cost: 0,
    risk: 'LOW',
    desc: 'Intelligent routing during optimal bank clearance window'
  },
  {
    type: 'REQUEST_PAYMENT_METHOD_UPDATE',
    label: 'Alternate Payment Request',
    channel: 'Customer Portal',
    success_prob: 0.68,
    cost: 0,
    risk: 'LOW',
    desc: 'Prompt customer to switch to NetBanking or UPI autopay'
  },
  {
    type: 'SEND_PAYMENT_REMINDER',
    label: 'Automated Chaser',
    channel: 'Email / Push',
    success_prob: 0.52,
    cost: 0,
    risk: 'LOW',
    desc: 'Polite reminder with breakdown of pending amount'
  },
  {
    type: 'PERSONALIZED_FOLLOW_UP',
    label: 'Personalized Outreach',
    channel: 'Finance Specialist',
    success_prob: 0.64,
    cost: 50,
    risk: 'MEDIUM',
    desc: 'Customized communication with flexible payment terms'
  },
  {
    type: 'ESCALATE_TO_HUMAN',
    label: 'Executive Escalation',
    channel: 'Senior Operations',
    success_prob: 0.85,
    cost: 200,
    risk: 'HIGH',
    desc: 'Direct specialist intervention for high-risk accounts'
  }
];

export default function Calculator() {
  const [existingCases, setExistingCases] = useState<RecoveryCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('CUSTOM');
  const [amountAtRisk, setAmountAtRisk] = useState<number>(75000);
  const [recoveryProb, setRecoveryProb] = useState<number>(82);
  const [previousAttempts, setPreviousAttempts] = useState<number>(1);
  const [selectedActionType, setSelectedActionType] = useState<string>('SEND_PAYMENT_LINK');

  // Policy threshold inputs
  const [highValueThreshold, setHighValueThreshold] = useState<number>(50000);
  const [maxRetriesAllowed, setMaxRetriesAllowed] = useState<number>(3);

  useEffect(() => {
    recoveryApi.getCases({ limit: 50 }).then((cases) => {
      setExistingCases(cases);
    }).catch((err) => console.error(err));
  }, []);

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    if (caseId === 'CUSTOM') return;
    const found = existingCases.find((c) => c.case_id === caseId);
    if (found) {
      setAmountAtRisk(Number(found.amount_at_risk || 50000));
      setRecoveryProb(Math.round(Number(found.recovery_probability || 0.75) * 100));
      setPreviousAttempts(found.retry_count || 0);
      if (found.recommended_action) {
        setSelectedActionType(found.recommended_action);
      }
    }
  };

  const selectedActionMeta = CANDIDATE_ACTIONS.find((a) => a.type === selectedActionType) || CANDIDATE_ACTIONS[0];

  // Mathematical Expected Recovery Calculation
  const baseProbDecimal = recoveryProb / 100;
  const actionProbDecimal = selectedActionMeta.success_prob;
  const combinedProb = baseProbDecimal * actionProbDecimal;
  const expectedRecovery = amountAtRisk * combinedProb;

  // Policy Guardrail Evaluation
  let policyStatus: 'APPROVED' | 'BLOCKED' | 'REQUIRES_APPROVAL' = 'APPROVED';
  let policyReason = 'Action satisfies all automated guardrail parameters.';

  if (amountAtRisk >= highValueThreshold && selectedActionType !== 'ESCALATE_TO_HUMAN') {
    policyStatus = 'REQUIRES_APPROVAL';
    policyReason = `Amount (₹${amountAtRisk.toLocaleString('en-IN')}) exceeds High-Value threshold (₹${highValueThreshold.toLocaleString('en-IN')}). Manual review required.`;
  } else if (previousAttempts >= maxRetriesAllowed && (selectedActionType === 'SMART_RETRY' || selectedActionType === 'SEND_PAYMENT_REMINDER')) {
    policyStatus = 'BLOCKED';
    policyReason = `Previous attempts (${previousAttempts}) reached configured retry limit (${maxRetriesAllowed}). Automation halted to protect customer experience.`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <PageContainer title="Recovery Simulator">
      <div className="space-y-6">
        
        {/* Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  WHAT-IF DECISION SIMULATION
                </span>
                <span className="text-xs text-slate-400 font-mono">Bounded Model Calculation</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Recovery Simulator
                <Sliders className="w-6 h-6 text-teal-400" />
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Simulate recovery outcomes, compare candidate intervention expected returns, and test guardrail compliance before live deployment.
              </p>
            </div>

            <div className="px-3 py-2 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-300 text-xs font-mono shrink-0">
              <span className="font-bold block">SIMULATED OUTCOME ONLY</span>
              <span className="text-[10px] text-amber-400/80">No live payment transactions will be triggered.</span>
            </div>
          </div>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Form: Inputs & Actions */}
          <div className="lg:col-span-7 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CalcIcon className="w-4 h-4 text-teal-400" />
                <span>Simulation Parameters</span>
              </h3>
              <select
                value={selectedCaseId}
                onChange={(e) => handleCaseSelect(e.target.value)}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="CUSTOM">Custom Scenario</option>
                {existingCases.map((c) => (
                  <option key={c.case_id} value={c.case_id}>
                    {c.case_id} — ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Revenue at Risk (₹)</label>
                <input
                  type="number"
                  value={amountAtRisk}
                  onChange={(e) => setAmountAtRisk(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Base Probability (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={recoveryProb}
                  onChange={(e) => setRecoveryProb(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Previous Retries</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={previousAttempts}
                  onChange={(e) => setPreviousAttempts(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Select Action Candidates */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Select Intervention Action to Simulate:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CANDIDATE_ACTIONS.map((action) => {
                  const isSelected = selectedActionType === action.type;
                  return (
                    <div
                      key={action.type}
                      onClick={() => setSelectedActionType(action.type)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-950 border-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-200">{action.label}</span>
                        <span className="text-[10px] font-mono text-teal-400 font-bold">
                          {Math.round(action.success_prob * 100)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{action.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configurable Guardrail Thresholds */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulated Policy Guardrail Thresholds</span>
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">High-Value Cutoff (₹)</label>
                  <input
                    type="number"
                    value={highValueThreshold}
                    onChange={(e) => setHighValueThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Max Retry Bound</label>
                  <input
                    type="number"
                    value={maxRetriesAllowed}
                    onChange={(e) => setMaxRetriesAllowed(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Simulated Outcome & Policy Report */}
          <div className="lg:col-span-5 p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Simulated Return Projection</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800 font-bold">
                  SIMULATED MODEL
                </span>
              </div>

              {/* Hero Expected Metric */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Expected Recovery</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {formatter.format(expectedRecovery)}
                </div>
                <span className="text-[10px] text-slate-500 font-mono block">
                  Amount at Risk (₹{amountAtRisk.toLocaleString('en-IN')}) × Combined Probability ({Math.round(combinedProb * 100)}%)
                </span>
              </div>

              <div className="space-y-2.5 mt-4 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Selected Action</span>
                  <span className="font-bold text-slate-200">{selectedActionMeta.label}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Action Success Prob</span>
                  <span className="font-bold text-teal-300">{Math.round(selectedActionMeta.success_prob * 100)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Combined Confidence</span>
                  <span className="font-bold text-slate-200">{Math.round(combinedProb * 100)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Intervention Cost</span>
                  <span className="font-bold text-slate-200">₹{selectedActionMeta.cost}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
                  <span>Risk Category</span>
                  <span className={`font-bold ${
                    selectedActionMeta.risk === 'LOW' ? 'text-emerald-400' : selectedActionMeta.risk === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {selectedActionMeta.risk}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Check Verdict */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Policy Guardrail Verdict:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  policyStatus === 'APPROVED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : policyStatus === 'REQUIRES_APPROVAL'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {policyStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{policyReason}</p>
            </div>

          </div>
        </div>

      </div>
    </PageContainer>
  );
}
