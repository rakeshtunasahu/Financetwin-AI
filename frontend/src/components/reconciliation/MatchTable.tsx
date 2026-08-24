import React, { useState } from 'react';
import { ReconciliationMatch } from '../../types';
import ConfidenceBadge from './ConfidenceBadge';
import DecisionBadge from './DecisionBadge';
import { Search, Filter } from 'lucide-react';

interface MatchTableProps {
  matches: ReconciliationMatch[];
  onSelectRow: (match: ReconciliationMatch) => void;
}

export default function MatchTable({ matches, onSelectRow }: MatchTableProps) {
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('ALL');

  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const filtered = matches.filter(m => {
    const settlementId = m.settlement_batch.settlement_id.toLowerCase();
    const utr = (m.settlement_batch.utr || '').toLowerCase();
    const query = search.toLowerCase();
    
    const matchesSearch = settlementId.includes(query) || utr.includes(query);
    const matchesFilter = decisionFilter === 'ALL' || m.decision === decisionFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Settlement ID or UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Decisions</option>
            <option value="MATCH">MATCH</option>
            <option value="ABSTAIN">ABSTAIN</option>
            <option value="EXCEPTION">EXCEPTION</option>
            <option value="NO_MATCH">NO MATCH</option>
          </select>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/60 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Settlement ID</th>
                <th className="py-3.5 px-4">UTR Reference</th>
                <th className="py-3.5 px-4">Expected Net</th>
                <th className="py-3.5 px-4">Bank Credit</th>
                <th className="py-3.5 px-4">Match Pass</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4 text-center">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-sm text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filtered.map((match) => (
                  <tr
                    key={match.id}
                    onClick={() => onSelectRow(match)}
                    className="hover:bg-zinc-900/50 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-4 px-4 font-semibold text-white">{match.settlement_batch.settlement_id}</td>
                    <td className="py-4 px-4 font-mono text-xs">{match.settlement_batch.utr || 'N/A'}</td>
                    <td className="py-4 px-4 font-mono">{formatter.format(match.settlement_batch.net_amount)}</td>
                    <td className="py-4 px-4 font-mono">
                      {match.bank_transaction
                        ? formatter.format(match.bank_transaction.credit_amount)
                        : '—'}
                    </td>
                    <td className="py-4 px-4">Pass {match.matching_pass}</td>
                    <td className="py-4 px-4">
                      <ConfidenceBadge confidence={match.confidence} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <DecisionBadge decision={match.decision} />
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
