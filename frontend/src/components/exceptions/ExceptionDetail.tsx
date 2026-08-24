import React from 'react';
import { ExceptionDetail as DetailType } from '../../types';

interface ExceptionDetailProps {
  detail: DetailType;
}

export default function ExceptionDetail({ detail }: ExceptionDetailProps) {
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

  const getSeverityStyle = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'LOW':
      default:
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Incident Case</span>
          <h3 className="text-xl font-bold text-white mt-1">{detail.exception_id}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityStyle(detail.severity)}`}>
            {detail.severity} Severity
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 uppercase">
            {detail.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-zinc-800 py-6">
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Exception Type</span>
          <p className="text-sm font-semibold text-white mt-1">{detail.exception_type.replace(/_/g, ' ')}</p>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Expected Net</span>
          <p className="text-sm font-bold text-white font-mono mt-1">{formatter.format(detail.expected_amount)}</p>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Bank Credit</span>
          <p className="text-sm font-bold text-white font-mono mt-1">{formatter.format(detail.actual_amount)}</p>
        </div>
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Variance Deviation</span>
          <p className="text-sm font-bold text-red-400 font-mono mt-1">{formatter.format(detail.variance)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-zinc-950/40 rounded-lg border border-zinc-800">
        <div>
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Automation Action Gate</span>
          <h4 className="text-sm font-bold text-white mt-1">{detail.risk_decision.recommended_action.replace(/_/g, ' ')}</h4>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Risk Engine Score</span>
          <p className="text-sm font-bold text-amber-500 font-mono mt-1">{Math.round(detail.risk_decision.score * 100)}% Risk</p>
        </div>
      </div>
    </div>
  );
}
