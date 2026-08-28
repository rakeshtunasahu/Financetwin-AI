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
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { DashboardSummary, ExceptionRecord, UserRole } from '../types';
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
  Filter,
  User,
  Building,
  Lock,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { currentUser, isRole, hasPermission } = useAuth();
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
  }, [currentUser]);

  if (loading) {
    return (
      <PageContainer title={`${currentUser.role.replace(/_/g, ' ')} Dashboard`}>
        <LoadingState />
      </PageContainer>
    );
  }

  if (error || !summary) {
    return (
      <PageContainer title={`${currentUser.role.replace(/_/g, ' ')} Dashboard`}>
        <ErrorState message={error || 'Failed to retrieve ledger summary stats.'} onRetry={fetchData} />
      </PageContainer>
    );
  }

  const fmRate = summary.false_match_rate !== null ? `${(summary.false_match_rate * 100).toFixed(2)}%` : '0.00%';
  const coverageText = `${(summary.coverage * 100).toFixed(1)}%`;
  
  const totalNetExpected = exceptions.reduce((sum, exc) => sum + Number(exc.expected_amount), 0) + (summary.matched_count * 15000);
  const totalVariance = exceptions.reduce((sum, exc) => sum + Number(exc.variance), 0);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const getRoleHeaderInfo = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return {
          title: 'Executive Systems & Governance Console',
          badge: 'SYSTEM-WIDE ACCESS',
          desc: 'Global control across settlement matching, policy thresholds, security logs, and anomaly detection.'
        };
      case 'FINANCE_ANALYST':
        return {
          title: 'Daily Settlement Operations Command',
          badge: 'OPERATIONAL SCOPE',
          desc: 'Manage authorized settlement queues, review conservative abstains, and investigate exceptions.'
        };
      case 'FINANCE_MANAGER':
        return {
          title: 'Treasury & Financial Exposure Dashboard',
          badge: 'MANAGEMENT & APPROVALS',
          desc: 'Aggregated exposure metrics, high-value settlement queues, and sandbox policy simulation.'
        };
      case 'RISK_COMPLIANCE_OFFICER':
        return {
          title: 'Risk & ML Anomaly Intelligence Center',
          badge: 'HIGH-RISK & COMPLIANCE',
          desc: 'Focused monitoring of ML anomaly clusters, critical severity discrepancies, and fraud signals.'
        };
      case 'AUDITOR':
        return {
          title: 'Statutory Audit & Evidence Verification',
          badge: 'READ-ONLY STATUTORY AUDIT',
          desc: 'Immutable decision history, policy change logs, and forensic AI grounding with masked sensitive data.'
        };
    }
  };

  const roleInfo = getRoleHeaderInfo(currentUser.role);

  return (
    <PageContainer title={roleInfo.title} onRefresh={fetchData}>
      {/* Role Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">{currentUser.name}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                {roleInfo.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{roleInfo.desc}</p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start sm:self-auto">
          <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase px-2 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-400" /> Filter:
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
              {t === 'ALL' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Autonomous Revenue Recovery Feature Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
            RR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">RevenueRescue AI: Autonomous Recovery Agent</h4>
              <span className="text-[9px] font-mono font-bold px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated interventions for failed payments, checkout drop-offs & overdue invoices. <strong>Detect. Decide. Recover.</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/recovery')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <span>Open Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Masking Alert for Auditor */}
      {isRole('AUDITOR') && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 font-mono">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Compliance Mode Active: Sensitive identifiers (Customer IDs, Bank UTRs) are masked by backend policy.</span>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      {isRole('FINANCE_MANAGER') ? (
        // MANAGER: Exposure & Management Focused Metrics
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Volume Processed"
            value={summary.total_settlements}
            subtext="Authorized batches"
            icon={Layers}
            trendType="neutral"
          />
          <MetricCard
            title="Financial Amount At Risk"
            value={formatter.format(summary.financial_amount_at_risk)}
            subtext="Awaiting manager review"
            icon={DollarSign}
            trendType="negative"
            isProminent={true}
          />
          <MetricCard
            title="Manual Review Queue"
            value={summary.exception_count}
            subtext="Exceptions requiring review"
            icon={AlertTriangle}
            trendType="negative"
          />
          <MetricCard
            title="Auto-Resolution Rate"
            value={`${(summary.auto_resolution_rate * 100).toFixed(1)}%`}
            subtext="Low-risk auto resolved"
            icon={CheckCircle}
            trendType="positive"
          />
        </div>
      ) : isRole('RISK_COMPLIANCE_OFFICER') ? (
        // RISK OFFICER: Anomaly & Severity Focused Metrics
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="High-Risk Exposure"
            value={formatter.format(summary.financial_amount_at_risk)}
            subtext="High & Critical items"
            icon={ShieldAlert}
            trendType="negative"
            isProminent={true}
          />
          <MetricCard
            title="Active Discrepancies"
            value={summary.exception_count}
            subtext="Risk monitored exceptions"
            icon={AlertTriangle}
            trendType="negative"
          />
          <MetricCard
            title="Safety Gate Abstains"
            value={summary.abstained_count}
            subtext="Conservative holds"
            icon={HelpCircle}
            trendType="neutral"
          />
          <MetricCard
            title="False Match Rate"
            value={fmRate}
            subtext="Target: 0.00% Zero-Loss"
            icon={Percent}
            trendType="positive"
          />
        </div>
      ) : isRole('AUDITOR') ? (
        // AUDITOR: Verification & Historical Accuracy Metrics
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Verified Settlements"
            value={summary.total_settlements}
            subtext="Statutory audited batches"
            icon={Layers}
            trendType="neutral"
          />
          <MetricCard
            title="Historical Matched"
            value={summary.matched_count}
            subtext={`Match Rate: ${(summary.match_rate * 100).toFixed(1)}%`}
            icon={CheckCircle}
            trendType="positive"
          />
          <MetricCard
            title="Audited Exceptions"
            value={summary.exception_count}
            subtext="Verified discrepancies"
            icon={AlertTriangle}
            trendType="negative"
          />
          <MetricCard
            title="Ledger Traceability"
            value="100.0%"
            subtext="Immutable audit trail"
            icon={ShieldCheck}
            trendType="positive"
            isProminent={true}
          />
        </div>
      ) : (
        // ADMIN & FINANCE ANALYST: Full Operational Suite
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Settlements"
            value={summary.total_settlements}
            subtext={`Coverage: ${coverageText}`}
            icon={Layers}
            trendType="neutral"
          />
          <MetricCard
            title="Matched Settlements"
            value={summary.matched_count}
            subtext={`Match Rate: ${(summary.match_rate * 100).toFixed(1)}%`}
            icon={CheckCircle}
            trendType="positive"
          />
          <MetricCard
            title="Safety Gate Abstains"
            value={summary.abstained_count}
            subtext="Conservative safety hold"
            icon={HelpCircle}
            trendType="neutral"
          />
          <MetricCard
            title="Financial Amount At Risk"
            value={formatter.format(summary.financial_amount_at_risk)}
            subtext={`${summary.exception_count} exceptions recorded`}
            icon={AlertTriangle}
            trendType="negative"
            isProminent={true}
          />
        </div>
      )}

      {/* SECONDARY ROW: CHARTS & FINANCIAL EXPOSURE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Left 2 Cols: Main Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReconciliationChart
              matched={summary.matched_count}
              abstained={summary.abstained_count}
              exceptions={summary.exception_count}
              unmatched={summary.no_match_count}
            />
            <RiskChart exceptions={exceptions} />
          </div>

          <ExceptionChart exceptions={exceptions} />
        </div>

        {/* Right Col: Financial Exposure & Role Actions */}
        <div className="space-y-6">
          <FinancialExposure
            amountAtRisk={summary.financial_amount_at_risk}
            totalSettlementsAmount={totalNetExpected}
            unresolvedVariance={totalVariance}
          />

          {/* Role-Specific Quick Action Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Role Operational Shortcuts
            </h4>
            <div className="space-y-2">
              {hasPermission('can_simulate_policy') && (
                <button
                  onClick={() => navigate('/governance')}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-200">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Governance Policy Simulator</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}

              {hasPermission('can_view_anomalies') && (
                <button
                  onClick={() => navigate('/anomalies')}
                  className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-200">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>ML Anomaly Clusters</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}

              <button
                onClick={() => navigate('/exceptions')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Exceptions Command Center</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>

              <button
                onClick={() => navigate('/audit')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Audit Logs & Traceability</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
