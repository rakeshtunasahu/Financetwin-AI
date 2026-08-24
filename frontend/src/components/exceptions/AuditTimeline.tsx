import React from 'react';
import { AuditLogEntry } from '../../types';
import { Clock, User, HardDrive, Shield } from 'lucide-react';

interface AuditTimelineProps {
  logs: AuditLogEntry[];
}

export default function AuditTimeline({ logs }: AuditTimelineProps) {
  const getIcon = (actor: string) => {
    if (actor.toLowerCase() === 'system' || actor.toLowerCase() === 'matching_engine') {
      return <HardDrive className="w-4 h-4 text-brand-500" />;
    }
    if (actor.toLowerCase() === 'ai_investigator') {
      return <Shield className="w-4 h-4 text-violet-400" />;
    }
    return <User className="w-4 h-4 text-zinc-400" />;
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
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
        <Clock className="w-5 h-5 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-300">Chronological Audit Trail</h3>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-zinc-650 text-center py-6">No audit records found for this exception.</p>
      ) : (
        <div className="relative pl-6 border-l border-zinc-800 space-y-6">
          {logs.map((log, index) => (
            <div key={index} className="relative space-y-1.5">
              <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                {getIcon(log.actor)}
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {log.action.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatDate(log.created_at)}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-sans">{log.reason}</p>
              
              <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 pt-0.5">
                <span>Actor: <strong className="text-zinc-400">{log.actor}</strong></span>
                <span>Decision: <strong className="text-zinc-400">{log.decision}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
