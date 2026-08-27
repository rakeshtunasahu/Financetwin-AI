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
  UserCheck,
  FileText,
  Sliders,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  initialLoginOpen?: boolean;
}

export default function LandingPage({ initialLoginOpen = false }: LandingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, availableUsers, login: authLogin, switchUser } = useAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(
    initialLoginOpen || location.pathname === '/login' || location.search.includes('login=true')
  );
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginPromptMessage, setLoginPromptMessage] = useState<string | null>(null);
  const [resetNotification, setResetNotification] = useState<string | null>(null);
  const [targetPath, setTargetPath] = useState<string>('/dashboard');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/login') {
      setShowLoginModal(true);
    }
  }, [location.pathname]);

  const handleFeatureClick = (path: string, featureName: string) => {
    setTargetPath(path);
    setLoginPromptMessage(`Please log in to access ${featureName}.`);
    setError(null);
    setShowLoginModal(true);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setResetNotification('Password reset link has been dispatched to your corporate email address.');
    setTimeout(() => {
      setResetNotification(null);
    }, 4500);
  };

  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid enterprise email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authLogin(trimmedEmail);
      if (success) {
        setTimeout(() => {
          setIsLoading(false);
          setShowLoginModal(false);
          navigate(targetPath || '/dashboard');
        }, 300);
      } else {
        setIsLoading(false);
        setError('Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Authentication failed.');
    }
  };

  const openLogin = () => {
    setLoginPromptMessage('Please log in to access the executive console and destination features.');
    setTargetPath('/dashboard');
    setShowLoginModal(true);
    setError(null);
  };

  const closeLogin = () => {
    setShowLoginModal(false);
    setLoginPromptMessage(null);
    setError(null);
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRestrictedAccess = (path: string, reason: string = 'Please sign in first to access executive tools and system specifications.') => {
    if (currentUser) {
      navigate(path);
    } else {
      setError(reason);
      setShowLoginModal(true);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'FINANCE_ANALYST':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'FINANCE_MANAGER':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'RISK_COMPLIANCE_OFFICER':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'AUDITOR':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-blue-600/30">
              FT
            </div>
            <div>
              <span className="font-bold text-base text-slate-100 tracking-tight block leading-none">
                FinanceTwin <span className="text-blue-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mt-0.5">
                Risk & Safety Engine
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#safety-engine" onClick={(e) => scrollToSection(e, 'safety-engine')} className="hover:text-blue-400 transition-colors">Safety Engine</a>
            <a href="#ml-intelligence" onClick={(e) => scrollToSection(e, 'ml-intelligence')} className="hover:text-blue-400 transition-colors">ML Intelligence</a>
            <button onClick={() => handleFeatureClick('/dashboard', 'Executive Console')} className="hover:text-blue-400 transition-colors cursor-pointer">Executive Console</button>
          </nav>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={openLogin}
              className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleFeatureClick('/dashboard', 'Operations Dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Slanted Modern Geometric Style */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div 
          className="absolute inset-x-0 bottom-0 h-64 bg-slate-900/60 border-t border-slate-800/60 pointer-events-none transform -skew-y-3 origin-bottom-right" 
          aria-hidden="true" 
        />

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-full text-xs font-mono text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Next-Gen Financial Reconciliation Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
              A New Way to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">
                Reconcile Enterprise Ledgers
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-sans">
              FinanceTwin AI is built specifically for payment gateway settlement batches and bank statement reconciliation. Eliminating false matches with conservative auto-abstaining safety gates and enterprise RBAC privacy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={openLogin}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Sign In to Portal</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleFeatureClick('/dashboard', 'Operations Dashboard')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>View Operations Dashboard</span>
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
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-100">5 Roles</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">RBAC Security</div>
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
                  <span className="text-[10px] font-mono text-slate-400 ml-2">financetwin.ai/executive-console</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  LIVE ENGINE
                </span>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">False Match Rate</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 block mt-0.5">0.00%</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Amount at Risk</span>
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
                    <span className="text-xs text-slate-300 font-medium">Reconciliation Coverage</span>
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
              Start Exploring Financial Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Designed for finance teams, auditors, and treasury managers who demand zero tolerance for false matches.
            </p>
          </div>

          <div id="ml-intelligence" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sliders,
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
                icon: ShieldAlert,
                title: 'Grounded AI Auditing',
                desc: 'Fact-checked AI investigator providing root-cause explanations without hallucination.',
                path: '/exceptions'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={() => handleFeatureClick(card.path, card.title)}
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
            <div className="w-6 h-6 rounded bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              FT
            </div>
            <span>© 2026 FinanceTwin AI — Risk & Safety Engine with Enterprise RBAC.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={openLogin} className="hover:text-slate-300 cursor-pointer">Sign In</button>
            <button onClick={() => handleFeatureClick('/dashboard', 'Operations Dashboard')} className="hover:text-slate-300 cursor-pointer">Dashboard</button>
            <button onClick={() => handleFeatureClick('/audit', 'Audit Logs')} className="hover:text-slate-300 cursor-pointer">Audit Logs</button>
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION REQUIRED MODAL POPUP WITH RED LINES */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500/90 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(244,63,94,0.3)] ring-2 ring-rose-500/30 space-y-5 relative">
            {/* Top Red Accent Glowing Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-t-2xl" />

            {/* Modal Close Button */}
            <button
              onClick={closeLogin}
              className="absolute top-4 right-4 text-slate-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/50 border border-transparent hover:border-rose-800/60 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Brand Header */}
            <div className="text-center space-y-1.5 pt-1">
              <div className="w-11 h-11 rounded-xl bg-rose-600/20 border border-rose-500/60 flex items-center justify-center font-bold text-rose-400 text-lg mx-auto shadow-lg shadow-rose-950/60">
                <Lock className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center justify-center gap-2">
                <span>FinanceTwin AI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-400 font-mono font-medium uppercase tracking-wide">
                  Restricted Access
                </span>
              </h2>
            </div>

            {/* Prominent Red Banner: Please log in to reach destination */}
            <div className="p-3.5 bg-rose-950/70 border-2 border-rose-600/80 rounded-xl space-y-1 text-left shadow-inner shadow-rose-950/80">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Please log in to reach the destination</span>
              </div>
              <p className="text-xs text-rose-200/90 font-mono leading-relaxed pl-6">
                {loginPromptMessage || `Access to ${targetPath === '/dashboard' ? 'Operations Dashboard' : targetPath} requires authenticated enterprise credentials.`}
              </p>
            </div>

            {/* Quick 1-Click Persona Access Section */}
            <div className="space-y-2 pt-1 border-t border-rose-950/60">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  ⚡ Quick 1-Click Access:
                </span>
                <span className="text-[10px] text-slate-500">Auto-authenticates</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await authLogin('admin@financetwin.ai');
                    setShowLoginModal(false);
                    navigate(targetPath || '/dashboard');
                  }}
                  className="p-2.5 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
                    <span>Admin User</span>
                    <ChevronRight className="w-3 h-3 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-purple-400/80 font-mono">Full Access & Simulator</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await authLogin('analyst.priya@financetwin.ai');
                    setShowLoginModal(false);
                    navigate(targetPath || '/dashboard');
                  }}
                  className="p-2.5 bg-blue-950/50 hover:bg-blue-900/60 border border-blue-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="text-xs font-bold text-blue-300 flex items-center justify-between">
                    <span>Finance Analyst</span>
                    <ChevronRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-blue-400/80 font-mono">Priya Sharma (Ops)</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await authLogin('risk.ananya@financetwin.ai');
                    setShowLoginModal(false);
                    navigate(targetPath || '/dashboard');
                  }}
                  className="p-2.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="text-xs font-bold text-rose-300 flex items-center justify-between">
                    <span>Risk Officer</span>
                    <ChevronRight className="w-3 h-3 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-rose-400/80 font-mono">Ananya Singh (ML)</div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await authLogin('auditor.vikram@financetwin.ai');
                    setShowLoginModal(false);
                    navigate(targetPath || '/dashboard');
                  }}
                  className="p-2.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-xl text-left transition-all hover:scale-[1.02] cursor-pointer group"
                >
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
                    <span>Auditor</span>
                    <ChevronRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
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

            {/* Password Reset Toast Notification */}
            {resetNotification && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700/70 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetNotification}</span>
              </div>
            )}

            {/* Validation Error Alert with Red Border */}
            {error && (
              <div className="p-3 bg-rose-950/90 border-2 border-rose-700 rounded-lg text-xs font-mono text-rose-200 flex items-center gap-2 animate-fadeIn shadow-md shadow-rose-950/80">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleModalLogin} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block text-left">Corporate Email:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@financetwin.ai"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password:</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer font-medium"
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
                    placeholder="Enter password (any password works for demo)"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors font-sans"
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

              {/* Security Badge Banner */}
              <div className="p-2.5 bg-slate-950/60 rounded-xl border border-rose-950/60 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>256-Bit TLS Secured Gateway</span>
                </div>
                <span className="text-slate-500 font-semibold">RBAC Protected</span>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/50 active:scale-95 disabled:opacity-50 mt-2 cursor-pointer border border-rose-500/50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
          </div>
        </div>
      )}
    </div>
  );
}
