import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RotateCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Check,
  Clock,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { BatchSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

const RECOVERY_STEPS = [
  { id: 1, name: 'Risk Detection', desc: 'Scan reconciliation exceptions & checkout drop-offs' },
  { id: 2, name: 'Case Ingestion', desc: 'Normalize metadata, amounts, and customer history' },
  { id: 3, name: 'AI Root Cause Diagnosis', desc: 'Classify failure reasons & evaluate confidence' },
  { id: 4, name: 'Priority Scoring', desc: 'Compute Impact × Recovery Probability × Urgency' },
  { id: 5, name: 'Intervention Selection', desc: 'Choose Smart Retry, Link, Reminder, or Escalation' },
  { id: 6, name: 'Guardrail Verification', desc: 'Validate retries <= 3, cooldowns, and limit checks' },
  { id: 7, name: 'Action Execution', desc: 'Dispatch simulated bounded recovery interventions' },
  { id: 8, name: 'Channel Response', desc: 'Process gateway feedbacks, click-throughs, and webhook signals' },
  { id: 9, name: 'Ledger Settlement', desc: 'Reconcile recovered revenue into ledger' },
  { id: 10, name: 'Forensic Audit', desc: 'Generate SHA-256 tamper-evident log records' }
];

export default function BatchRecovery() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [batchResult, setBatchResult] = useState<BatchSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const runBatch = async () => {
    try {
      setRunning(true);
      setError(null);
      setBatchResult(null);
      setCompletedSteps([]);
      setActiveStep(1);

      // Simulate step progression visually while backend computes
      const stepInterval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev < 10) {
            setCompletedSteps((done) => [...done, prev]);
            return prev + 1;
          }
          return prev;
        });
      }, 400);

      const result = await recoveryApi.runBatch();
      
      clearInterval(stepInterval);
      setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      setActiveStep(10);
      setBatchResult(result);
    } catch (err: any) {
      console.error('Batch recovery failed:', err);
      setError(err.message || 'Batch execution failed');
    } finally {
      setRunning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECOVERED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'RETRY':
      case 'ACTION_EXECUTED':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'ESCALATED':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'STOPPED':
      case 'UNRECOVERABLE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
    }
  };

  const filteredResults = batchResult?.all_results?.filter((item: any) => {
    const matchesSearch =
      searchTerm === '' ||
      item.case_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.action_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.root_cause?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.final_status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <PageContainer title="Autonomous Recovery Batch">
      <div className="space-y-6">
        {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                10-STEP AUTONOMOUS RUNNER
              </span>
              <span className="text-xs text-slate-400 font-mono">End-to-End Orchestration</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Autonomous Recovery Batch
              <RotateCw className={`w-6 h-6 text-teal-400 ${running ? 'animate-spin' : ''}`} />
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Execute high-throughput, multi-scenario revenue recovery with deterministic policy enforcement and instant cryptographic audit verification.
            </p>
          </div>

          <div className="shrink-0">
            {hasPermission('can_run_recovery_batch') ? (
              <button
                onClick={runBatch}
                disabled={running}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl text-sm flex items-center gap-3 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-900/60 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className={`w-5 h-5 fill-current ${running ? 'animate-pulse' : ''}`} />
                <span>{running ? 'PROCESSING BATCH RUN...' : 'RUN AUTONOMOUS RECOVERY BATCH'}</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-xs border border-slate-700 font-mono">
                Requires ADMIN permission to trigger batch execution
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 10-Step Progress Lifecycle Display */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-400" />
            10-Step Autonomous Agent Workflow
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {completedSteps.length === 10
              ? 'Workflow Completed'
              : running
              ? `Executing Step ${activeStep} of 10...`
              : 'Ready to Run'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {RECOVERY_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isCurrent = activeStep === step.id && running;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : isCurrent
                    ? 'bg-teal-950/60 border-teal-500 text-teal-200 shadow-md shadow-teal-500/10 animate-pulse'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase">
                    Step {step.id}
                  </span>
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isCurrent ? (
                    <RotateCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
                <div className={`text-xs font-semibold ${isDone ? 'text-slate-200' : isCurrent ? 'text-teal-300' : 'text-slate-400'}`}>
                  {step.name}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Results KPIs (Calculated dynamically from real outcomes) */}
      {batchResult && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Batch Execution Report
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {batchResult.batch_size} synthetic cases processed across 3 scenarios with policy guardrails applied
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-950 border border-emerald-800 rounded-lg text-xs font-mono text-emerald-400 font-bold">
                Recovery Rate: {batchResult.recovery_rate_pct}%
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono text-slate-400">Total at Risk</div>
                <div className="text-lg font-bold text-slate-100 font-mono mt-1">
                  ₹{batchResult.total_at_risk.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">{batchResult.batch_size} cases</div>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/60 rounded-xl">
                <div className="text-[10px] font-mono text-emerald-400 font-bold">Total Recovered</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  ₹{batchResult.total_recovered.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-emerald-500 font-mono">{batchResult.cases_recovered} cases (100%)</div>
              </div>

              <div className="p-3.5 bg-cyan-950/30 border border-cyan-900/60 rounded-xl">
                <div className="text-[10px] font-mono text-cyan-400">In Progress / Retry</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                  ₹{batchResult.in_progress_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">{batchResult.cases_in_progress} cases</div>
              </div>

              <div className="p-3.5 bg-rose-950/30 border border-rose-900/60 rounded-xl">
                <div className="text-[10px] font-mono text-rose-400">Escalated</div>
                <div className="text-lg font-bold text-rose-400 font-mono mt-1">
                  ₹{batchResult.escalated_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">{batchResult.cases_escalated} cases</div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono text-slate-400">Stopped / Max Retry</div>
                <div className="text-lg font-bold text-slate-300 font-mono mt-1">
                  ₹{batchResult.stopped_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">{batchResult.cases_stopped} cases</div>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-[10px] font-mono text-slate-400">Unrecovered Net</div>
                <div className="text-lg font-bold text-slate-400 font-mono mt-1">
                  ₹{batchResult.unrecovered_amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500">Post-execution</div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Batch Case Execution Ledger</h3>
                <p className="text-xs text-slate-400">Individual case outcomes, interventions, and audit hashes</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search cases, root cause..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RECOVERED">Recovered</option>
                  <option value="RETRY">Retry / In Progress</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="STOPPED">Stopped</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Case ID</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Intervention Action</th>
                    <th className="pb-3 font-semibold text-right">At Risk</th>
                    <th className="pb-3 font-semibold text-right">Recovered</th>
                    <th className="pb-3 font-semibold text-center">Policy Check</th>
                    <th className="pb-3 font-semibold">Outcome Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredResults.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-200">
                        <Link to={`/recovery/cases/${r.case_id}`} className="hover:text-teal-400">
                          {r.case_id}
                        </Link>
                      </td>
                      <td className="py-2.5 text-slate-300 font-mono text-[11px]">
                        {r.recovery_type ? r.recovery_type.replace(/_/g, ' ') : 'GENERAL'}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        <span className="font-mono text-slate-200 font-medium">
                          {r.action_type || 'DIAGNOSE_ONLY'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                        ₹{Number(r.amount_at_risk || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-emerald-400">
                        ₹{Number(r.amount_recovered || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 text-center">
                        {r.policy_passed ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                            PASSED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 rounded">
                            DENIED
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${getStatusBadge(r.final_status)}`}>
                          {r.final_status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          to={`/recovery/cases/${r.case_id}`}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-medium transition-all"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </PageContainer>
  );
}
