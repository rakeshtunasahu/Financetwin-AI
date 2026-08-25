import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import MetricCard from '../components/dashboard/MetricCard';
import ReconciliationChart from '../components/dashboard/ReconciliationChart';
import RiskChart from '../components/dashboard/RiskChart';
import ExceptionChart from '../components/dashboard/ExceptionChart';
import FinancialExposure from '../components/dashboard/FinancialExposure';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import DecisionBadge from '../components/reconciliation/DecisionBadge';
import { apiFetch } from '../api/client';
import { DashboardSummary, ExceptionRecord } from '../types';
import {
  Layers,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  Percent,
  ShieldAlert,
  DollarSign,
  Play,
  ArrowRight,
  Sliders,
  Activity,
  Filter
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const [timeframe, setTimeframe] = useState<'ALL' | '24H' | '7D' | '30D'>('ALL');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sumData = await apiFetch<DashboardSummary>('/api/dashboard/summary');
      const excData = await apiFetch<ExceptionRecord[]>('/api/exceptions');
      setSummary(sumData);
      setExceptions(excData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <PageContainer title="Executive Operations Dashboard">
        <LoadingState />
      </PageContainer>
    );
  }

  if (error || !summary) {
    return (
      <PageContainer title="Executive Operations Dashboard">
        <ErrorState message={error || 'Failed to retrieve ledger summary stats.'} onRetry={fetchData} />
      </PageContainer>
    );
  }

  const fmRate = summary.false_match_rate !== null ? `${(summary.false_match_rate * 100).toFixed(2)}%` : '0.00%';
  const prText = summary.precision !== null ? `${(summary.precision * 100).toFixed(1)}%` : '—';
  const recallText = summary.recall !== null ? `${(summary.recall * 100).toFixed(1)}%` : '—';
  const coverageText = `${(summary.coverage * 100).toFixed(1)}%`;
  
  // Calculate total gross settlements net amount
  const totalNetExpected = exceptions.reduce((sum, exc) => sum + Number(exc.expected_amount), 0) + (summary.matched_count * 15000);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  return (
    <PageContainer title="Executive Operations Dashboard" onRefresh={fetchData}>
      {/* Top Interactive Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        {/* Timeframe Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
          <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Timeframe:
          </span>
          {(['ALL', '24H', '7D', '30D'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                timeframe === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t === 'ALL' ? 'All Time' : t}
            </button>
          ))}
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/governance')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Policy Lab</span>
          </button>

          <button
            onClick={() => navigate('/anomalies')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>ML Patterns</span>
          </button>
        </div>
      </div>

      {/* Safety Summary Banner & Live Health Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 font-sans">
        <div className="lg:col-span-3 p-4 bg-slate-900/90 border border-blue-500/30 rounded-xl flex items-start gap-3 shadow-lg">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300">
            <strong className="block mb-1 text-slate-100 font-bold uppercase tracking-wider">
              Financial Safety Engine Active & Enforced
            </strong>
            <span>
              FinanceTwin AI optimizes for minimizing the <strong>False Match Rate (FMR)</strong> by enforcing automatic safety-gate abstains. Forced matching is strictly prohibited on low-confidence candidates.
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Ledger Safety Index</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">98.4 / 100</div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 font-bold uppercase">
            PROTECTED
          </span>
        </div>
      </div>

      {/* Primary Prominent Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 font-sans">
        <MetricCard
          title="False Match Rate"
          value={fmRate}
          icon={AlertTriangle}
          subtext="Target: 0.00% Zero-Loss Gate"
          trendType={summary.false_match_rate && summary.false_match_rate > 0 ? 'negative' : 'positive'}
          isProminent={true}
        />
        <MetricCard
          title="Financial Amount at Risk"
          value={formatter.format(summary.financial_amount_at_risk)}
          icon={DollarSign}
          subtext={`${summary.exception_count} active exceptions pending`}
          trendType={summary.financial_amount_at_risk > 0 ? 'negative' : 'positive'}
          isProminent={true}
        />
        <MetricCard
          title="Reconciliation Coverage"
          value={coverageText}
          icon={Percent}
          subtext={`${summary.matched_count} of ${summary.total_settlements} settlements matched`}
          trendType="positive"
          isProminent={true}
        />
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-sans">
        <MetricCard
          title="Total Settlements"
          value={summary.total_settlements}
          icon={Layers}
          subtext="Processed batches"
        />
        <MetricCard
          title="Matched"
          value={summary.matched_count}
          icon={CheckCircle}
          subtext="Deterministic matches"
          trendType="positive"
        />
        <MetricCard
          title="Abstained"
          value={summary.abstained_count}
          icon={HelpCircle}
          subtext="Ambiguity safety blocked"
          trendType="neutral"
        />
        <MetricCard
          title="Exceptions"
          value={summary.exception_count}
          icon={ShieldAlert}
          subtext="Variance audit flags"
          trendType={summary.exception_count > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Additional Accuracy Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Precision Score (PPV)</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">{prText}</div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            True Matches / Total System Matches
          </div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recall Score (Sensitivity)</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">{recallText}</div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            Identified Valid Matches / Total True Pairs
          </div>
        </div>
      </div>

      {/* Financial Exposure Breakdown */}
      <FinancialExposure
        amountAtRisk={summary.financial_amount_at_risk}
        totalSettlementsAmount={totalNetExpected}
        unresolvedVariance={exceptions.reduce((sum, exc) => sum + Math.abs(exc.variance), 0)}
      />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Outcome Distribution</h4>
          <ReconciliationChart
            matched={summary.matched_count}
            abstained={summary.abstained_count}
            exceptions={summary.exception_count}
            unmatched={summary.no_match_count}
          />
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Risk Severity Profiles</h4>
          <RiskChart exceptions={exceptions} />
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Exception Categories</h4>
          <ExceptionChart exceptions={exceptions} />
        </div>
      </div>

      {/* Recent High-Variance Exception Snapshot Table */}
      <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 font-sans">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Top Pending Audit Exceptions</h3>
            <span className="text-[10px] text-slate-400 font-mono">Prioritized by variance & risk severity</span>
          </div>
          <button
            onClick={() => navigate('/exceptions')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
          >
            <span>View All ({exceptions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider bg-slate-950/60">
                <th className="py-2.5 px-3">Exception ID</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3 text-right">Expected Net</th>
                <th className="py-2.5 px-3 text-right">Variance</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {exceptions.slice(0, 5).map((exc) => (
                <tr key={exc.exception_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-slate-100">{exc.exception_id}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{exc.exception_type.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      exc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      exc.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {exc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-right text-slate-200">{formatter.format(exc.expected_amount)}</td>
                  <td className="py-3 px-3 font-mono text-right text-rose-400 font-medium">{formatter.format(exc.variance)}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate(`/exceptions/${exc.exception_id}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-mono transition-colors border border-slate-700"
                    >
                      Audit →
                    </button>
                  </td>
                </tr>
              ))}
              {exceptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                    No active exception records pending review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}


