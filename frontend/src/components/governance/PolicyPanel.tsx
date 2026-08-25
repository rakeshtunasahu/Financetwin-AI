import React from 'react';
import { Policy } from '../../types';
import { ShieldCheck } from 'lucide-react';

interface PolicyPanelProps {
  policy: Policy | null;
}

export default function PolicyPanel({ policy }: PolicyPanelProps) {
  if (!policy) return null;

  const items = [
    { name: 'Min Match Confidence', val: `${Math.round(policy.minimum_match_confidence * 100)}%`, desc: 'Threshold for Pass 3/4 matches' },
    { name: 'Min Confidence Margin', val: `${(policy.minimum_confidence_margin * 100).toFixed(1)}%`, desc: 'Required margin above 2nd best candidate' },
    { name: 'Max Auto-Resolve Amount', val: `₹${policy.max_auto_resolve_amount.toLocaleString()}`, desc: 'Ceiling for risk automation resolve' },
    { name: 'High-Value Threshold', val: `₹${policy.high_value_transaction_threshold.toLocaleString()}`, desc: 'Amount flagging high-risk audit' },
    { name: 'Amount Match Tolerance', val: `₹${policy.amount_tolerance.toFixed(2)}`, desc: 'Acceptable decimal delta for amount matching' },
    { name: 'Date Window Tolerance', val: `${policy.date_tolerance_days} Days`, desc: 'Payout delay limit window' },
    { name: 'Tax Rate', val: `${Math.round(policy.tax_rate * 100)}%`, desc: 'Configured GST tax rate on gateway fees' }
  ];

  return (
    <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">CURRENT ACTIVE POLICY</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/80 font-bold uppercase">
          LIVE ENFORCEMENT
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <div key={idx} className="p-3.5 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">{item.name}</span>
              <span className="text-[10px] text-slate-400 block mt-1 leading-tight">{item.desc}</span>
            </div>
            <span className="text-base font-bold text-slate-100 font-mono mt-2 block">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

