import React from 'react';
import { AuditLogEntry } from '../../types';
import { Clock, User, HardDrive, Shield } from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLogEntry[];
}

export default function AuditTimeline({ logs }: AuditTimelineProps) {
  const getIcon = (actor: string) => {
    if (actor.toLowerCase() === 'system' || actor.toLowerCase() === 'matching_engine') {
      return <HardDrive className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (actor.toLowerCase() === 'ai_investigator') {
      return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
    }
    return <User className="w-3.5 h-3.5 text-slate-400" />;
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Clock className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Chronological Audit Trail</h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-slate-400 font-mono text-center py-6">No audit records found for this exception.</p>
      ) : (
        <div className="relative pl-6 border-l border-slate-800 space-y-5 my-2">
          {logs.map((log, index) => (
            <div key={index} className="relative space-y-1">
              <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center">
                {getIcon(log.actor)}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span className="text-xs font-semibold font-mono text-slate-100 uppercase tracking-wider">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDate(log.created_at)}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{log.reason}</p>
              
              <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-mono pt-1">
                <span>Actor: <strong className="text-slate-200">{log.actor}</strong></span>
                <span>Decision: <strong className="text-slate-200">{log.decision}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

