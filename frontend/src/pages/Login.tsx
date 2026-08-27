import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setResetNotification('Password reset instructions have been dispatched to your corporate email.');
    setTimeout(() => {
      setResetNotification(null);
    }, 4500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your corporate email address.');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(trimmedEmail);
      if (success) {
        setTimeout(() => {
          setIsLoading(false);
          navigate('/dashboard');
        }, 300);
      } else {
        setIsLoading(false);
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Unable to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Navbar Header */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              FT
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                FinanceTwin AI
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                Financial Risk & Ops Core
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-slate-900/90 border-2 border-rose-500/90 rounded-2xl p-7 sm:p-9 shadow-[0_0_40px_rgba(244,63,94,0.3)] ring-2 ring-rose-500/30 backdrop-blur-xl space-y-6 relative">
          {/* Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-t-2xl" />

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-xs font-mono text-rose-400 font-semibold mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Access Control</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">FinanceTwin AI</h1>
            <p className="text-xs text-slate-400">
              Sign in with your credentials to access operations
            </p>
          </div>

          {/* Prominent Red Banner */}
          <div className="p-3.5 bg-rose-950/70 border-2 border-rose-600/80 rounded-xl space-y-1 text-left shadow-inner shadow-rose-950/80">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Please log in to reach the destination</span>
            </div>
            <p className="text-xs text-rose-200/90 font-mono leading-relaxed pl-6">
              Authentication required to access reconciliation ledgers, ML anomalies, and policy governance.
            </p>
          </div>

          {/* Quick 1-Click Persona Access Section */}
          <div className="space-y-2 pt-1 border-t border-rose-950/60">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-slate-300 font-semibold">⚡ Quick 1-Click Access:</span>
              <span className="text-[10px] text-slate-500">Auto-authenticates</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  await login('admin@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2.5 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-purple-300">Admin User</div>
                <div className="text-[10px] text-purple-400/80 font-mono">Full Access & Simulator</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await login('analyst.priya@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2.5 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-blue-300">Finance Analyst</div>
                <div className="text-[10px] text-blue-400/80 font-mono">Priya Sharma (Ops)</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await login('risk.ananya@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-rose-300">Risk Officer</div>
                <div className="text-[10px] text-rose-400/80 font-mono">Ananya Singh (ML)</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await login('auditor.vikram@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold text-emerald-300">Auditor</div>
                <div className="text-[10px] text-emerald-400/80 font-mono">Vikram Mehta (Audit)</div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
              Or Sign In with Corporate Email
            </span>
          </div>

          {/* Password Reset Notification Banner */}
          {resetNotification && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700/70 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{resetNotification}</span>
            </div>
          )}

          {/* Validation Alert */}
          {error && (
            <div className="p-3 bg-rose-950/90 border-2 border-rose-700 rounded-xl text-xs font-mono text-rose-200 flex items-start gap-2 animate-fadeIn">
              <span className="shrink-0 text-rose-400 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block text-left">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@financetwin.ai"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (any password works for demo)"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/90 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/50 hover:shadow-rose-900/60 active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2 border border-rose-500/50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  <span>Sign In & Proceed to Destination</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security & Verification Banner */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-rose-950/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2 text-rose-400">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>TLS 1.3 256-Bit Encrypted</span>
            </div>
            <span className="text-slate-500 font-semibold">RBAC Protected</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 px-6 py-4 text-center text-xs font-mono text-slate-500">
        <span>© 2026 FinanceTwin AI. Autonomous Financial Risk & Reconciliation Architecture.</span>
      </footer>
    </div>
  );
}
