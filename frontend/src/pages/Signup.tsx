import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Cpu,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobRole, setJobRole] = useState('Revenue Operations Director');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreedToPolicy) {
      setError('Please acknowledge the Enterprise Ledger Safety & Audit terms.');
      return;
    }

    setIsLoading(true);
    const result = await signup(name.trim(), cleanEmail, password, company, jobRole);
    setIsLoading(false);

    if (result.ok) {
      setSuccess('Account created successfully! Initializing your workspace...');
      setTimeout(() => navigate('/dashboard'), 900);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/90 backdrop-blur-xl relative z-10 space-y-5 my-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-600/30">
              RR
            </div>
            <div className="text-left">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight block leading-none">
                RevenueRescue <span className="text-emerald-400 font-semibold">AI</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mt-0.5 font-bold">
                Autonomous Recovery Agent
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">Create Your Account</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              Get instant access to autonomous revenue recovery across failed payments, abandoned carts, and overdue invoices.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-800/60 rounded-full text-[11px] font-mono text-emerald-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autonomous Recovery Engine Active</span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs font-mono text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Company Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="signup-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Payments Pvt Ltd"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@acmepayments.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Role / Function</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  id="signup-role"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Revenue Operations Director">Revenue Operations Director</option>
                  <option value="Revenue Recovery Manager">Revenue Recovery Manager</option>
                  <option value="Revenue Recovery Operator">Revenue Recovery Operator</option>
                  <option value="Revenue Risk & Audit Analyst">Revenue Risk & Audit Analyst</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Policy Compliance */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="policyCheck"
              checked={agreedToPolicy}
              onChange={(e) => setAgreedToPolicy(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="policyCheck" className="text-[11px] text-slate-400 cursor-pointer leading-tight">
              I agree to the <span className="text-slate-200 font-medium">Deterministic Ledger Safety Governance</span> terms and enable SOC-2 compliant immutable audit logs.
            </label>
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50 mt-3 cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-1">
          <span>Already have an account? </span>
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 cursor-pointer">
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="text-center space-y-1 text-[10px] text-slate-500 font-mono pt-1">
          <p>Protected by 256-bit AES encryption & SOC-2 Type II audit standards.</p>
        </div>
      </div>
    </div>
  );
}
