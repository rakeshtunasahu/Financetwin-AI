import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('IN');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setError('Please enter your email or phone number.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authLogin(cleanInput);
      if (success) {
        setTimeout(() => {
          setIsLoading(false);
          navigate('/dashboard');
        }, 300);
      } else {
        setIsLoading(false);
        setError('Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication error.');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await authLogin('admin@financetwin.ai');
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* LEFT COLUMN: Razorpay Aurora Background & Value Proposition */}
      <div className="lg:w-7/12 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Glowing Aurora Flares */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-cyan-400/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

        {/* Ambient Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at top left, rgba(56, 189, 248, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, transparent 50%)'
          }}
        />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              FT
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
                FinanceTwin <span className="text-blue-400 font-semibold">AI</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mt-1">
                Risk & Safety Engine
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Bottom Headline */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-full text-xs font-mono text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Settlement Reconciliation Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-[1.15]">
            Join Modern Enterprises that Trust{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              FinanceTwin AI
            </span>{' '}
            to Supercharge their Settlement Operations
          </h1>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-blue-400 font-bold">✦</span>
              <span>100+ Payment Methods</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-cyan-400 font-bold">✦</span>
              <span>Easy Integration</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-emerald-400 font-bold">✦</span>
              <span>Powerful Dashboard</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>© 2026 FinanceTwin AI Architecture</span>
          <span className="text-slate-500">Zero False Match Guarantee</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Card Panel */}
      <div className="lg:w-5/12 bg-slate-900/90 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-hidden backdrop-blur-xl">
        {/* Top-Right Ribbon */}
        <div className="absolute top-4 -right-12 rotate-45 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-mono font-bold py-1 px-12 shadow-md uppercase tracking-wider">
          0%* Platform Fees
        </div>

        <div className="max-w-md mx-auto w-full space-y-6 pt-2">
          {/* Header Icon & Welcome */}
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30">
              FT
            </div>
            <span className="text-xs font-medium text-slate-400 block">
              Welcome to <strong className="text-slate-200">FinanceTwin AI</strong>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Get started with your email or phone number
            </h2>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/90 border border-rose-800 rounded-xl text-xs font-mono text-rose-300 flex items-start gap-2 animate-fadeIn">
              <span className="text-rose-400 font-bold shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Phone input */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your email or phone number"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Optional Password if typed */}
            {identifier && (
              <div className="space-y-1 animate-fadeIn">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (optional for demo)"
                    className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Country Selector Dropdown */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium block">
                Where is your company registered?
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="IN">🇮🇳 India</option>
                <option value="US">🇺🇸 United States</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="AE">🇦🇪 United Arab Emirates</option>
              </select>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 font-mono">or</span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 8.9 5 12 5z" />
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z" />
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Quick 1-Click Persona Access Section for Evaluation */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                ⚡ Demo 1-Click Access:
              </span>
              <span className="text-[10px] text-slate-500">Auto-authenticates</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  authLogin('admin@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-purple-300">Admin User</div>
                <div className="text-[9px] text-purple-400/80 font-mono">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  authLogin('analyst.priya@financetwin.ai');
                  navigate('/dashboard');
                }}
                className="p-2 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold text-blue-300">Finance Analyst</div>
                <div className="text-[9px] text-blue-400/80 font-mono">Priya Sharma</div>
              </button>
            </div>
          </div>

          {/* Sign Up Option: Opens in New Tab */}
          <div className="text-center text-xs text-slate-400 pt-1">
            <span>Don't have an account? </span>
            <a
              href="/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1"
            >
              <span>Sign Up (opens in new tab)</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Disclaimers & Partner Callout */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              By continuing you agree to our <a href="#privacy" className="text-slate-400 underline">privacy policy</a> & <a href="#terms" className="text-slate-400 underline">terms of use</a>. *Limited period offer, terms and conditions apply.
            </p>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-200 block text-[11px]">Helping Clients with Settlement Solutions?</span>
                <a href="#partner" className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold flex items-center gap-1 mt-0.5">
                  <span>Become Enterprise Partner</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-mono pt-6">
          <span>Protected by 256-bit SSL encryption & SOC-2 compliance.</span>
        </div>
      </div>
    </div>
  );
}
