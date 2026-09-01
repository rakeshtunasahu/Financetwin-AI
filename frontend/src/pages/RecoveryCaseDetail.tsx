import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ShieldCheck,
  ShieldAlert,
  Clock,
  DollarSign,
  Activity,
  Play,
  FileText,
  UserCheck,
  Sliders,
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  Lock
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { RecoveryCase, RecoveryAction } from '../types';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

const STATE_FLOW = [
  'DETECTED',
  'DIAGNOSED',
  'PRIORITIZED',
  'ACTION_SELECTED',
  'POLICY_CHECKED',
  'ACTION_EXECUTED',
  'WAITING_FOR_OUTCOME',
  'RECOVERED'
];

export default function RecoveryCaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [caseData, setCaseData] = useState<RecoveryCase | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCaseDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [c, audit] = await Promise.all([
        recoveryApi.getCase(id),
        recoveryApi.getAudit(id).catch(() => [])
      ]);
      setCaseData(c);
      setAuditLogs(audit);
    } catch (err: any) {
      console.error('Failed to load case detail:', err);
      setError(err.message || 'Failed to fetch case detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetail();
  }, [id]);

  const handleDiagnose = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setActionMsg(null);
      const res = await recoveryApi.diagnoseCase(id);
      setActionMsg({
        type: 'success',
        text: `Diagnosis complete: Root Cause "${res.root_cause}" (${Math.round(res.confidence * 100)}% confidence)`
      });
      await fetchCaseDetail();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Diagnosis failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecide = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      setActionMsg(null);
      const res = await recoveryApi.decideAction(id);
      setActionMsg({
        type: 'success',
        text: `Recommended Intervention: ${res.recommended_action} (Priority ${res.priority_score})`
      });
      await fetchCaseDetail();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Decision failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async (actionType?: string) => {
    if (!id) return;
    try {
      setActionLoading(true);
      setActionMsg(null);
      const res = await recoveryApi.executeAction(id, actionType);
      if (res.policy_passed) {
        setActionMsg({
          type: 'success',
          text: `Executed ${res.action_type}: Status ${res.outcome_status}, Amount Recovered ₹${res.amount_recovered.toLocaleString('en-IN')}`
        });
      } else {
        setActionMsg({
          type: 'error',
          text: `Action Denied by Policy Guardrail: ${res.policy_denial_reason}`
        });
      }
      await fetchCaseDetail();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Execution failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECOVERED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'ACTION_EXECUTED':
      case 'WAITING_FOR_OUTCOME':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
      case 'RETRY':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'ESCALATED':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'STOPPED':
      case 'UNRECOVERABLE':
      case 'EXPIRED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
    }
  };

  if (loading && !caseData) {
    return (
      <PageContainer title={`Recovery Case: ${id || 'Detail'}`}>
        <div className="p-16 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4 font-mono">Loading case lifecycle & telemetry...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !caseData) {
    return (
      <PageContainer title={`Recovery Case: ${id || 'Detail'}`}>
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-base font-semibold">{error || 'Case not found'}</span>
          </div>
          <button
            onClick={() => navigate('/recovery/cases')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Back to Cases
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Recovery Case: ${caseData.case_id}`} onRefresh={fetchCaseDetail}>
      <div className="space-y-6">
        {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/recovery/cases"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-slate-100">{caseData.case_id}</span>
              <span className={`px-2.5 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${getStatusBadge(caseData.current_status)}`}>
                {caseData.current_status}
              </span>
              {caseData.is_high_value && (
                <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800 rounded">
                  HIGH VALUE
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Scenario: <strong className="text-slate-200">{caseData.recovery_type.replace(/_/g, ' ')}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            Created: {new Date(caseData.created_at).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border-rose-800 text-rose-300'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="ml-2 font-bold hover:opacity-80">✕</button>
        </div>
      )}

      {/* State Machine Visualization */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          State Machine Progression
        </div>

        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-2 text-center text-xs">
          {STATE_FLOW.map((st, idx) => {
            const isCompleted =
              caseData.current_status === 'RECOVERED' ||
              STATE_FLOW.indexOf(caseData.current_status) >= idx;
            const isCurrent = caseData.current_status === st;
            return (
              <React.Fragment key={st}>
                <div
                  className={`p-2.5 rounded-xl border min-w-[100px] transition-all ${
                    isCurrent
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 font-bold'
                      : isCompleted
                      ? 'bg-slate-950/80 border-emerald-800/60 text-emerald-400/80 font-medium'
                      : 'bg-slate-950/30 border-slate-800 text-slate-600'
                  }`}
                >
                  <div className="text-[9px] font-mono text-slate-500">Step {idx + 1}</div>
                  <div className="text-[10px] font-mono font-bold mt-0.5 truncate">{st}</div>
                </div>
                {idx < STATE_FLOW.length - 1 && (
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Financial Exposure & Recovery KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Amount at Risk</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ₹{Number(caseData.amount_at_risk).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Initial exposure</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Amount Recovered</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ₹{Number(caseData.amount_recovered).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-500 mt-1 font-mono">
            {caseData.amount_at_risk > 0
              ? `${Math.round((Number(caseData.amount_recovered) / Number(caseData.amount_at_risk)) * 100)}% captured`
              : '0%'}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Recovery Probability</div>
          <div className="text-2xl font-bold font-mono text-teal-400 mt-1">
            {Math.round(Number(caseData.recovery_probability) * 100)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">ML predictive estimate</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium">Priority Score</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {Math.round(Number(caseData.priority_score))} / 100
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Rank in processing queue</div>
        </div>
      </div>

      {/* Case Details & Interactive Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Root Cause, Customer, Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Transaction Info */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Source & Entity Context
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Customer / Entity Name</span>
                <span className="font-semibold text-slate-200 text-sm">
                  {caseData.customer_name || caseData.customer_id || 'Enterprise Customer'}
                </span>
                <div className="text-slate-400 font-mono text-[11px] mt-1">{caseData.customer_email || '—'}</div>
                <div className="text-slate-400 font-mono text-[11px]">{caseData.customer_phone || ''}</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Transaction Linkage</span>
                <div className="font-mono text-slate-200 text-xs">
                  Tx ID: <strong className="text-emerald-400">{caseData.source_transaction_id || 'N/A'}</strong>
                </div>
                <div className="font-mono text-slate-400 text-xs mt-1">
                  Exception ID: {caseData.source_exception_id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* AI Root Cause & Diagnosis Evidence */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Diagnosis & Root Cause
              </h3>
              <span className="text-xs font-mono text-purple-400 font-semibold">
                {Math.round(Number(caseData.diagnosis_confidence) * 100)}% Confidence
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-purple-950/50 rounded-xl space-y-2">
              <div className="text-xs">
                <span className="text-slate-400">Classified Root Cause:</span>
                <span className="ml-2 font-mono font-bold text-slate-200 text-sm">
                  {caseData.root_cause || 'PENDING_DIAGNOSIS'}
                </span>
              </div>

              {caseData.diagnosis_evidence && (
                <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                  <div className="text-slate-400 text-[11px] font-semibold">Evidence Factors:</div>
                  {caseData.diagnosis_evidence.evidence ? (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 font-mono">
                      {caseData.diagnosis_evidence.evidence.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="text-[10px] font-mono text-slate-400 overflow-x-auto p-2 bg-slate-950 rounded">
                      {JSON.stringify(caseData.diagnosis_evidence, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action History / Execution Timeline */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-emerald-400" />
              Recovery Action Timeline ({caseData.actions?.length || 0})
            </h3>

            {caseData.actions && caseData.actions.length > 0 ? (
              <div className="space-y-3">
                {caseData.actions.map((act) => (
                  <div
                    key={act.action_id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-200">
                        <span className="text-emerald-400">#{act.action_sequence}</span>
                        <span>{act.action_type}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
                          {act.execution_mode}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${getStatusBadge(act.outcome_status)}`}>
                        {act.outcome_status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Recovered: <strong className="text-emerald-400 font-mono">₹{Number(act.amount_recovered).toLocaleString('en-IN')}</strong></span>
                      <span className="font-mono text-[10px]">
                        Policy: {act.policy_passed ? 'PASSED' : `DENIED (${act.policy_denial_reason})`}
                      </span>
                    </div>

                    {act.audit_hash && (
                      <div className="text-[9px] font-mono text-slate-500 truncate pt-1 border-t border-slate-800/60">
                        SHA-256: {act.audit_hash}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-slate-950/40 rounded-xl text-center text-xs text-slate-500">
                No recovery actions executed yet. Use the Action Console on the right to trigger interventions.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Autonomous Agent Action Console */}
        <div className="space-y-6">
          {/* Action Console Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Intervention Console
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                SIMULATED SAFE MODE
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Trigger autonomous recovery pipeline steps or execute bounded policy actions:
            </p>

            <div className="space-y-2.5">
              {/* Step 1: Diagnose */}
              <button
                onClick={handleDiagnose}
                disabled={actionLoading}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>1. Run AI Diagnosis</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Step 2: Decide */}
              <button
                onClick={handleDecide}
                disabled={actionLoading}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>2. Decide Best Intervention</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Step 3: Execute Default Action */}
              <button
                onClick={() => handleExecute()}
                disabled={actionLoading || caseData.current_status === 'RECOVERED'}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  <span>3. Execute Bounded Action</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Specific Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-semibold mb-1">Specific Interventions:</div>
                <button
                  onClick={() => handleExecute('SMART_RETRY')}
                  disabled={actionLoading || caseData.current_status === 'RECOVERED'}
                  className="w-full py-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between text-left cursor-pointer"
                >
                  <span>Smart Payment Retry</span>
                  <span className="text-[10px] text-slate-500 font-mono">Retry ({caseData.retry_count}/3)</span>
                </button>

                <button
                  onClick={() => handleExecute('SEND_PAYMENT_LINK')}
                  disabled={actionLoading || caseData.current_status === 'RECOVERED'}
                  className="w-full py-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between text-left cursor-pointer"
                >
                  <span>Send Recovery Payment Link</span>
                  <span className="text-[10px] text-slate-500 font-mono">SMS / Email</span>
                </button>

                <button
                  onClick={() => handleExecute('SEND_INVOICE_REMINDER')}
                  disabled={actionLoading || caseData.current_status === 'RECOVERED'}
                  className="w-full py-1.5 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between text-left cursor-pointer"
                >
                  <span>Send Invoice Reminder</span>
                  <span className="text-[10px] text-slate-500 font-mono">B2B</span>
                </button>

                <button
                  onClick={() => handleExecute('ESCALATE_TO_HUMAN')}
                  disabled={actionLoading}
                  className="w-full py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 rounded-lg text-xs text-rose-300 flex items-center justify-between text-left cursor-pointer"
                >
                  <span>Escalate to Human Manager</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Policy Guardrails Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Guardrail Limits for Case
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Retries Used</span>
                <span className="font-mono text-slate-200">{caseData.retry_count} / {caseData.max_retries_allowed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Reminders Sent</span>
                <span className="font-mono text-slate-200">{caseData.reminder_count} / {caseData.max_reminders_allowed}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">High-Value Esc</span>
                <span className="font-mono text-slate-200">{caseData.is_high_value ? 'YES (>₹50k)' : 'NO'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Dispute Status</span>
                <span className="font-mono text-slate-200">{caseData.is_disputed ? 'DISPUTED' : 'CLEAR'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PageContainer>
  );
}
