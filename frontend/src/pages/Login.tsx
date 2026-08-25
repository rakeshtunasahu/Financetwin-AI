import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@financetwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-base mx-auto shadow-md shadow-blue-950">
            FT
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 mt-3">FinanceTwin AI</h1>
          <p className="text-xs text-slate-400 font-mono">Risk-Aware Autonomous Settlement Reconciliation</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Security Key / Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 mt-2"
          >
            <span>Access Executive Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit Encrypted Safety Ledger
          </div>
        </div>
      </div>
    </div>
  );
}

