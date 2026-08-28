import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  Cpu,
  Zap,
  TrendingUp,
  Sliders,
  RotateCw,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  initialModeProp?: 'login' | 'register';
}

export default function Login({ initialModeProp }: LoginProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const determinedMode = initialModeProp || (searchParams.get('mode') === 'register' ? 'register' : 'login');
  
  const { login: authLogin, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(determinedMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await authLogin(cleanEmail);
      if (ok) {
        if (cleanEmail.includes('aarav') || cleanEmail.includes('operator')) {
          navigate('/operator-queue');
        } else {
          navigate('/recovery');
        }
      } else {
        setIsLoading(false);
        setError('Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication error.');
    }
  };

  const handleDemoSelect = async (userEmail: string, rolePath: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authLogin(userEmail);
      setTimeout(() => {
        setIsLoading(false);
        navigate(rolePath);
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      setError('Demo authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-12 font-sans relative overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Split-Screen Asymmetric Layout */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl shadow-slate-950/90 backdrop-blur-xl relative z-10 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Product Intro & Value Proposition */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-emerald-600/30">
                RR
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-100 tracking-tight block leading-none">
                  RevenueRescue <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mt-0.5 font-bold">
                  Autonomous Recovery Agent
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Detect. Decide. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Recover Lost Revenue.
                </span>
              </h2>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-100">Detect revenue at risk:</strong> Continuous scanning of failed payments, cart drop-offs, and unpaid invoices.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-950 border border-teal-800 flex items-center justify-center shrink-0 mt-0.5 text-teal-400 font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-100">Understand why it happened:</strong> AI diagnosis pinpointing root causes with verified confidence.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400 font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-100">Choose the right intervention:</strong> Smart Retries, Recovery Links, and Reminders within policy bounds.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center shrink-0 mt-0.5 text-blue-400 font-bold text-[10px]">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-100">Recover what would be lost:</strong> Transform write-offs into settled revenue with SHA-256 audit trails.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Policy Guardrails Enforced</span>
            </div>
            <span className="text-[10px] text-slate-500">v2.0</span>
          </div>
        </div>

        {/* Right Side: Demo Persona Selector & Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100">Select Demo Role to Enter</h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore RevenueRescue AI under role-specific permissions</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                3 RECOVERY ROLES
              </span>
            </div>

            {/* Exactly 3 Recovery Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/* Role 1: Operator */}
              <button
                type="button"
                onClick={() => handleDemoSelect('operator.aarav@revenuerescue.ai', '/operator-queue')}
                disabled={isLoading}
                className="p-3 bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700/60 rounded-2xl text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 font-bold text-[10px]">
                    OP
                  </span>
                  <span className="text-[9px] font-mono text-blue-400 font-semibold uppercase">Operator</span>
                </div>
                <div className="font-bold text-xs text-slate-200 group-hover:text-blue-300 truncate">
                  Aarav Mehta
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  Daily recovery operations, diagnosis & queues
                </div>
              </button>

              {/* Role 2: Manager */}
              <button
                type="button"
                onClick={() => handleDemoSelect('manager.priya@revenuerescue.ai', '/recovery')}
                disabled={isLoading}
                className="p-3 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-700/60 rounded-2xl text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold text-[10px]">
                    MG
                  </span>
                  <span className="text-[9px] font-mono text-amber-400 font-semibold uppercase">Manager</span>
                </div>
                <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300 truncate">
                  Priya Sharma
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  Revenue performance, high-value cases & approvals
                </div>
              </button>

              {/* Role 3: Administrator */}
              <button
                type="button"
                onClick={() => handleDemoSelect('admin.arjun@revenuerescue.ai', '/recovery')}
                disabled={isLoading}
                className="p-3 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700/60 rounded-2xl text-left transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                    AD
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase">Admin</span>
                </div>
                <div className="font-bold text-xs text-slate-200 group-hover:text-emerald-300 truncate">
                  Arjun Rao
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  System recovery control, batch runner & policies
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-mono">or enter work email</span>
            </div>

            {/* Error Feedback */}
            {error && (
              <div className="p-3 mb-4 bg-rose-950/80 border border-rose-800 rounded-xl text-xs font-mono text-rose-300">
                {error}
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator.aarav@revenuerescue.ai"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <span className="text-[11px] text-slate-500 font-mono">Demo: any password</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Recovery Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-800/80">
            Protected by SOC-2 Type II standards & deterministic policy guardrails.
          </div>
        </div>
      </div>
    </div>
  );
}
