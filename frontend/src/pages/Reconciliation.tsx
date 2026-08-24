import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import MatchTable from '../components/reconciliation/MatchTable';
import MatchDetailDrawer from '../components/reconciliation/MatchDetailDrawer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { ReconciliationMatch } from '../types';

export default function Reconciliation() {
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
  }, []);

  return (
    <PageContainer title="Reconciliation Workspace" onRefresh={fetchMatches}>
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
