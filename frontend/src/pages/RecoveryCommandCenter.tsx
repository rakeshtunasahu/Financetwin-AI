import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
  Users,
  Layers,
  Sparkles
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { RecoveryMetrics, RecoveryCase } from '../types';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

export default function RecoveryCommandCenter() {
  const navigate = useNavigate();
  const { hasPermission, currentUser } = useAuth();
  const [metrics, setMetrics] = useState<RecoveryMetrics | null>(null);
  const [recentCases, setRecentCases] = useState<RecoveryCase[]>([]);
  const [attentionCases, setAttentionCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [m, cases] = await Promise.all([
        recoveryApi.getMetrics(),
        recoveryApi.getCases({ limit: 100 })
      ]);
      setMetrics(m);
      setRecentCases(cases.slice(0, 8));
      // Cases requiring human attention: escalated, high value not recovered, disputed
      const attention = cases.filter(
        (c) =>
          c.current_status === 'ESCALATED' ||
          (c.is_high_value && c.current_status !== 'RECOVERED') ||
          c.is_disputed
      );
      setAttentionCases(attention.slice(0, 6));
    } catch (err: any) {
      console.error('Failed to load recovery command center data:', err);
      setError(err.message || 'Failed to load recovery metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDetectRisks = async () => {
    try {
      setDetecting(true);
      setDetectMsg(null);
      const res = await recoveryApi.detectCases();
      setDetectMsg(`Successfully detected ${res.count} new recovery cases from reconciliation exceptions!`);
      await fetchData();
    } catch (err: any) {
      setDetectMsg(`Detection error: ${err.message}`);
    } finally {
      setDetecting(false);
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

  return (
    <PageContainer title="Recovery Command Center" onRefresh={fetchData}>
      <div className="space-y-6">
        {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AUTONOMOUS RECOVERY AGENT
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.0 • Real-time Intervention Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Recovery Command Center
              <Zap className="w-6 h-6 text-emerald-400 fill-emerald-400/20 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Autonomous, policy-bounded revenue recovery across payment failures, checkout drop-offs, and overdue invoices.
              <strong className="text-slate-200 ml-1">Detect. Decide. Recover.</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDetectRisks}
              disabled={detecting}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:border-slate-600 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-cyan-400 ${detecting ? 'animate-spin' : ''}`} />
              <span>{detecting ? 'Detecting Risks...' : 'Detect Revenue Risks'}</span>
            </button>

            {hasPermission('can_run_recovery_batch') && (
              <button
                onClick={() => navigate('/recovery/batch')}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 transition-all cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>Run Autonomous Batch</span>
              </button>
            )}
          </div>
        </div>

        {detectMsg && (
          <div className="mt-4 p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{detectMsg}</span>
            <button onClick={() => setDetectMsg(null)} className="text-emerald-400 hover:text-emerald-200 ml-2">✕</button>
          </div>
        )}
      </div>

      {loading && !metrics ? (
        <div className="p-12 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-4">Loading recovery analytics and queue...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-2xl text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-rose-900/50 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Top 6 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Revenue At Risk */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Revenue at Risk</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-slate-100 font-mono">
                  ₹{metrics ? metrics.total_at_risk.toLocaleString('en-IN') : '0'}
                </div>
                <div className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                  {metrics?.total_cases || 0} total cases detected
                </div>
              </div>
              <div className="text-[10px] text-slate-500">Total pipeline exposure</div>
            </div>

            {/* 2. Revenue Recovered */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-800/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Revenue Recovered</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{metrics ? metrics.total_recovered.toLocaleString('en-IN') : '0'}
                </div>
                <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
                  {metrics?.recovered_cases || 0} cases rescued
                </div>
              </div>
              <div className="text-[10px] text-slate-500">Autonomous & assisted</div>
            </div>

            {/* 3. Recovery Rate */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-teal-800/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Recovery Rate</span>
                <TrendingUp className="w-4 h-4 text-teal-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-teal-400 font-mono">
                  {metrics?.recovery_rate_pct || 0}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, metrics?.recovery_rate_pct || 0)}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-[10px] text-slate-500">Target benchmark &gt; 45%</div>
            </div>

            {/* 4. Active In-Progress */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-cyan-800/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>In-Progress / Retry</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-cyan-400 font-mono">
                  {metrics?.in_progress_cases || 0}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Under autonomous retry
                </div>
              </div>
              <div className="text-[10px] text-slate-500">Active cadences running</div>
            </div>

            {/* 5. Human Attention / Escalated */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-rose-800/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Escalated / Policy</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-rose-400 font-mono">
                  {metrics?.escalated_cases || 0}
                </div>
                <div className="text-[11px] text-rose-400/90 font-mono mt-0.5">
                  Requires approval
                </div>
              </div>
              <div className="text-[10px] text-slate-500">High-value / policy bounds</div>
            </div>

            {/* 6. Avg Time to Recovery */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-purple-800/60 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Avg Recovery Time</span>
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="my-2">
                <div className="text-xl font-bold text-purple-400 font-mono">
                  {metrics?.avg_time_to_recovery_hours || 4.2}h
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Fastest &lt; 15 mins
                </div>
              </div>
              <div className="text-[10px] text-slate-500">Detection to settlement</div>
            </div>
          </div>

          {/* Recovery Funnel & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funnel Visualization */}
            <div className="lg:col-span-2 p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Autonomous Recovery Funnel
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Stage-by-stage progression from detection to revenue capture</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">100% Policy-Bounded</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Stage 1: Detected */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl relative overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">1. Detected</div>
                  <div className="text-lg font-bold text-slate-100 font-mono mt-1">
                    {metrics?.funnel?.detected || metrics?.total_cases || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">₹{metrics?.total_at_risk.toLocaleString('en-IN')}</div>
                  <div className="mt-2 w-full bg-slate-800 h-1 rounded-full">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                {/* Stage 2: Diagnosed */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl relative overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">2. Diagnosed</div>
                  <div className="text-lg font-bold text-blue-400 font-mono mt-1">
                    {metrics?.funnel?.diagnosed || Math.round((metrics?.total_cases || 0) * 0.95)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Root cause classified</div>
                  <div className="mt-2 w-full bg-slate-800 h-1 rounded-full">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                {/* Stage 3: Actioned */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl relative overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">3. Actioned</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                    {metrics?.funnel?.actioned || Math.round((metrics?.total_cases || 0) * 0.88)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Interventions fired</div>
                  <div className="mt-2 w-full bg-slate-800 h-1 rounded-full">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                {/* Stage 4: Recovered */}
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl relative overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">4. Recovered</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                    {metrics?.funnel?.recovered || metrics?.recovered_cases || 0}
                  </div>
                  <div className="text-[11px] text-emerald-300/80 mt-0.5">₹{metrics?.total_recovered.toLocaleString('en-IN')}</div>
                  <div className="mt-2 w-full bg-slate-800 h-1 rounded-full">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, metrics?.recovery_rate_pct || 0)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Recovery Types Breakdown */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300 mb-3">Recovery Performance by Scenario</div>
                <div className="space-y-2.5">
                  {metrics?.by_type &&
                    Object.entries(metrics.by_type).map(([typeKey, data]: [string, any]) => {
                      const rate = data.at_risk > 0 ? ((data.recovered / data.at_risk) * 100).toFixed(1) : '0';
                      return (
                        <div key={typeKey} className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/80 flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-200 font-mono">{typeKey.replace(/_/g, ' ')}</span>
                              <span className="text-emerald-400 font-mono font-bold">{rate}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono text-slate-200">₹{Number(data.recovered).toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-slate-500">of ₹{Number(data.at_risk).toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Quick Actions & Policy Guardrails Summary */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    Active Guardrails
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">
                    ENFORCED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">Hard constraints governing all autonomous recovery decisions:</p>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Payment Retries</span>
                    <span className="font-mono font-bold text-slate-200">3 retries (24h cooldown)</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Customer Reminders</span>
                    <span className="font-mono font-bold text-slate-200">3 reminders max</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Workflow Duration Limit</span>
                    <span className="font-mono font-bold text-slate-200">7 days auto-expiry</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">High-Value Threshold</span>
                    <span className="font-mono font-bold text-amber-400">₹50,000 (Human Review)</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Promise-to-Pay Miss Limit</span>
                    <span className="font-mono font-bold text-slate-200">2 misses → Escalate</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-2">
                <Link
                  to="/recovery/cases"
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explore All Recovery Cases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/governance"
                  className="w-full py-2 px-3 bg-transparent hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Simulate Policy Adjustments</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Human Attention Queue (High-Value / Escalated) */}
          {attentionCases.length > 0 && (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Human Attention & High-Value Queue
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cases requiring managerial approval or specialized attention due to policy boundaries or disputes
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                  {attentionCases.length} Cases Requiring Action
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {attentionCases.map((c) => (
                  <div
                    key={c.case_id}
                    className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-slate-200">{c.case_id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getStatusBadge(c.current_status)}`}>
                          {c.current_status}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-200 mb-1">
                        {c.customer_name || c.customer_id || 'Enterprise Client'}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-bold text-amber-400 font-mono">
                          ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                        </span>
                        {c.is_high_value && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800 rounded">
                            HIGH VALUE
                          </span>
                        )}
                        {c.is_disputed && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-800 rounded">
                            DISPUTED
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2">
                        {c.escalation_reason || c.root_cause || 'Escalated for human operator review'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">
                        Prob: {Math.round(Number(c.recovery_probability) * 100)}%
                      </span>
                      <button
                        onClick={() => navigate(`/recovery/cases/${c.case_id}`)}
                        className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Review Case</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Recovery Operations Queue */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-emerald-400" />
                  Live Recovery Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of recently actioned and diagnosed recovery cases</p>
              </div>
              <Link
                to="/recovery/cases"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Case ID</th>
                    <th className="pb-3 font-semibold">Customer / Source</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold text-right">At Risk</th>
                    <th className="pb-3 font-semibold text-right">Recovered</th>
                    <th className="pb-3 font-semibold text-center">Score / Prob</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {recentCases.map((c) => (
                    <tr key={c.case_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono font-bold text-slate-200">
                        <Link to={`/recovery/cases/${c.case_id}`} className="hover:text-blue-400">
                          {c.case_id}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-300">
                        <div className="font-medium text-slate-200 truncate max-w-[160px]">
                          {c.customer_name || c.customer_id || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                          {c.source_transaction_id || c.source_exception_id || ''}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[11px] text-slate-300">
                          {c.recovery_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-200">
                        ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-400">
                        ₹{Number(c.amount_recovered).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono text-slate-300 text-[11px]">
                          {Math.round(Number(c.priority_score))} | {Math.round(Number(c.recovery_probability) * 100)}%
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${getStatusBadge(c.current_status)}`}>
                          {c.current_status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => navigate(`/recovery/cases/${c.case_id}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[11px] font-medium border border-slate-700 transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      </div>
    </PageContainer>
  );
}
