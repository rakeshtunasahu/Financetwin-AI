import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MetricCard from '../components/dashboard/MetricCard';
import ReconciliationChart from '../components/dashboard/ReconciliationChart';
import RiskChart from '../components/dashboard/RiskChart';
import ExceptionChart from '../components/dashboard/ExceptionChart';
import FinancialExposure from '../components/dashboard/FinancialExposure';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
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
  DollarSign
} from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);

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
      {/* Safety Summary Banner */}
      <div className="p-4 bg-slate-900/90 border border-blue-500/30 rounded-xl flex items-start gap-3 shadow-md">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <strong className="block mb-1 text-slate-100 font-bold uppercase tracking-wider">Financial Safety Engine Active</strong>
          <span>
            FinanceTwin AI strictly optimizes for minimizing the <strong>False Match Rate (FMR)</strong> by enforcing automatic safety-gate abstains. Forced matching is prohibited on low-confidence candidates.
          </span>
        </div>
      </div>

      {/* Primary Prominent Risk Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Precision Score</span>
            <div className="text-xl font-bold font-mono text-slate-100 mt-1">{prText}</div>
          </div>
          <div className="text-xs text-slate-400 text-right">
            True Matches / Total System Matches
          </div>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recall Score</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Outcome Distribution</h4>
          <ReconciliationChart
            matched={summary.matched_count}
            abstained={summary.abstained_count}
            exceptions={summary.exception_count}
            unmatched={summary.no_match_count}
          />
        </div>

        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Risk Severity Profiles</h4>
          <RiskChart exceptions={exceptions} />
        </div>

        <div className="p-5 bg-slate-900/70 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Exception Categories</h4>
          <ExceptionChart exceptions={exceptions} />
        </div>
      </div>
    </PageContainer>
  );
}

