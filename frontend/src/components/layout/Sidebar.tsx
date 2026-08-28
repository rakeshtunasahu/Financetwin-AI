import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompare,
  ShieldAlert,
  Sliders,
  Activity,
  BookOpen,
  Calculator,
  LogOut,
  ShieldCheck,
  X,
  UserCheck,
  FileText,
  Zap,
  RotateCw,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    if (onClose) onClose();
    navigate('/');
  };

  // Role-specific navigation items configuration (Recovery-First)
  const getMenuItems = (role: UserRole) => {
    const recoveryItems = [
      { name: 'Recovery Command Center', path: '/recovery', icon: Zap },
      { name: 'Autonomous Batch Runner', path: '/recovery/batch', icon: RotateCw },
      { name: 'Recovery Cases Queue', path: '/recovery/cases', icon: FolderKanban },
    ];

    switch (role) {
      case 'FINANCE_ANALYST':
        return [
          { name: 'Home Landing Page', path: '/', icon: BookOpen },
          ...recoveryItems,
          { name: 'Reconciliation Queue', path: '/reconciliation', icon: GitCompare },
          { name: 'Exception Operations', path: '/exceptions', icon: ShieldAlert },
          { name: 'Operational Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Settlement Calculator', path: '/calculator', icon: Calculator }
        ];

      case 'FINANCE_MANAGER':
        return [
          { name: 'Home Landing Page', path: '/', icon: BookOpen },
          ...recoveryItems,
          { name: 'Management Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Approvals & Exceptions', path: '/exceptions', icon: ShieldAlert },
          { name: 'High-Value Reconciliations', path: '/reconciliation', icon: GitCompare },
          { name: 'Policy Simulation Lab', path: '/governance', icon: Sliders },
          { name: 'Approval Audit Trail', path: '/audit', icon: FileText },
          { name: 'Settlement Calculator', path: '/calculator', icon: Calculator }
        ];

      case 'RISK_COMPLIANCE_OFFICER':
        return [
          { name: 'Home Landing Page', path: '/', icon: BookOpen },
          ...recoveryItems,
          { name: 'Risk & Anomaly Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'High-Risk Exceptions', path: '/exceptions', icon: ShieldAlert },
          { name: 'ML Anomaly Clusters', path: '/anomalies', icon: Activity },
          { name: 'Governance Policy View', path: '/governance', icon: Sliders },
          { name: 'Forensic Audit Logs', path: '/audit', icon: FileText },
          { name: 'Settlement Calculator', path: '/calculator', icon: Calculator }
        ];

      case 'AUDITOR':
        return [
          { name: 'Home Landing Page', path: '/', icon: BookOpen },
          { name: 'Recovery Command Center', path: '/recovery', icon: Zap },
          { name: 'Recovery Cases Queue', path: '/recovery/cases', icon: FolderKanban },
          { name: 'Statutory Audit Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Reconciliation History', path: '/reconciliation', icon: GitCompare },
          { name: 'Historical Exceptions', path: '/exceptions', icon: ShieldAlert },
          { name: 'Immutable Audit Trail', path: '/audit', icon: FileText },
          { name: 'Governance Policy Audit', path: '/governance', icon: Sliders },
          { name: 'Settlement Calculator', path: '/calculator', icon: Calculator }
        ];

      case 'ADMIN':
      default:
        return [
          { name: 'Home Landing Page', path: '/', icon: BookOpen },
          ...recoveryItems,
          { name: 'Reconciliation Engine', path: '/reconciliation', icon: GitCompare },
          { name: 'Exceptions & Audits', path: '/exceptions', icon: ShieldAlert },
          { name: 'Anomaly Patterns', path: '/anomalies', icon: Activity },
          { name: 'Governance Lab', path: '/governance', icon: Sliders },
          { name: 'Audit Trail & Logs', path: '/audit', icon: FileText },
          { name: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Settlement Calculator', path: '/calculator', icon: Calculator }
        ];
    }
  };

  const menuItems = getMenuItems(currentUser.role);

  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { bg: 'bg-purple-950/80', border: 'border-purple-800', text: 'text-purple-400', badge: 'ADMIN' };
      case 'FINANCE_ANALYST':
        return { bg: 'bg-blue-950/80', border: 'border-blue-800', text: 'text-blue-400', badge: 'ANALYST' };
      case 'FINANCE_MANAGER':
        return { bg: 'bg-amber-950/80', border: 'border-amber-800', text: 'text-amber-400', badge: 'MANAGER' };
      case 'RISK_COMPLIANCE_OFFICER':
        return { bg: 'bg-rose-950/80', border: 'border-rose-800', text: 'text-rose-400', badge: 'RISK' };
      case 'AUDITOR':
        return { bg: 'bg-emerald-950/80', border: 'border-emerald-800', text: 'text-emerald-400', badge: 'AUDITOR' };
      default:
        return { bg: 'bg-slate-950', border: 'border-slate-800', text: 'text-slate-400', badge: 'USER' };
    }
  };

  const theme = getRoleTheme(currentUser.role);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-extrabold text-white text-xs tracking-wider shadow-md shadow-emerald-500/20">
              RR
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 leading-none tracking-tight">RevenueRescue AI</h1>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block mt-1 font-semibold">
                Autonomous Recovery Agent
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800/90 text-blue-400 border-l-2 border-blue-500 pl-2.5 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Bottom Safety, Active Persona & Sign Out Action */}
        <div className="p-4 border-t border-slate-800 space-y-2.5 bg-slate-900/60">
          <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-md ${theme.bg} ${theme.text} flex items-center justify-center font-bold text-xs border ${theme.border}`}>
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 block truncate">{currentUser.name}</span>
                  <span className={`text-[8px] font-mono px-1 py-0.2 rounded border font-bold uppercase ${theme.bg} ${theme.text} ${theme.border}`}>
                    {theme.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block truncate">{currentUser.email}</span>
              </div>
            </div>

            {/* Dedicated Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/40 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 border border-slate-800 rounded-md text-[11px] font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="px-2.5 py-2 bg-slate-950/50 rounded-lg border border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Safety Status</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-emerald-400 font-medium">PROTECTED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
