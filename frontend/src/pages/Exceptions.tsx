import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import ExceptionTable from '../components/exceptions/ExceptionTable';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { ExceptionRecord } from '../types';

export default function Exceptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exceptions, setExceptions] = useState<ExceptionRecord[]>([]);
  const navigate = useNavigate();

  const fetchExceptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ExceptionRecord[]>('/api/exceptions');
      setExceptions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch exceptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, []);

  return (
    <PageContainer title="Exceptions Command Center" onRefresh={fetchExceptions}>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchExceptions} />
      ) : (
        <ExceptionTable
          exceptions={exceptions}
          onSelectRow={(exc) => navigate(`/exceptions/${exc.exception_id}`)}
        />
      )}
    </PageContainer>
  );
}
