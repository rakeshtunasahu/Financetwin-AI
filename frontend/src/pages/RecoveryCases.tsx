import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Filter,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  Zap,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import { RecoveryCase } from '../types';
import { useAuth } from '../context/AuthContext';
import PageContainer from '../components/layout/PageContainer';

export default function RecoveryCases() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [highValueOnly, setHighValueOnly] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recoveryApi.getCases({
        recovery_type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        severity: severityFilter !== 'ALL' ? severityFilter : undefined,
        is_high_value: highValueOnly ? true : undefined,
        limit: 200
      });
      setCases(data);
    } catch (err: any) {
      console.error('Failed to load recovery cases:', err);
      setError(err.message || 'Failed to load recovery cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [typeFilter, statusFilter, severityFilter, highValueOnly]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECOVERED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'ACTION_EXECUTED':
      case 'WAITING_FOR_OUTCOME':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
      case 'RETRY':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'ESCALATED':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      case 'STOPPED':
      case 'UNRECOVERABLE':
      case 'EXPIRED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'HIGH':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'MEDIUM':
        return 'text-blue-400 bg-blue-950/60 border-blue-800';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const filteredCases = cases.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(term) ||
      (c.customer_name && c.customer_name.toLowerCase().includes(term)) ||
      (c.customer_id && c.customer_id.toLowerCase().includes(term)) ||
      (c.root_cause && c.root_cause.toLowerCase().includes(term)) ||
      (c.source_transaction_id && c.source_transaction_id.toLowerCase().includes(term))
    );
  });

  return (
    <PageContainer title="Autonomous Recovery Cases" onRefresh={fetchCases}>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-emerald-400" />
            Autonomous Recovery Cases
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, inspect, and manually intervene in revenue recovery pipelines and state machines
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCases}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {hasPermission('can_run_recovery_batch') && (
            <Link
              to="/recovery/batch"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition-all"
            >
              <RotateCw className="w-4 h-4" />
              <span>Batch Runner</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Case ID, Customer, Root Cause..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Scenarios</option>
              <option value="PAYMENT_FAILURE">Payment Failure</option>
              <option value="CHECKOUT_ABANDONMENT">Checkout Drop-off</option>
              <option value="OVERDUE_RECEIVABLE">Overdue Invoice (B2B)</option>
              <option value="MANDATE_FAILURE">Mandate Failure</option>
              <option value="SETTLEMENT_SHORTFALL">Settlement Shortfall</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="DETECTED">Detected</option>
              <option value="DIAGNOSED">Diagnosed</option>
              <option value="ACTION_EXECUTED">Action Executed</option>
              <option value="RECOVERED">Recovered</option>
              <option value="RETRY">Retry</option>
              <option value="ESCALATED">Escalated</option>
              <option value="STOPPED">Stopped</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highValueOnly}
              onChange={(e) => setHighValueOnly(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="font-mono text-[11px]">Show High-Value Only (≥ ₹50,000)</span>
          </label>

          <span className="text-slate-400 font-mono text-[11px]">
            Showing <strong className="text-slate-200">{filteredCases.length}</strong> cases
          </span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={fetchCases} className="text-xs font-semibold text-rose-200 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
            <span>Fetching recovery cases...</span>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-300">No recovery cases found</div>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or run a batch.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-4 font-semibold">Case ID</th>
                  <th className="p-4 font-semibold">Customer / Entity</th>
                  <th className="p-4 font-semibold">Scenario Type</th>
                  <th className="p-4 font-semibold text-right">At Risk</th>
                  <th className="p-4 font-semibold text-right">Recovered</th>
                  <th className="p-4 font-semibold text-center">Score / Prob</th>
                  <th className="p-4 font-semibold text-center">Severity</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCases.map((c) => (
                  <tr key={c.case_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-200">
                      <Link to={`/recovery/cases/${c.case_id}`} className="hover:text-emerald-400">
                        {c.case_id}
                      </Link>
                      {c.is_high_value && (
                        <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-400 border border-amber-800 font-sans">
                          HIGH
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200 truncate max-w-[170px]">
                        {c.customer_name || c.customer_id || 'Enterprise Customer'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">
                        {c.customer_email || c.source_transaction_id || ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[11px] text-slate-300">
                        {c.recovery_type.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {c.root_cause?.replace(/_/g, ' ') || 'Pending Diagnosis'}
                      </div>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-200">
                      ₹{Number(c.amount_at_risk).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-400">
                      ₹{Number(c.amount_recovered).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-mono text-slate-200 text-xs font-bold">
                        {Math.round(Number(c.priority_score))}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {Math.round(Number(c.recovery_probability) * 100)}% prob
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${getSeverityBadge(c.severity)}`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold uppercase ${getStatusBadge(c.current_status)}`}>
                        {c.current_status}
                      </span>
                      {c.retry_count > 0 && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Retry: {c.retry_count}/{c.max_retries_allowed}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/recovery/cases/${c.case_id}`)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </PageContainer>
  );
}
