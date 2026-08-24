import React from 'react';
import { Policy } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface PolicyPanelProps {
  policy: Policy | null;
}

export default function PolicyPanel({ policy }: PolicyPanelProps) {
  if (!policy) return null;

  const items = [
    { name: 'Min Match Confidence', val: `${Math.round(policy.minimum_match_confidence * 100)}%`, desc: 'Threshold for Pass 3/4 fuzzy matches' },
    { name: 'Min Confidence Margin', val: `${Math.round(policy.minimum_confidence_margin * 100)}%`, desc: 'Required margin above runner-up match' },
    { name: 'Max Auto-Resolve Amount', val: `₹${policy.max_auto_resolve_amount.toLocaleString()}`, desc: 'Ceiling for risk automation resolve' },
    { name: 'High-Value Threshold', val: `₹${policy.high_value_transaction_threshold.toLocaleString()}`, desc: 'Amount flags transaction as high-risk' },
    { name: 'Amount Match Tolerance', val: `₹${policy.amount_tolerance.toFixed(2)}`, desc: 'Acceptable decimal delta for amount matching' },
    { name: 'Date Window Tolerance', val: `${policy.date_tolerance_days} Days`, desc: 'Payout delay limit window' },
    { name: 'Tax Rate', val: `${Math.round(policy.tax_rate * 100)}%`, desc: 'Configured GST tax rate on gateway fees' }
  ];

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-semibold text-zinc-300">Active Governance Safety Policy</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 bg-zinc-950/40 rounded-lg border border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block">{item.name}</span>
              <span className="text-[10px] text-zinc-500 font-sans block mt-1 leading-snug">{item.desc}</span>
            </div>
            <span className="text-lg font-bold text-white font-mono mt-3 block">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
