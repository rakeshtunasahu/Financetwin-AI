import React from 'react';
import { ExceptionDetail as DetailType } from '../../types';

interface ExceptionDetailProps {
  detail: DetailType;
}

export default function ExceptionDetail({ detail }: ExceptionDetailProps) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
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

  return (
    <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
            Incident Case File
          </span>
          <h3 className="text-xl font-bold font-mono text-slate-100 mt-0.5">{detail.exception_id}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase border ${getSeverityBadge(detail.severity)}`}>
            {detail.severity} Severity
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-slate-800 text-slate-300 uppercase border border-slate-700/60">
            {detail.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Exception Type</span>
          <p className="text-xs font-mono font-semibold text-slate-200 mt-1">{detail.exception_type.replace(/_/g, ' ')}</p>
        </div>
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Expected Net</span>
          <p className="text-sm font-bold text-slate-100 font-mono mt-1">{formatter.format(detail.expected_amount)}</p>
        </div>
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Bank Credit Recorded</span>
          <p className="text-sm font-bold text-slate-100 font-mono mt-1">{formatter.format(detail.actual_amount)}</p>
        </div>
        <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Variance Deviation</span>
          <p className="text-sm font-bold text-rose-400 font-mono mt-1">{formatter.format(detail.variance)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Automation Safety Gate</span>
          <h4 className="text-sm font-bold text-slate-100 font-mono mt-0.5">{detail.risk_decision.recommended_action.replace(/_/g, ' ')}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Risk Engine Score</span>
          <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{Math.round(detail.risk_decision.score * 100)}% Risk</p>
        </div>
      </div>
    </div>
  );
}

