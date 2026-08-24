import React, { useState } from 'react';
import { ExceptionRecord } from '../../types';
import DecisionBadge from '../reconciliation/DecisionBadge';
import { Search, Filter } from 'lucide-react';

interface ExceptionTableProps {
  exceptions: ExceptionRecord[];
  onSelectRow: (exc: ExceptionRecord) => void;
}

export default function ExceptionTable({ exceptions, onSelectRow }: ExceptionTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const filtered = exceptions.filter(e => {
    const sId = e.settlement_batch ? e.settlement_batch.settlement_id.toLowerCase() : '';
    const eId = e.exception_id.toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = sId.includes(query) || eId.includes(query);
    const matchesFilter = typeFilter === 'ALL' || e.exception_type === typeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'LOW':
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getUniqueTypes = () => {
    const s = new Set(exceptions.map(e => e.exception_type));
    return Array.from(s);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Exception or Settlement ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {getUniqueTypes().map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/60 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Exception ID</th>
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Expected Net</th>
                <th className="py-3.5 px-4">Bank Credit</th>
                <th className="py-3.5 px-4">Variance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-sm text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs">
                    No exceptions matched the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((exc) => (
                  <tr
                    key={exc.id}
                    onClick={() => onSelectRow(exc)}
                    className="hover:bg-zinc-900/50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-4 px-4 font-semibold text-white">{exc.exception_id}</td>
                    <td className="py-4 px-4 font-medium text-zinc-300">
                      {exc.settlement_batch ? exc.settlement_batch.settlement_id : 'N/A'}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">{exc.exception_type.replace(/_/g, ' ')}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(exc.severity)}`}>
                        {exc.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono">{formatter.format(exc.expected_amount)}</td>
                    <td className="py-4 px-4 font-mono">{formatter.format(exc.actual_amount)}</td>
                    <td className="py-4 px-4 font-mono text-red-400">{formatter.format(exc.variance)}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 uppercase">
                        {exc.status.replace(/_/g, ' ')}
                      </span>
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
