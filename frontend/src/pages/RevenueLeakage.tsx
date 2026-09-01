import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitCompare,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Filter,
  DollarSign,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { LeakageSummaryResponse, LeakageCategory, RecoveryCase } from '../types';
import PageContainer from '../components/layout/PageContainer';
import RecoveryCaseDrawer from '../components/recovery/RecoveryCaseDrawer';

export default function RevenueLeakage() {
  const navigate = useNavigate();
  const [leakageData, setLeakageData] = useState<LeakageSummaryResponse | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [categoryCases, setCategoryCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCases, setLoadingCases] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDrawerCaseId, setActiveDrawerCaseId] = useState<string | null>(null);

  const fetchLeakage = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recoveryApi.getLeakage();
      setLeakageData(res);
      if (res.categories && res.categories.length > 0 && !selectedCategoryKey) {
        setSelectedCategoryKey(res.categories[0].category_key);
      }
    } catch (err: any) {
      console.error('Failed to load leakage summary:', err);
      setError(err?.message || 'Failed to load revenue leakage analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCases = async (categoryKey: string) => {
    try {
      setLoadingCases(true);
      const cases = await recoveryApi.getCases({ recovery_type: categoryKey, limit: 50 });
      setCategoryCases(cases);
    } catch (err) {
      console.error('Failed to load category cases', err);
    } finally {
      setLoadingCases(false);
    }
  };

  useEffect(() => {
    fetchLeakage();
  }, []);

  useEffect(() => {
    if (selectedCategoryKey) {
      fetchCategoryCases(selectedCategoryKey);
    }
  }, [selectedCategoryKey]);

  const selectedCategory = leakageData?.categories.find((c) => c.category_key === selectedCategoryKey) || leakageData?.categories[0];

  return (
    <PageContainer title="Revenue Leakage Intelligence" onRefresh={fetchLeakage}>
      <div className="space-y-6">
        
        {/* Top Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  LEAKAGE FORENSICS
                </span>
                <span className="text-xs text-slate-400 font-mono">Continuous Multi-Channel Scan</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Revenue Leakage Intelligence
                <GitCompare className="w-6 h-6 text-rose-400" />
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Pinpoint exactly where, why, and how much revenue is leaking across payment gateways, cart drop-offs, and unsettled invoices.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Pipeline Leakage</span>
                <div className="text-xl font-bold font-mono text-rose-400">
                  ₹{Number(leakageData?.total_at_risk || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Recoverable Opportunity</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  ₹{Number(leakageData?.total_recoverable || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 5 Leakage Domain Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {leakageData?.categories.map((cat) => {
            const isSelected = selectedCategoryKey === cat.category_key;
            return (
              <div
                key={cat.category_key}
                onClick={() => setSelectedCategoryKey(cat.category_key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-950 border-rose-500/80 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-200 truncate">{cat.title}</span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-1.5 py-0.5 rounded">
                      {cat.cases_count} cases
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 line-clamp-2 leading-tight">{cat.description}</p>

                  <div className="space-y-1.5 font-mono text-xs pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-500">At Risk:</span>
                      <span className="font-bold text-slate-200">₹{cat.amount_at_risk.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-400 font-semibold">Recoverable:</span>
                      <span className="font-bold text-emerald-400">₹{cat.recoverable_amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Benchmark: {cat.benchmark_recovery_pct}%</span>
                  <span className={`font-bold ${cat.trend_direction === 'up' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {cat.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Dive on Selected Leakage Category */}
        {selectedCategory && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{selectedCategory.title} — Active Risk Registry</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCategory.description}</p>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs">
                <span className="text-slate-400">
                  Category Risk: <strong className="text-rose-400">₹{selectedCategory.amount_at_risk.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-slate-400">
                  Recoverable: <strong className="text-emerald-400">₹{selectedCategory.recoverable_amount.toLocaleString('en-IN')}</strong>
                </span>
              </div>
            </div>

            {loadingCases ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-7 h-7 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-mono">Loading cases in this leakage category...</span>
              </div>
            ) : categoryCases.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-mono">
                No active cases currently detected in this category.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="pb-3 font-semibold">Case ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold text-right">At Risk</th>
                      <th className="pb-3 font-semibold text-center">Recovery Prob</th>
                      <th className="pb-3 font-semibold text-right">Expected Recovery</th>
                      <th className="pb-3 font-semibold">Root Cause</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {categoryCases.map((c) => {
                      const atRiskVal = Number(c.amount_at_risk || 0);
                      const probVal = Number(c.recovery_probability || 0.7);
                      const expRec = atRiskVal * probVal;
                      return (
                        <tr
                          key={c.case_id}
                          onClick={() => setActiveDrawerCaseId(c.case_id)}
                          className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                        >
                          <td className="py-3 font-mono font-bold text-emerald-400">
                            {c.case_id}
                          </td>
                          <td className="py-3 text-slate-200 font-medium">
                            {c.customer_name || c.customer_id || 'Enterprise Client'}
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-slate-200">
                            ₹{atRiskVal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 text-center font-mono font-bold text-teal-300">
                            {Math.round(probVal * 100)}%
                          </td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-400">
                            ₹{Math.round(expRec).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 text-slate-400 text-[11px] truncate max-w-[200px]">
                            {c.root_cause || 'Gateway Timeout / Insufficient Funds'}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                              {c.current_status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDrawerCaseId(c.case_id);
                              }}
                              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded text-[11px] font-semibold border border-emerald-800 transition-all cursor-pointer"
                            >
                              Investigate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Slide-over Drawer */}
        {activeDrawerCaseId && (
          <RecoveryCaseDrawer
            caseId={activeDrawerCaseId}
            onClose={() => setActiveDrawerCaseId(null)}
            onActionSuccess={fetchLeakage}
          />
        )}

      </div>
    </PageContainer>
  );
}
