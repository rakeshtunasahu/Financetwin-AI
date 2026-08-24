import React from 'react';
import { ExceptionDetail as DetailType } from '../../types';
import { Landmark, FileSpreadsheet } from 'lucide-react';

interface EvidencePanelProps {
  detail: DetailType;
}

export default function EvidencePanel({ detail }: EvidencePanelProps) {
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
  const s = detail.settlement_batch;
  const b = detail.bank_transaction;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <FileSpreadsheet className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-zinc-300">Gateway Settlement Evidence</h3>
        </div>
        
        {s ? (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Settlement ID</span>
              <span className="text-zinc-200 font-semibold">{s.settlement_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Merchant Account</span>
              <span className="text-zinc-200 font-mono">{s.merchant_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Gross Payout</span>
              <span className="text-zinc-200 font-mono">{formatter.format(s.gross_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Expected Net Payout</span>
              <span className="text-zinc-200 font-mono font-semibold">{formatter.format(s.net_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Expected Credit Date</span>
              <span className="text-zinc-200 font-mono">{s.expected_credit_date}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Expected UTR Reference</span>
              <span className="text-zinc-200 font-mono">{s.utr || 'None'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No settlement batch associated with this exception.</p>
        )}
      </div>

      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Landmark className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-zinc-300">Bank Statement Entry</h3>
        </div>

        {b ? (
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Bank TXN ID</span>
              <span className="text-zinc-200 font-semibold">{b.bank_transaction_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Bank Narration</span>
              <span className="text-zinc-200">{b.description}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Amount Received</span>
              <span className="text-zinc-200 font-mono font-semibold">{formatter.format(b.credit_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Transaction Date</span>
              <span className="text-zinc-200 font-mono">{b.transaction_date}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-zinc-850">
              <span className="text-zinc-500">Statement Reference</span>
              <span className="text-zinc-200 font-mono">{b.reference || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-zinc-500">Creditor Source</span>
              <span className="text-zinc-200 font-semibold">{b.source}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No bank transaction credit record matched for this exception.</p>
        )}
      </div>
    </div>
  );
}
