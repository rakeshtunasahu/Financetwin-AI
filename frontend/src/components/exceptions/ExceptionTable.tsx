import React, { useState } from 'react';
import { ExceptionRecord } from '../../types';
import { Search, Filter, ChevronRight } from 'lucide-react';

interface ExceptionTableProps {
  exceptions: ExceptionRecord[];
  onSelectRow: (exc: ExceptionRecord) => void;
}

export default function ExceptionTable({ exceptions, onSelectRow }: ExceptionTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

  const filtered = exceptions.filter(e => {
    const sId = e.settlement_batch ? e.settlement_batch.settlement_id.toLowerCase() : '';
    const eId = e.exception_id.toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = sId.includes(query) || eId.includes(query);
    const matchesFilter = typeFilter === 'ALL' || e.exception_type === typeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'HIGH': return 'bg-orange-950/80 text-orange-300 border-orange-800/80';
      case 'MEDIUM': return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'LOW':
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
    }
  };

  const getUniqueTypes = () => {
    const s = new Set(exceptions.map(e => e.exception_type));
    return Array.from(s);
  };

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Exception or Settlement ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {getUniqueTypes().map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Container */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Exception ID</th>
                <th className="py-3 px-4">Settlement ID</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-right">Expected Net</th>
                <th className="py-3 px-4 text-right">Bank Credit</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No exceptions matched the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((exc) => (
                  <tr
                    key={exc.id}
                    onClick={() => onSelectRow(exc)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-100">
                      {exc.exception_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {exc.settlement_batch ? exc.settlement_batch.settlement_id : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {exc.exception_type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${getSeverityBadge(exc.severity)}`}>
                        {exc.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-right text-slate-100">
                      {formatter.format(exc.expected_amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                      {formatter.format(exc.actual_amount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-right text-rose-400">
                      {formatter.format(exc.variance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 uppercase border border-slate-700/60">
                        {exc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400 group-hover:text-blue-400 transition-colors">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

