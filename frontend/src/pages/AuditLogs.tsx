import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Activity,
  User,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Sliders,
  Play,
  Bot,
  Lock,
  X
} from 'lucide-react';

interface AuditLogItem {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor: string;
  decision: string;
  reason: string;
  created_at: string;
  metadata: Record<string, any>;
}

export default function AuditLogs() {
  const { currentUser, isRole } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ role: string; count: number; logs: AuditLogItem[] }>('/api/audit/logs');
      setLogs(res.logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [currentUser]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_id.toLowerCase().includes(search.toLowerCase()) ||
      log.reason.toLowerCase().includes(search.toLowerCase()) ||
      log.decision.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'POLICY_APPLIED':
        return <Sliders className="w-4 h-4 text-purple-400" />;
      case 'POLICY_SIMULATED':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'RECONCILIATION_TRIGGERED':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'EXCEPTION_INVESTIGATED':
        return <Bot className="w-4 h-4 text-amber-400" />;
      case 'ACCESS_DENIED':
        return <Lock className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getDecisionBadge = (decision: string) => {
    if (decision === 'COMPLETED' || decision === 'APPLY' || decision === 'AUTO_RESOLVE') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
          {decision}
        </span>
      );
    }
    if (decision === 'DENIED' || decision === 'REJECTED') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
          {decision}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
        {decision}
      </span>
    );
  };

  return (
    <PageContainer title="Enterprise Audit Logs & Traceability Engine" onRefresh={fetchAuditLogs}>
      {/* Role Notice Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Audit Trail Scope: {currentUser.role}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                {currentUser.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRole('AUDITOR')
                ? 'Immutable statutory verification log. Sensitive customer IDs and UTRs are automatically masked.'
                : isRole('ADMIN')
                ? 'Full system-wide immutable audit ledger across all operations, policies, and authorization checks.'
                : 'Role-scoped operational audit trail for authorized reconciliation actions.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 self-start sm:self-auto">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{filteredLogs.length} Events Recorded</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, entity ID, or reason..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Action:
          </span>
          {['ALL', 'RECONCILIATION_TRIGGERED', 'POLICY_APPLIED', 'POLICY_SIMULATED', 'EXCEPTION_INVESTIGATED', 'ACCESS_DENIED'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors shrink-0 ${
                actionFilter === act
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {act === 'ALL' ? 'All' : act.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAuditLogs} />
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">No audit events match your filter</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the action filter or query.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Entity / Target</th>
                  <th className="p-3.5">Decision</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[150px]">{log.actor}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-blue-400 truncate max-w-[160px]">
                      {log.entity_id}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getDecisionBadge(log.decision)}
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs truncate max-w-[240px]">
                      {log.reason}
                    </td>
                    <td className="p-3.5 text-right font-mono text-blue-400 hover:text-blue-300 font-semibold">
                      Inspect
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Slide-In Window Drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedLog(null)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in transition-opacity cursor-pointer"
            aria-hidden="true"
          />

          {/* Slide-In Drawer */}
          <div className="relative w-full sm:w-[500px] lg:w-[540px] h-full bg-slate-900 border-l border-slate-800 shadow-2xl shadow-slate-950 flex flex-col z-10 animate-slide-in-right overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950/60 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-950/80 border border-blue-800/80 rounded-xl text-blue-400">
                  {getActionIcon(selectedLog.action)}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Statutory Audit Telemetry Log
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-mono mt-0.5">{selectedLog.action}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Actor</span>
                  <span className="text-slate-200 font-mono font-bold block mt-1">{selectedLog.actor}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Decision</span>
                  <span className="mt-1 inline-block">{getDecisionBadge(selectedLog.decision)}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Entity Target</span>
                  <span className="text-blue-400 font-mono font-bold block mt-1">{selectedLog.entity_id}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Timestamp</span>
                  <span className="text-slate-300 font-mono block mt-1 text-[11px]">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Reason & Audit Context</span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{selectedLog.reason}</p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Immutable Audit Metadata</span>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-3 bg-slate-900/80 rounded-xl border border-slate-800 max-h-60">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">
                Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">Esc</kbd> to close
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
