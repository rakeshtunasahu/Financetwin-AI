import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GitCompare,
  ShieldAlert,
  Sliders,
  Activity,
  BookOpen,
  Calculator,
  LogIn,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Reconciliation', path: '/reconciliation', icon: GitCompare },
    { name: 'Exceptions', path: '/exceptions', icon: ShieldAlert },
    { name: 'Anomaly Patterns', path: '/anomalies', icon: Activity },
    { name: 'Governance Lab', path: '/governance', icon: Sliders },
    { name: 'Settlement Calculator', path: '/calculator', icon: Calculator },
    { name: 'System Info', path: '/about', icon: BookOpen },
    { name: 'Portal Login', path: '/login', icon: LogIn }
  ];

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen shrink-0">
      <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-sm tracking-wider">
          FT
        </div>
        <div>
          <h1 className="font-bold text-base text-white leading-none">FinanceTwin AI</h1>
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mt-0.5">
            Safety Engine
          </span>
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/10 text-brand-500 border-l-4 border-brand-500 pl-2'
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-zinc-800 space-y-3">
        <div className="flex items-center gap-3 p-2 bg-zinc-950/60 rounded-lg border border-zinc-850">
          <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block truncate">Lead Auditor</span>
            <span className="text-[9px] text-zinc-500 block truncate">admin@financetwin.ai</span>
          </div>
        </div>

        <div className="p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center justify-between">
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">Safety Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
}
