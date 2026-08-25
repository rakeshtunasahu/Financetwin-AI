import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Activity, GitCompare, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@financetwin.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid enterprise email address.');
      return;
    }
    if (!password) {
      setError('Please enter your security password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex font-sans overflow-hidden text-slate-100">
      {/* LEFT — Enterprise Branding & Features Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800 p-12 xl:p-16 flex-col justify-between overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm tracking-wider shadow-lg shadow-blue-500/20">
            FT
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 leading-none tracking-tight">FinanceTwin AI</h1>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mt-1">
              Risk & Safety Engine
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div className="space-y-3">
            <span className="text-[11px] font-mono font-semibold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-800/80 uppercase tracking-wider">
              Autonomous Settlement Engine
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Smart Matching,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Zero-False-Match Safety
              </span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Take complete operational control of payment gateway settlements with real-time multi-pass reconciliation, auto-abstaining risk policies, and grounded AI audit investigations.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4 pt-2">
            {[
              {
                icon: ShieldCheck,
                title: 'Conservative Auto-Abstain Engine',
                desc: 'Aborts automatic match if confidence < 95% or margin < 5%'
              },
              {
                icon: GitCompare,
                title: 'Multi-Pass Settlement Matching',
                desc: 'Deterministic UTR reference, gross amount & date window algorithms'
              },
              {
                icon: Activity,
                title: 'ML Anomaly & Pattern Intelligence',
                desc: 'IsolationForest outlier scoring and DBSCAN variance clustering'
              },
              {
                icon: ShieldAlert,
                title: 'Grounded AI Root-Cause Audits',
                desc: 'Fact-checked AI co-pilot explanations with zero hallucinations'
              }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60">
                <feat.icon className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{feat.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Status */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-500 pt-6 border-t border-slate-800/60">
          <span>v1.0.0 Enterprise Core</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Gateway Feeds Online
          </span>
        </div>
      </div>

      {/* RIGHT — Authentication Console Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Branding Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-500/20">
              FT
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-100 leading-none">FinanceTwin AI</h1>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mt-1">
                Risk & Safety Engine
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">Welcome back</h2>
            <p className="text-xs text-slate-400 font-mono">
              Sign in to your executive reconciliation console
            </p>
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-xs font-mono text-rose-300">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Enterprise Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@financetwin.ai"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Security Key / Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0" />
                <span>Remember session</span>
              </label>
              <span className="text-blue-400 hover:underline cursor-pointer font-mono text-[11px]">
                Demo Role: Lead Auditor
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 mt-4"
            >
              <span>{isLoading ? 'Authenticating Credentials...' : 'Access Executive Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="pt-6 border-t border-slate-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              256-bit Encrypted Safety Ledger Gateway
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


