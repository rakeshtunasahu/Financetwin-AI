import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { Anomaly, Cluster } from '../types';
import { AlertCircle, Network, ShieldCheck } from 'lucide-react';

export default function Anomalies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const anomRes = await apiFetch<any>('/api/dashboard/anomalies');
      const clustRes = await apiFetch<any>('/api/dashboard/clusters');
      setAnomalies(anomRes.anomalies || []);
      setClusters(clustRes.clusters || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ML data.');
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
    maximumFractionDigits: 2
  });

  return (
    <PageContainer title="ML Anomaly & Pattern Intelligence" onRefresh={fetchData}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="space-y-6 font-sans">
          {/* Conservativeness Notice */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="block text-slate-100 font-bold uppercase tracking-wider mb-0.5">Machine Learning Safety Policy</strong>
              <span>
                Unsupervised models (IsolationForest & DBSCAN) detect statistical outliers and group recurring variance patterns. Model outputs provide diagnostic risk intelligence and do not override deterministic financial matching.
              </span>
            </div>
          </div>

          {/* IsolationForest Anomalies */}
          <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">IsolationForest Outlier Detection</h3>
                <span className="text-[10px] text-slate-400 font-mono">Unsupervised variance anomaly scoring</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider bg-slate-950/60">
                    <th className="py-2.5 px-3">Exception ID</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Expected Net</th>
                    <th className="py-2.5 px-3 text-right">Variance</th>
                    <th className="py-2.5 px-3 text-right">Anomaly Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {anomalies.filter(a => a.anomaly_flag === 1).map((anom) => (
                    <tr key={anom.exception_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-slate-100">{anom.exception_id}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{anom.exception_type.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3 font-mono text-right text-slate-200">{formatter.format(anom.expected_amount)}</td>
                      <td className="py-3 px-3 font-mono text-right text-rose-400 font-medium">{formatter.format(anom.variance)}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-amber-400">
                        {Math.round(anom.anomaly_score * 100)}%
                      </td>
                    </tr>
                  ))}
                  {anomalies.filter(a => a.anomaly_flag === 1).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-mono text-xs">
                        No statistical outliers detected by IsolationForest.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DBSCAN Clusters */}
          <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Network className="w-4 h-4 text-blue-400" />
              <div>
                <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">DBSCAN Exception Pattern Clusters</h3>
                <span className="text-[10px] text-slate-400 font-mono">Clustered mappings of recurring settlement variances</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {clusters.map((cluster) => (
                <div key={cluster.cluster_id} className="p-4 bg-slate-950/60 rounded-lg border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-100">
                        {cluster.cluster_id === -1 ? 'Isolated Outlier Points' : `Cluster Pattern ${cluster.cluster_id}`}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{cluster.pattern}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                      Cluster Size: {cluster.size}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {cluster.exceptions.map(e => (
                      <div key={e.exception_id} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-xs flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-100 font-mono">{e.exception_id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{e.exception_type}</span>
                        <span className="text-[11px] font-mono text-slate-200 mt-0.5">{formatter.format(e.expected_amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {clusters.length === 0 && (
                <p className="text-xs text-slate-400 font-mono text-center py-6">No pattern clusters identified.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

