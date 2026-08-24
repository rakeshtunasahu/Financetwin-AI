import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@financetwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 flex flex-col justify-center items-center p-6 text-zinc-100">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 border-zinc-800 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white text-xl mx-auto shadow-lg shadow-brand-500/20">
            FT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-4">FinanceTwin AI</h1>
          <p className="text-xs text-zinc-400">Risk-Aware Autonomous Settlement Reconciliation Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 mt-6">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold uppercase">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-semibold uppercase">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            Access Executive Console
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-800 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 font-semibold uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            256-bit Encrypted Ledger Gateways
          </div>
        </div>
      </div>
    </div>
  );
}
