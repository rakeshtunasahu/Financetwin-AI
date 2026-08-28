import React, { useState } from 'react';
import { Play, RotateCw, Activity, ShieldCheck, Menu, ChevronDown, User, Check, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  title: string;
  onRefresh?: () => void;
  onOpenMobileMenu?: () => void;
}

export default function Header({ title, onRefresh, onOpenMobileMenu }: HeaderProps) {
  const { currentUser, availableUsers, switchUser, hasPermission } = useAuth();
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const canRunRecon = hasPermission('can_run_reconciliation');

  const handleRunReconciliation = async () => {
    if (!canRunRecon) {
      setMessage(`Action Denied: Your role (${currentUser.role}) does not have reconciliation execution privileges.`);
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    setRunning(true);
    setMessage(null);
    try {
      const res = await apiFetch<any>('/api/reconciliation/run', {
        method: 'POST',
      });
      setMessage(`Reconciliation Complete! Matched: ${res.matched_count}, Abstained: ${res.abstained_count}, Exceptions: ${res.exception_count}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setMessage(`Reconciliation Failed: ${err.message}`);
    } finally {
      setRunning(false);
      setTimeout(() => setMessage(null), 7000);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'RECOVERY_ADMIN':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'RECOVERY_MANAGER':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'RECOVERY_OPERATOR':
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
    }
  };


  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0 relative">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
          {title}
        </h2>
        
        {message && (
          <div className="hidden md:flex bg-slate-950 border border-blue-500/40 text-xs px-3 py-1.5 rounded-md text-blue-400 font-medium items-center gap-2 shadow-lg">
            <Activity className="w-3.5 h-3.5 animate-pulse text-blue-400" />
            <span className="truncate">{message}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Interactive Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs transition-all shadow-sm group"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-300">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-semibold text-slate-200 block leading-tight text-[11px]">
                {currentUser.name}
              </span>
              <span className={`text-[9px] font-mono px-1 py-0.2 rounded border font-bold uppercase ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role.replace(/_/g, ' ')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Switch Demo Persona
                </span>
                <span className="text-xs text-slate-300 font-semibold mt-0.5 block">
                  Experience Role-Based Perspectives
                </span>
              </div>
              <div className="py-1 space-y-1">
                {availableUsers.map((u) => {
                  const isSelected = u.email === currentUser.email;
                  return (
                    <button
                      key={u.email}
                      onClick={() => {
                        switchUser(u.email);
                        setShowRoleMenu(false);
                        if (onRefresh) onRefresh();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 truncate">{u.name}</span>
                          <span className={`text-[9px] font-mono px-1 py-0.2 rounded border font-bold ${getRoleBadgeColor(u.role)}`}>
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block truncate mt-0.5">
                          {u.email}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Safety Gate Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-md text-xs font-medium text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px]">FMR Safety: <strong className="text-slate-100 font-semibold">Active</strong></span>
        </div>

        {/* Refresh Action if provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="hidden sm:flex items-center justify-center p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs transition-all"
            title="Refresh Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        )}

        {/* Run Reconciliation Action Button */}
        <button
          onClick={handleRunReconciliation}
          disabled={running || !canRunRecon}
          title={canRunRecon ? "Execute Reconciliation Engine" : `Run Disabled for ${currentUser.role} (Admin/Analyst Only)`}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${
            canRunRecon
              ? 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          } disabled:opacity-50`}
        >
          {running ? (
            <RotateCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{running ? 'Processing...' : 'Run Reconciliation'}</span>
        </button>
      </div>
    </header>
  );
}
