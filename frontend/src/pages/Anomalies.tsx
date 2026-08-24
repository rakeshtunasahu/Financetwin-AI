import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { Anomaly, Cluster } from '../types';
import { AlertCircle, Network, Info } from 'lucide-react';

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

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <PageContainer title="ML Anomaly & Pattern Intelligence" onRefresh={fetchData}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : (
        <div className="space-y-6">
          {/* IsolationForest Anomalies */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">IsolationForest Anomalies</h3>
                <span className="text-[10px] text-zinc-500">Unsupervised outlier scores flagging out-of-bounds variances</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    <th className="pb-3 px-2">Exception ID</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Expected Amount</th>
                    <th className="pb-3 px-2">Variance</th>
                    <th className="pb-3 px-2 text-right">Anomaly Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30 text-zinc-300">
                  {anomalies.filter(a => a.anomaly_flag === 1).map((anom) => (
                    <tr key={anom.exception_id} className="hover:bg-zinc-900/10">
                      <td className="py-2.5 px-2 font-semibold text-white">{anom.exception_id}</td>
                      <td className="py-2.5 px-2 font-mono text-xs">{anom.exception_type.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-2 font-mono">{formatter.format(anom.expected_amount)}</td>
                      <td className="py-2.5 px-2 font-mono text-red-400">{formatter.format(anom.variance)}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-semibold text-orange-400">
                        {Math.round(anom.anomaly_score * 100)}%
                      </td>
                    </tr>
                  ))}
                  {anomalies.filter(a => a.anomaly_flag === 1).length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500 text-xs">
                        No critical outliers detected by IsolationForest.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DBSCAN Clusters */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Network className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-zinc-300">DBSCAN Exception Clusters</h3>
                <span className="text-[10px] text-zinc-500">Clusters mapping recurring ledger errors and isolated noise points</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {clusters.map((cluster) => (
                <div key={cluster.cluster_id} className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-850">
                    <div>
                      <span className="text-xs font-semibold text-white">
                        {cluster.cluster_id === -1 ? 'Isolated Outliers' : `Cluster ${cluster.cluster_id}`}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{cluster.pattern}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
                      Size: {cluster.size}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cluster.exceptions.map(e => (
                      <div key={e.exception_id} className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-850 rounded text-xs flex flex-col">
                        <span className="font-semibold text-white font-mono">{e.exception_id}</span>
                        <span className="text-[9px] text-zinc-500 mt-0.5">{e.exception_type}</span>
                        <span className="text-[10px] font-mono text-zinc-400 mt-1">{formatter.format(e.expected_amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {clusters.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">No clusters identified.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
