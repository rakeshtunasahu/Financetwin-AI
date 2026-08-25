import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  GitCompare,
  Activity,
  Sliders,
  ArrowRight,
  Lock,
  ChevronRight,
  Sparkles,
  BarChart2,
  Database
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
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
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#safety-engine" className="hover:text-blue-400 transition-colors">Safety Engine</a>
            <a href="#ml-intelligence" className="hover:text-blue-400 transition-colors">ML Intelligence</a>
            <button onClick={() => navigate('/about')} className="hover:text-blue-400 transition-colors">System Specs</button>
          </nav>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 active:scale-95"
            >
              <span>Explore Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION — Slanted Modern Dark/Light Geometric Style */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Background Slanted Geometric Angle & Glows */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Slanted Background Accent Container */}
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
              FinanceTwin AI is built specifically for payment gateway settlement batches and bank statement reconciliation. Eliminating false matches with conservative auto-abstaining safety gates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2 active:scale-95"
              >
                <span>Sign In to Executive Console</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>View Operations Dashboard</span>
              </button>
            </div>

            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                onClick={() => navigate(card.path)}
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
            <span>© 2026 FinanceTwin AI — Risk & Safety Engine. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/login')} className="hover:text-slate-300">Sign In</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-slate-300">Dashboard</button>
            <button onClick={() => navigate('/about')} className="hover:text-slate-300">System Specs</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
