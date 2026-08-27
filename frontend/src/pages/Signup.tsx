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
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'ADMIN',
    country: 'IN',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid work email address.');
      return;
    }
    if (!formData.company.trim()) {
      setError('Please enter your company or organization name.');
      return;
    }
    if (!formData.password) {
      setError('Please create a secure password.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate / Register user in session
      await login(formData.email.trim());
      setSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        // Redirect to main page with login / dashboard
        window.location.href = '/dashboard';
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* LEFT COLUMN: Modern Razorpay-Style Aurora & Value Prop Canvas */}
      <div className="lg:w-7/12 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800/80">
        {/* Abstract Aurora Light Flares */}
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-blue-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-cyan-400/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

        {/* Diagonal Light Streaks (Razorpay Hero Mesh Aesthetic) */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(ellipse at top left, rgba(56, 189, 248, 0.4) 0%, transparent 60%), linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, transparent 50%)'
          }}
        />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/30">
            FT
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white block leading-none">
              FinanceTwin <span className="text-blue-400 font-semibold">AI</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mt-1">
              Autonomous Settlement Engine
            </span>
          </div>
        </div>

        {/* Center/Bottom Narrative Headline */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-full text-xs font-mono text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Partner & Merchant Onboarding</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-100 tracking-tight leading-[1.15]">
            Join Modern Enterprises that Trust{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              FinanceTwin AI
            </span>{' '}
            to Supercharge their Settlement & Reconciliation
          </h1>

          {/* Feature Highlight Pills */}
          <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-blue-400 font-bold">✦</span>
              <span>100+ Payment Methods</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-cyan-400 font-bold">✦</span>
              <span>0.00% False Match Target</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-emerald-400 font-bold">✦</span>
              <span>Enterprise RBAC Privacy</span>
            </div>
          </div>
        </div>

        {/* Left Footer Partner Notice */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>© 2026 FinanceTwin AI Architecture</span>
          <span className="text-slate-500">SOC-2 Type II Certified</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Registration Form Card */}
      <div className="lg:w-5/12 bg-slate-900/90 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-hidden backdrop-blur-xl">
        {/* Top-Right Ribbon */}
        <div className="absolute top-4 -right-12 rotate-45 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-mono font-bold py-1 px-12 shadow-md uppercase tracking-wider">
          0% Platform Fees
        </div>

        <div className="max-w-md mx-auto w-full space-y-6 pt-2">
          {/* Header Brand Badge */}
          <div className="space-y-2">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-600/30">
              FT
            </div>
            <span className="text-xs font-medium text-slate-400 block">
              Welcome to <strong className="text-slate-200">FinanceTwin AI</strong>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Create your business account
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start reconciling payment gateways, settlement batches, and bank statements in minutes.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="p-3.5 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Account created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Validation Error Banner */}
          {error && (
            <div className="p-3 bg-rose-950/90 border border-rose-800 rounded-xl text-xs font-mono text-rose-300 flex items-start gap-2 animate-fadeIn">
              <span className="text-rose-400 font-bold shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Work Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Mobile & Company Name Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Company Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Acme Fintech Pvt Ltd"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Country Selector (Razorpay IN India format) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 block">Where is your company registered?</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="IN">🇮🇳 India (INR - Razorpay Supported)</option>
                <option value="US">🇺🇸 United States (USD)</option>
                <option value="SG">🇸🇬 Singapore (SGD)</option>
                <option value="AE">🇦🇪 United Arab Emirates (AED)</option>
                <option value="UK">🇬🇧 United Kingdom (GBP)</option>
              </select>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 disabled:opacity-50 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Setting Up Account...</span>
                </div>
              ) : (
                <>
                  <span>Create Account & Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already have an account link */}
          <div className="text-center text-xs text-slate-400 pt-2">
            <span>Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
              Sign In
            </Link>
          </div>

          {/* Disclaimer & Partner Card */}
          <div className="space-y-3 pt-2">
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              By continuing you agree to our <a href="#terms" className="text-slate-400 underline">terms of use</a> and <a href="#privacy" className="text-slate-400 underline">privacy policy</a>.
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
