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
  Target,
  ShieldCheck
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
  
  // Calculate total gross settlements net amount
  const totalNetExpected = exceptions.reduce((sum, exc) => sum + Number(exc.expected_amount), 0) + (summary.matched_count * 15000);

  return (
    <PageContainer title="Executive Operations Dashboard" onRefresh={fetchData}>
      {/* Safety Summary Alert */}
      <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-400 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5 font-bold uppercase tracking-wider text-emerald-300">Primary Core Safety Principle</strong>
          <span>
            A false match is more dangerous than an unmatched transaction. FinanceTwin AI strictly optimizes for minimizing the 
            <strong> False Match Rate (FMR)</strong> by enforcing auto-abstain safety gates. Forced matching is prohibited.
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Settlements"
          value={summary.total_settlements}
          icon={Layers}
          subtext="Total processed gateway batches"
        />
        <MetricCard
          title="Matched Batches"
          value={summary.matched_count}
          icon={CheckCircle}
          subtext={`${(summary.coverage * 100).toFixed(1)}% Auto Coverage`}
          trendType="positive"
        />
        <MetricCard
          title="Abstained Decisions"
          value={summary.abstained_count}
          icon={HelpCircle}
          subtext="Safety-gate blocked matches"
          trendType="neutral"
        />
        <MetricCard
          title="Match Safety Precision"
          value={prText}
          icon={Target}
          subtext={`False Match Rate: ${fmRate}`}
          trendType={summary.false_match_rate && summary.false_match_rate > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Financial Exposure Section */}
      <FinancialExposure
        amountAtRisk={summary.financial_amount_at_risk}
        totalSettlementsAmount={totalNetExpected}
        unresolvedVariance={exceptions.reduce((sum, exc) => sum + Math.abs(exc.variance), 0)}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Outcome Distribution</h4>
          <ReconciliationChart
            matched={summary.matched_count}
            abstained={summary.abstained_count}
            exceptions={summary.exception_count}
            unmatched={summary.no_match_count}
          />
        </div>

        <div className="glass-panel p-6">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Risk Severity Profiles</h4>
          <RiskChart exceptions={exceptions} />
        </div>

        <div className="glass-panel p-6">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Exception Categories</h4>
          <ExceptionChart exceptions={exceptions} />
        </div>
      </div>
    </PageContainer>
  );
}
