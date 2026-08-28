import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MatchTable from '../components/reconciliation/MatchTable';
import MatchDetailDrawer from '../components/reconciliation/MatchDetailDrawer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ReconciliationMatch } from '../types';
import { ShieldCheck, GitCompare, Lock, Activity } from 'lucide-react';

export default function Reconciliation() {
  const { currentUser, isRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<ReconciliationMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<ReconciliationMatch | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ReconciliationMatch[]>('/api/reconciliation/matches');
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch matches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser]);

  return (
    <PageContainer title="Reconciliation Workspace" onRefresh={fetchMatches}>
      {/* Role Scope Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Reconciliation Workspace: {currentUser.role}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                {currentUser.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRole('RECOVERY_ADMIN')
                ? 'Full system-wide reconciliation workspace with multi-pass matching telemetry and audit trails.'
                : isRole('RECOVERY_MANAGER')
                ? 'Management filter active: Prioritizing high-value batches (₹50k+) and exceptions/abstains.'
                : 'Operational reconciliation scope with explainability JSON breakdown.'}
            </p>

          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>{matches.length} Records In Scope</span>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMatches} />
      ) : (
        <MatchTable matches={matches} onSelectRow={(row) => setSelectedMatch(row)} />
      )}

      <MatchDetailDrawer match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </PageContainer>
  );
}
