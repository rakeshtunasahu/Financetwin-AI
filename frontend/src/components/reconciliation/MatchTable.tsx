import React, { useState } from 'react';
import { ReconciliationMatch } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';
import DecisionBadge from './DecisionBadge';
import { Search, Filter, ChevronRight } from 'lucide-react';

interface MatchTableProps {
  matches: ReconciliationMatch[];
  onSelectRow: (match: ReconciliationMatch) => void;
}

export default function MatchTable({ matches, onSelectRow }: MatchTableProps) {
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });

  const filtered = matches.filter(m => {
    const settlementId = (m.settlement_batch?.settlement_id || '').toLowerCase();
    const utr = (m.settlement_batch?.utr || '').toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = settlementId.includes(query) || utr.includes(query);
    const matchesFilter = decisionFilter === 'ALL' || m.decision === decisionFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Settlement ID or UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Decisions</option>
            <option value="MATCH">MATCH</option>
            <option value="ABSTAIN">ABSTAIN</option>
            <option value="EXCEPTION">EXCEPTION</option>
            <option value="NO_MATCH">NO MATCH</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Settlement ID</th>
                <th className="py-3 px-4">UTR Reference</th>
                <th className="py-3 px-4 text-right">Expected Net</th>
                <th className="py-3 px-4 text-right">Bank Credit</th>
                <th className="py-3 px-4 text-center">Pass</th>
                <th className="py-3 px-4 text-center">Confidence</th>
                <th className="py-3 px-4 text-center">Decision</th>
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-mono text-xs">
                    No matching reconciliation records found.
                  </td>
                </tr>
              ) : (
                filtered.map((match) => (
                  <tr
                    key={match.id}
                    onClick={() => onSelectRow(match)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-100">
                      {match.settlement_batch?.settlement_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {match.settlement_batch?.utr || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-right text-slate-100">
                      {formatter.format(match.settlement_batch?.net_amount || 0)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                      {match.bank_transaction
                        ? formatter.format(match.bank_transaction.credit_amount)
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      Pass {match.matching_pass}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <ConfidenceBadge confidence={match.confidence} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <DecisionBadge decision={match.decision} />
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

