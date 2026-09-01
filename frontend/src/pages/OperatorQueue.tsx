import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Filter,
  Search,
  ChevronRight,
  UserCheck,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { RecoveryCase } from '../types';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

export default function OperatorQueue() {
  const navigate = useNavigate();
  const { currentUser, hasPermission } = useAuth();
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTION_NEEDED' | 'IN_PROGRESS' | 'ESCALATED' | 'RECOVERED' | 'ALL'>('ACTION_NEEDED');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recoveryApi.getCases({ limit: 150 });
      setCases(data);
    } catch (err: any) {
      console.error('Failed to load operator queue:', err);
      setError(err.message || 'Failed to load recovery queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleQuickAction = async (caseId: string, actionType?: string) => {
    try {
      setActionLoading(caseId);
      setActionMsg(null);
      const res = await recoveryApi.executeAction(caseId, actionType);
      if (res.policy_passed) {
        setActionMsg({
          type: 'success',
          text: `Action ${res.action_type} executed for ${caseId}: ${res.outcome_status} (₹${res.amount_recovered.toLocaleString('en-IN')} recovered)`
        });
      } else {
        setActionMsg({
          type: 'error',
          text: `Action for ${caseId} stopped by policy guardrail: ${res.policy_denial_reason}`
        });
      }
      await fetchQueue();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDiagnose = async (caseId: string) => {
    try {
      setActionLoading(caseId);
      setActionMsg(null);
      const res = await recoveryApi.diagnoseCase(caseId);
      setActionMsg({
        type: 'success',
        text: `Diagnosed ${caseId}: Root Cause "${res.root_cause}" (${Math.round(res.confidence * 100)}% confidence)`
      });
      await fetchQueue();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Diagnosis failed' });
    } finally {
      setActionLoading(null);
    }
  };

  // Metrics calculations
  const myCases = cases;
  const totalAtRisk = myCases.reduce((sum, c) => sum + Number(c.amount_at_risk || 0), 0);
  const totalRecovered = myCases.reduce((sum, c) => sum + Number(c.amount_recovered || 0), 0);
  
  const needsActionCases = myCases.filter(
    (c) => c.current_status === 'DETECTED' || c.current_status === 'DIAGNOSED' || c.current_status === 'ACTION_SELECTED'
  );
  const inProgressCases = myCases.filter(
    (c) => c.current_status === 'RETRY' || c.current_status === 'ACTION_EXECUTED' || c.current_status === 'WAITING_FOR_OUTCOME'
  );
  const escalatedCases = myCases.filter((c) => c.current_status === 'ESCALATED');
  const recoveredCases = myCases.filter((c) => c.current_status === 'RECOVERED');

  const filteredCases = myCases.filter((c) => {
    // Tab filter
    if (activeTab === 'ACTION_NEEDED' && !needsActionCases.includes(c)) return false;
    if (activeTab === 'IN_PROGRESS' && !inProgressCases.includes(c)) return false;
    if (activeTab === 'ESCALATED' && !escalatedCases.includes(c)) return false;
    if (activeTab === 'RECOVERED' && !recoveredCases.includes(c)) return false;

    // Search filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(term) ||
      (c.customer_name && c.customer_name.toLowerCase().includes(term)) ||
      (c.customer_id && c.customer_id.toLowerCase().includes(term)) ||
      (c.root_cause && c.root_cause.toLowerCase().includes(term))
    );
  });

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

  return (
    <PageContainer title="My Recovery Queue" onRefresh={fetchQueue}>
      <div className="space-y-6">
        {/* Top Banner Header — Operator Focus */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                RECOVERY OPERATOR WORKSPACE
              </span>
              <span className="text-xs text-slate-400 font-mono">Assigned Queue: {currentUser.name}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              My Recovery Queue
              <Zap className="w-6 h-6 text-blue-400" />
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Execute hands-on investigations, review AI root-cause evidence, and trigger bounded recovery interventions.
              <strong className="text-slate-200 ml-1">What should I work on next?</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQueue}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {actionMsg && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="ml-2 font-bold hover:opacity-80">✕</button>
          </div>
        )}
      </div>

      {/* Top 4 Operator KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('ACTION_NEEDED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ACTION_NEEDED'
              ? 'bg-blue-950/60 border-blue-500 shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Needs Action</span>
            <AlertTriangle className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-2">
            {needsActionCases.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Pending diagnosis / action</div>
        </div>

        <div
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'IN_PROGRESS'
              ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>In Progress / Retry</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {inProgressCases.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Under active cadence</div>
        </div>

        <div
          onClick={() => setActiveTab('ESCALATED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'ESCALATED'
              ? 'bg-rose-950/60 border-rose-500 shadow-md shadow-rose-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Escalated</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-2">
            {escalatedCases.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Referred to manager</div>
        </div>

        <div
          onClick={() => setActiveTab('RECOVERED')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'RECOVERED'
              ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
            <span>Recovered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {recoveredCases.length}
          </div>
          <div className="text-[10px] text-emerald-500 mt-1 font-mono">
            ₹{totalRecovered.toLocaleString('en-IN')} rescued
          </div>
        </div>
      </div>

      {/* Priority Action Section ("What should I work on next?") */}
      {needsActionCases.length > 0 && activeTab === 'ACTION_NEEDED' && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Highest Priority Recommendations (Work on Next)
            </h2>
            <span className="text-xs font-mono text-slate-400">Ranked by Priority Score</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {needsActionCases.slice(0, 3).map((c) => (
              <div
                key={c.case_id}
                className="p-4 bg-slate-950/80 border border-slate-800 hover:border-blue-700/60 rounded-xl flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-xs text-slate-200">{c.case_id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-bold">
                      SCORE: {Math.round(Number(c.priority_score))}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200 truncate mb-1">
                    {c.customer_name || c.customer_id || 'Enterprise Client'}
                  </div>

                  <div className="text-base font-bold font-mono text-amber-400 mb-2">
                    ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                  </div>

                  <div className="p-2 bg-slate-900 rounded-lg text-xs space-y-1 mb-3">
                    <div className="text-slate-400 text-[10px]">Diagnosis:</div>
                    <div className="text-slate-200 font-mono text-[11px] truncate">
                      {c.root_cause || 'Awaiting Root Cause Analysis'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  {!c.root_cause || c.current_status === 'DETECTED' ? (
                    <button
                      onClick={() => handleDiagnose(c.case_id)}
                      disabled={actionLoading === c.case_id}
                      className="flex-1 py-1.5 px-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      {actionLoading === c.case_id ? 'Diagnosing...' : '1. Diagnose'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleQuickAction(c.case_id)}
                      disabled={actionLoading === c.case_id}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    >
                      {actionLoading === c.case_id ? 'Executing...' : 'Execute Action'}
                    </button>
                  )}
                  <Link
                    to={`/recovery/cases/${c.case_id}`}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Case Portal"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Filterable Queue Table */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('ACTION_NEEDED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ACTION_NEEDED'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Needs Action ({needsActionCases.length})
            </button>
            <button
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({inProgressCases.length})
            </button>
            <button
              onClick={() => setActiveTab('ESCALATED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ESCALATED'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Escalated ({escalatedCases.length})
            </button>
            <button
              onClick={() => setActiveTab('RECOVERED')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'RECOVERED'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recovered ({recoveredCases.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Cases ({myCases.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search case, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 font-semibold">Case ID</th>
                <th className="pb-3 font-semibold">Customer / Scenario</th>
                <th className="pb-3 font-semibold text-right">At Risk</th>
                <th className="pb-3 font-semibold text-center">Priority</th>
                <th className="pb-3 font-semibold">Diagnosis / Recommendation</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Quick Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCases.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-mono font-bold text-slate-200">
                    <Link to={`/recovery/cases/${c.case_id}`} className="hover:text-blue-400">
                      {c.case_id}
                    </Link>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-200 truncate max-w-[160px]">
                      {c.customer_name || c.customer_id || 'Enterprise Customer'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {c.recovery_type.replace(/_/g, ' ')}
                    </div>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-slate-200">
                    ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-center font-mono">
                    <span className="font-bold text-slate-200">{Math.round(Number(c.priority_score))}</span>
                    <span className="text-slate-500 text-[10px] block">
                      {Math.round(Number(c.recovery_probability) * 100)}% prob
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="font-mono text-[11px] text-slate-300 truncate max-w-[180px]">
                      {c.root_cause || 'Pending AI Diagnosis'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {c.actions && c.actions.length > 0 ? `Action #${c.actions.length} executed` : 'Intervention pending'}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${getStatusBadge(c.current_status)}`}>
                      {c.current_status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.current_status !== 'RECOVERED' && (
                        <button
                          onClick={() => handleQuickAction(c.case_id)}
                          disabled={actionLoading === c.case_id}
                          className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          {actionLoading === c.case_id ? 'Running...' : 'Action'}
                        </button>
                      )}
                      <Link
                        to={`/recovery/cases/${c.case_id}`}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-all"
                      >
                        Inspect
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </PageContainer>
  );
}
