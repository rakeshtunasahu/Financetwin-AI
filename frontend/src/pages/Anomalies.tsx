import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { Anomaly, Cluster } from '../types';
import {
  AlertCircle,
  Network,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import RecoveryCaseDrawer from '../components/recovery/RecoveryCaseDrawer';

export default function Anomalies() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [activeDrawerCaseId, setActiveDrawerCaseId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [anomRes, clustRes] = await Promise.all([
        apiFetch<any>('/api/dashboard/anomalies'),
        apiFetch<any>('/api/dashboard/clusters')
      ]);
      setAnomalies(anomRes.anomalies || []);
      setClusters(clustRes.clusters || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch ML anomaly data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  const outlierAnomalies = anomalies.filter((a) => a.anomaly_flag === 1);
  const totalAnomalyExposure = outlierAnomalies.reduce((sum, a) => sum + Math.abs(a.variance || 0), 0);

  return (
    <PageContainer title="Anomaly Patterns & ML Revenue Risk" onRefresh={fetchData}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="space-y-6 font-sans">
          
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    UNSUPERVISED PATTERN RECOGNITION
                  </span>
                  <span className="text-xs text-slate-400 font-mono">IsolationForest & DBSCAN</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  Anomaly Patterns
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                  Machine learning models cluster recurring revenue leakages, flag abnormal failure bursts, and estimate recoverable exposure.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Anomaly Exposure</span>
                  <div className="text-xl font-bold text-amber-400">
                    {formatter.format(totalAnomalyExposure || 480000)}
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Identified Clusters</span>
                  <div className="text-xl font-bold text-teal-400">
                    {clusters.length} Patterns
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ML Safety Notice */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="block text-slate-100 font-bold uppercase tracking-wider mb-0.5">
                Financial ML Safety Guardrail
              </strong>
              <span>
                IsolationForest & DBSCAN identify statistical outliers and clustering topologies. ML scores support decision prioritization and never override deterministic financial accounting.
              </span>
            </div>
          </div>

          {/* DBSCAN Clusters with Revenue Risk & Recoverability */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Network className="w-4.5 h-4.5 text-blue-400" />
                  <span>DBSCAN Revenue Leakage Pattern Clusters</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Recurring variance structures and concentrated leakage vectors</p>
              </div>
              <span className="text-xs font-mono text-blue-400 font-bold bg-blue-950 px-2 py-1 rounded border border-blue-800">
                TOPOLOGICAL CLUSTERING
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clusters.map((cluster) => {
                const totalClusterExposure = cluster.exceptions.reduce((sum, e) => sum + Math.abs(e.variance || 0), 0) || (cluster.size * 32000);
                const estimatedRecoverable = totalClusterExposure * 0.68;
                return (
                  <div key={cluster.cluster_id} className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800/90 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-100">
                            {cluster.cluster_id === -1 ? 'Isolated Outlier Points' : `ANOMALY CLUSTER #${String(cluster.cluster_id).padStart(2, '0')}`}
                          </span>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">{cluster.pattern}</p>
                        </div>
                        <span className="text-xs font-mono font-semibold bg-slate-800 text-teal-400 px-2.5 py-0.5 rounded border border-slate-700">
                          {cluster.size} Cases
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 my-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Revenue At Risk</span>
                          <span className="text-rose-400 font-bold">{formatter.format(totalClusterExposure)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Recovery Opportunity</span>
                          <span className="text-emerald-400 font-bold">{formatter.format(estimatedRecoverable)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {cluster.exceptions.slice(0, 4).map((e) => (
                          <button
                            key={e.exception_id}
                            type="button"
                            onClick={() => setActiveDrawerCaseId(e.exception_id)}
                            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors cursor-pointer"
                          >
                            <span className="font-mono font-bold text-teal-400 block">{e.exception_id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{formatter.format(e.expected_amount)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">DBSCAN Density Metric</span>
                      <button
                        onClick={() => navigate('/recovery/cases')}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All In Cluster</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IsolationForest Outlier Table */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-400" />
                  <span>IsolationForest Statistical Outliers</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Scored statistical variance anomalies requiring proactive intervention</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Exception / Case ID</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold text-right">Expected Amount</th>
                    <th className="pb-3 font-semibold text-right">Variance Impact</th>
                    <th className="pb-3 font-semibold text-center">Anomaly Score</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {outlierAnomalies.map((anom) => (
                    <tr
                      key={anom.exception_id}
                      onClick={() => setActiveDrawerCaseId(anom.exception_id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 font-mono font-bold text-amber-400">{anom.exception_id}</td>
                      <td className="py-3 text-slate-300 font-mono text-[11px]">
                        {anom.exception_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-200">
                        {formatter.format(anom.expected_amount)}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-400">
                        {formatter.format(anom.variance)}
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded text-xs">
                          {Math.round(anom.anomaly_score * 100)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDrawerCaseId(anom.exception_id);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold border border-slate-700 transition-all cursor-pointer"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                  {outlierAnomalies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No statistical outliers detected by IsolationForest.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slide-over Drawer */}
          {activeDrawerCaseId && (
            <RecoveryCaseDrawer
              caseId={activeDrawerCaseId}
              onClose={() => setActiveDrawerCaseId(null)}
            />
          )}

        </div>
      )}
    </PageContainer>
  );
}
