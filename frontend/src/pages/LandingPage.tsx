import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  GitCompare,
  Activity,
  ArrowRight,
  Lock,
  ChevronRight,
  Sparkles,
  BarChart2,
  Database,
  Mail,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  initialLoginOpen?: boolean;
}

export default function LandingPage({ initialLoginOpen = false }: LandingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(
    initialLoginOpen || location.pathname === '/login' || location.search.includes('login=true')
  );
  
  const [email, setEmail] = useState('admin@revenuerescue.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/login') {
      setShowLoginModal(true);
    }
  }, [location.pathname]);

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const ok = await login(email.trim());
      if (ok) {
        setShowLoginModal(false);
        navigate('/dashboard');
      } else {
        setError('Authentication failed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const openLogin = () => {
    setShowLoginModal(true);
    setError(null);
  };

  const closeLogin = () => {
    setShowLoginModal(false);
    setError(null);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRestrictedAccess = (reason: string = 'Please sign in first to access executive tools and system specifications.') => {
    setError(reason);
    setShowLoginModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-emerald-600/30">
              RR
            </div>
            <div>
              <span className="font-bold text-base text-slate-100 tracking-tight block leading-none">
                RevenueRescue <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider block mt-0.5 font-bold">
                Autonomous Recovery Agent
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#safety-engine" onClick={(e) => scrollToSection(e, 'safety-engine')} className="hover:text-emerald-400 transition-colors">Safety Engine</a>
            <a href="#ml-intelligence" onClick={(e) => scrollToSection(e, 'ml-intelligence')} className="hover:text-emerald-400 transition-colors">ML Intelligence</a>
            <button onClick={() => navigate('/recovery')} className="hover:text-emerald-400 transition-colors">Command Center</button>
          </nav>

          {/* Action CTA Buttons — Login and Sign Up Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={openLogin}
              className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>
            <a
              href="/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Slanted Modern Dark/Light Geometric Style */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Slanted Geometric Angle & Glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Slanted Background Accent Container */}
        <div 
          className="absolute inset-x-0 bottom-0 h-64 bg-slate-900/60 border-t border-slate-800/60 pointer-events-none transform -skew-y-3 origin-bottom-right" 
          aria-hidden="true" 
        />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-800/80 rounded-full text-xs font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Autonomous Revenue Recovery Agent</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
              Detect. Decide. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Recover Revenue Autonomously
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-sans">
              RevenueRescue AI continuously turns payment failures, abandoned checkout flows, and overdue B2B receivables into recovered cash with deterministic policy guardrails.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={openLogin}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Login to Command Center</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/recovery')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Open Recovery Dashboard</span>
              </button>
            </div>

            {/* Quick Metrics Banner */}
            <div id="safety-engine" className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">0.00%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">False Match Target</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">95% + 5%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Safety Threshold</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-100">100%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Auditability</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Platform Mockup Card Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl shadow-blue-950/40 backdrop-blur-sm transform lg:rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Mockup Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[10px] font-mono text-slate-400 ml-2">revenuerescue.ai/recovery-console</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  LIVE ENGINE
                </span>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">False Recovery Rate</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 block mt-0.5">0.00%</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Recoverable Leakage</span>
                    <span className="text-lg font-bold font-mono text-slate-100 block mt-0.5">₹6,85,713</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-950/30 border border-amber-800/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                    <span>AUTOMATIC MATCH REFUSED</span>
                    <span className="font-mono text-[10px]">ABSTAIN</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono leading-tight">
                    Confidence Margin 2.6% &lt; Required 5.0%. Safety gate blocked auto-execution.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-300 font-medium">Recovery Pipeline Coverage</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">92.3% PPV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* START EXPLORING FEATURE CARDS */}
      <section id="features" className="py-16 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider">
              Core Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Start Exploring Revenue Recovery Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Designed for revenue operations, risk leaders, and merchant growth teams who demand zero revenue leakage.
            </p>
          </div>

          <div id="ml-intelligence" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Safety Policy Lab',
                desc: 'Simulate policy thresholds and evaluate before-vs-after impact on coverage and exposure.',
                path: '/governance'
              },
              {
                icon: GitCompare,
                title: 'Multi-Pass Engine',
                desc: 'Deterministic UTR reference, exact net contribution, and credit delay window matching.',
                path: '/reconciliation'
              },
              {
                icon: Activity,
                title: 'ML Anomaly Patterns',
                desc: 'IsolationForest outlier scoring & DBSCAN exception clustering for recurring variance.',
                path: '/anomalies'
              },
              {
                icon: Lock,
                title: 'Grounded AI Auditing',
                desc: 'Fact-checked AI investigator providing root-cause explanations without hallucination.',
                path: '/exceptions'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={() => handleRestrictedAccess(`Please sign in first to access ${card.title}.`)}
                className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 hover:border-blue-500/50 transition-all cursor-pointer group hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
                <div className="flex items-center gap-1 text-xs font-mono font-semibold text-blue-400 pt-2">
                  <span>Explore module</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              RR
            </div>
            <span>© 2026 RevenueRescue AI — Autonomous Revenue Recovery Agent. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={openLogin} className="hover:text-slate-300">Sign In</button>
            <button onClick={() => navigate('/recovery')} className="hover:text-slate-300">Command Center</button>
            <button onClick={() => navigate('/about')} className="hover:text-slate-300">Architecture Specs</button>
          </div>
        </div>
      </footer>

      {/* CLEAN BOX PORTAL LOGIN MODAL POPUP */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/90 space-y-5 relative font-sans overflow-hidden">
            
            {/* Modal Close Button */}
            <button
              onClick={closeLogin}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Brand Logo & App Defining Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-600/30 mx-auto">
                RR
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">
                  Welcome to <strong className="text-slate-200">RevenueRescue AI</strong>
                </span>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Autonomous revenue recovery platform with AI root cause diagnosis & bounded policy guardrails.
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-full text-[10px] font-mono text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Deterministic Guardrails Active</span>
              </div>
            </div>

            {/* 1-Click Demo Profiles (3 Recovery Roles) */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-mono block text-center uppercase tracking-wider">
                Select Demo Role
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await login('operator.aarav@revenuerescue.ai');
                    setShowLoginModal(false);
                    navigate('/operator-queue');
                  }}
                  className="px-2 py-2 bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-700/60 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <span className="block text-[11px] font-bold text-slate-200 group-hover:text-blue-300">Operator</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Aarav M.</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await login('manager.priya@revenuerescue.ai');
                    setShowLoginModal(false);
                    navigate('/recovery');
                  }}
                  className="px-2 py-2 bg-slate-950 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-700/60 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <span className="block text-[11px] font-bold text-slate-200 group-hover:text-amber-300">Manager</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Priya S.</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await login('admin.arjun@revenuerescue.ai');
                    setShowLoginModal(false);
                    navigate('/recovery');
                  }}
                  className="px-2 py-2 bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700/60 rounded-xl text-center transition-all cursor-pointer group"
                >
                  <span className="block text-[11px] font-bold text-slate-200 group-hover:text-emerald-300">Admin</span>
                  <span className="block text-[9px] text-slate-500 font-mono">Arjun R.</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-mono">or enter work email</span>
            </div>


            {/* Validation Error Alert */}
            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-xs font-mono text-rose-300 animate-fadeIn">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleModalLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block text-left">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@revenuerescue.ai"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered email.')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors font-sans"
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

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-xs text-slate-400 pt-1">
              <span>Don't have an account? </span>
              <a
                href="/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Disclaimers */}
            <p className="text-[10px] text-center text-slate-500 leading-tight">
              Protected by 256-bit encryption & SOC-2 compliance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

