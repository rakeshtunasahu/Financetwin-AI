import React from 'react';
import { ExceptionDetail as DetailType } from '../../types';
import { Landmark, FileSpreadsheet } from 'lucide-react';

interface EvidencePanelProps {
  detail: DetailType;
}

export default function EvidencePanel({ detail }: EvidencePanelProps) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });
  const s = detail.settlement_batch;
  const b = detail.bank_transaction;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Settlement Batch Evidence */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <FileSpreadsheet className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Gateway Settlement Evidence</h3>
        </div>
        
        {s ? (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Settlement ID</span>
              <span className="text-slate-100 font-mono font-medium">{s.settlement_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Merchant ID</span>
              <span className="text-slate-200 font-mono">{s.merchant_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Gross Payout</span>
              <span className="text-slate-200 font-mono">{formatter.format(s.gross_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Expected Net Payout</span>
              <span className="text-slate-100 font-mono font-semibold">{formatter.format(s.net_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Expected Credit Date</span>
              <span className="text-slate-200 font-mono">{s.expected_credit_date}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Expected UTR Ref</span>
              <span className="text-slate-200 font-mono">{s.utr || 'None'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono">No settlement batch record associated with this exception.</p>
        )}
      </div>

      {/* Bank Statement Evidence */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Landmark className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Bank Statement Entry</h3>
        </div>

        {b ? (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Bank TXN ID</span>
              <span className="text-slate-100 font-mono font-medium">{b.bank_transaction_id}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Bank Narration</span>
              <span className="text-slate-200 font-mono text-[11px] truncate max-w-[200px]" title={b.description}>{b.description}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Amount Received</span>
              <span className="text-slate-100 font-mono font-semibold">{formatter.format(b.credit_amount)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Transaction Date</span>
              <span className="text-slate-200 font-mono">{b.transaction_date}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Statement Reference</span>
              <span className="text-slate-200 font-mono">{b.reference || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Creditor Source</span>
              <span className="text-slate-200 font-semibold">{b.source}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-mono">No bank transaction credit record matched for this exception.</p>
        )}
      </div>
    </div>
  );
}

