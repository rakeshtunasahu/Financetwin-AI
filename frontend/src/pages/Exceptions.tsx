import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import ExceptionTable from '../components/exceptions/ExceptionTable';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ExceptionRecord } from '../types';
import { ShieldAlert, Activity, Lock } from 'lucide-react';

export default function Exceptions() {
  const { currentUser, isRole } = useAuth();
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
  }, [currentUser]);

  return (
    <PageContainer title="Exceptions Command Center" onRefresh={fetchExceptions}>
      {/* Role Scope Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Exceptions Command: {currentUser.role}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700">
                {currentUser.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRole('RECOVERY_ADMIN')
                ? 'System-wide exception investigations across all recovery and reconciliation streams.'
                : isRole('RECOVERY_MANAGER')
                ? 'Manager review queue: High-value exposure anomalies and manual review escalations.'
                : 'Operational exception investigations and AI-assisted root-cause diagnosis.'}
            </p>

          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{exceptions.length} Exceptions In Scope</span>
        </div>
      </div>

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
