import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Bot,
  Terminal,
  Clock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  FileText,
  Activity,
  Sliders,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { recoveryApi } from '../api/client';
import { LivePipelineRequest, LivePipelineResponse, LivePipelineStep } from '../types';
import { Term } from '../components/common/TermTooltip';

interface DemoCasePreset {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  customerId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  failureReason: string;
  expectedOutcome: string;
}

const DEMO_PRESETS: DemoCasePreset[] = [
  {
    id: 'temp_bank_failure',
    name: '1. Temporary Bank Failure',
    badge: 'RECOVERABLE',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    customerId: 'CUST-1042',
    transactionId: 'TXN-87421',
    amount: 25000,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'Temporary Bank / Issuer Failure',
    expectedOutcome: 'UPI Smart Retry → 100% Recovery'
  },
  {
    id: 'insufficient_funds',
    name: '2. Insufficient Funds',
    badge: 'PAYMENT LINK',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    customerId: 'CUST-2089',
    transactionId: 'TXN-64210',
    amount: 14500,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'Insufficient Customer Balance (Debit Fail)',
    expectedOutcome: 'WhatsApp & SMS Smart Payment Link'
  },
  {
    id: 'gateway_timeout',
    name: '3. Payment Gateway Timeout',
    badge: 'WEBHOOK RESEND',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    customerId: 'CUST-3105',
    transactionId: 'TXN-49120',
    amount: 32000,
    currency: 'INR',
    paymentStatus: 'DROPPED',
    failureReason: 'Payment Timeout / Webhook Dropped',
    expectedOutcome: 'Idempotent Webhook Re-trigger & Sync'
  },
  {
    id: 'expired_card',
    name: '4. Expired Card / Mandate',
    badge: 'METHOD UPDATE',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    customerId: 'CUST-4512',
    transactionId: 'TXN-39811',
    amount: 18000,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'Expired Card / Mandate Invalidation',
    expectedOutcome: 'Payment Method Update Request'
  },
  {
    id: 'abandoned_checkout',
    name: '5. Customer Abandoned Payment',
    badge: '1-CLICK RESUME',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    customerId: 'CUST-5290',
    transactionId: 'TXN-22104',
    amount: 8500,
    currency: 'INR',
    paymentStatus: 'ABANDONED',
    failureReason: 'Customer Abandoned at 3DS OTP Step',
    expectedOutcome: 'Pre-filled Checkout Resume Token'
  },
  {
    id: 'repeated_failure',
    name: '6. Repeated Payment Failure',
    badge: 'POLICY CEILING',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    customerId: 'CUST-6744',
    transactionId: 'TXN-55410',
    amount: 45000,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'Repeated Payment Failure (3/3 Retries Failed)',
    expectedOutcome: 'Max Retries Exceeded → Manual Review'
  },
  {
    id: 'high_value',
    name: '7. High-Value Payment (>₹50k)',
    badge: 'DUAL SIGNOFF',
    badgeColor: 'bg-orange-950 text-orange-300 border-orange-800',
    customerId: 'CUST-7801',
    transactionId: 'TXN-91024',
    amount: 125000,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'High-Value Gateway Rejection',
    expectedOutcome: 'Policy Cap Exceeded → Manager Escalation'
  },
  {
    id: 'suspicious_anomaly',
    name: '8. Suspicious / Anomalous Txn',
    badge: 'FRAUD GATE BLOCK',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    customerId: 'CUST-9999',
    transactionId: 'TXN-10088',
    amount: 88000,
    currency: 'INR',
    paymentStatus: 'FAILED',
    failureReason: 'Suspicious Velocity Spike / Anomaly Cluster #4',
    expectedOutcome: 'Risk Gate Triggered → Automated Recovery Blocked'
  }
];

interface LiveActivityEvent {
  id: string;
  time: string;
  stepNum: number;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const STEP_DEFINITIONS = [
  { num: 1, name: 'Detect Revenue Risk', desc: 'Identify revenue-at-risk event & ingest failure' },
  { num: 2, name: 'Validate Transaction', desc: 'Verify account, idempotency & recovery eligibility' },
  { num: 3, name: 'Diagnose Failure', desc: 'AI-assisted root cause & evidence extraction' },
  { num: 4, name: 'Predict Probability', desc: 'ML recovery likelihood score & factor analysis' },
  { num: 5, name: 'Select Strategy', desc: 'Intervention selection & deterministic policy check' },
  { num: 6, name: 'Optimize Channel', desc: 'Multi-channel ranking & highest-yield routing' },
  { num: 7, name: 'Execute Recovery', desc: 'Controlled sandbox simulation with idempotency key' },
  { num: 8, name: 'Verify Outcome', desc: 'Confirm Bank UTR & settlement clearing status' },
  { num: 9, name: 'Measure Impact', desc: 'Calculate net rescued cash vs remaining risk' },
  { num: 10, name: 'Learn & Audit', desc: 'Register outcome feedback & immutable audit log' }
];

export default function LiveRecovery() {
  const navigate = useNavigate();

  // Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('temp_bank_failure');
  const [customerId, setCustomerId] = useState('CUST-1042');
  const [transactionId, setTransactionId] = useState('TXN-87421');
  const [amount, setAmount] = useState<number>(25000);
  const [currency, setCurrency] = useState('INR');
  const [paymentStatus, setPaymentStatus] = useState('FAILED');
  const [failureReason, setFailureReason] = useState('Temporary Bank / Issuer Failure');
  const [inputError, setInputError] = useState<string | null>(null);

  // Execution & Flow State Machine
  const [flowState, setFlowState] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ERROR'>('IDLE');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1); // -1 = not started, 0..9
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [pipelineData, setPipelineData] = useState<LivePipelineResponse | null>(null);
  const [activityEvents, setActivityEvents] = useState<LiveActivityEvent[]>([]);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [speedMode, setSpeedMode] = useState<'presentation' | 'normal' | 'fast'>('presentation');

  const timerRef = useRef<any>(null);
  const finishTimerRef = useRef<any>(null);
  const activityEndRef = useRef<HTMLDivElement>(null);

  const STEP_DURATIONS = {
    presentation: 2400, // Ideal for judge demo & presentation
    normal: 1700,
    fast: 1000
  };

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  // Handle preset selection
  const handleSelectPreset = (presetId: string) => {
    const p = DEMO_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setSelectedPresetId(presetId);
    setCustomerId(p.customerId);
    setTransactionId(p.transactionId);
    setAmount(p.amount);
    setCurrency(p.currency);
    setPaymentStatus(p.paymentStatus);
    setFailureReason(p.failureReason);
    handleReset();
  };

  // Reset entire flow
  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    setFlowState('IDLE');
    setActiveStepIndex(-1);
    setJustCompletedStep(null);
    setCompletedSteps([]);
    setPipelineData(null);
    setActivityEvents([]);
    setInputError(null);
  };

  // Log system activity event
  const pushActivity = (text: string, stepNum: number, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newEvent: LiveActivityEvent = {
      id: `${Date.now()}-${Math.random()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      stepNum,
      text,
      type
    };
    setActivityEvents((prev) => [...prev, newEvent]);
  };

  // Auto scroll activity feed
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityEvents]);

  // Start Recovery Flow
  const handleStartRecovery = async () => {
    if (flowState === 'RUNNING') return;

    if (!transactionId.trim()) {
      setInputError('Transaction ID is required.');
      return;
    }
    if (!customerId.trim()) {
      setInputError('Customer ID is required.');
      return;
    }
    if (amount <= 0 || isNaN(amount)) {
      setInputError('Amount must be a positive number.');
      return;
    }

    setInputError(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    setActiveStepIndex(-1);
    setJustCompletedStep(null);
    setCompletedSteps([]);
    setPipelineData(null);
    setActivityEvents([]);
    setFlowState('RUNNING');
    setAutoPlay(true);

    pushActivity(`Initiating live recovery run for ${transactionId} (₹${amount.toLocaleString('en-IN')})`, 1, 'info');

    try {
      // Call backend live pipeline endpoint
      const req: LivePipelineRequest = {
        customer_id: customerId.trim(),
        transaction_id: transactionId.trim(),
        amount: Number(amount),
        currency: currency.trim(),
        payment_status: paymentStatus.trim(),
        failure_reason: failureReason.trim(),
        execution_mode: 'DEMO_SANDBOX'
      };

      const res = await recoveryApi.runLivePipeline(req);
      setPipelineData(res);

      // Start sequential visual execution from Step 0
      setActiveStepIndex(0);
    } catch (err: any) {
      setFlowState('ERROR');
      pushActivity(`Backend pipeline connection error: ${err.message || 'Failed to initialize'}`, 1, 'error');
    }
  };

  // Step-by-Step Timer Machine with Satisfaction Animation
  useEffect(() => {
    if (flowState !== 'RUNNING' || activeStepIndex < 0 || !pipelineData) return;

    const stepObj = pipelineData.steps[activeStepIndex];
    if (!stepObj) return;

    // Log the activation of current step
    pushActivity(`Executing Step 0${activeStepIndex + 1}: ${stepObj.name}`, activeStepIndex + 1, 'info');

    if (autoPlay) {
      const stepDuration = STEP_DURATIONS[speedMode];
      const processingTime = Math.max(700, stepDuration - 600);

      // Phase 1: Step is running & processing
      timerRef.current = setTimeout(() => {
        // Phase 2: Step finished! Trigger satisfying "DONE" animation
        setJustCompletedStep(activeStepIndex);
        setCompletedSteps((prev) => (prev.includes(activeStepIndex) ? prev : [...prev, activeStepIndex]));

        const eventType = stepObj.status === 'COMPLETED' ? 'success' : stepObj.status === 'SKIPPED' ? 'warning' : 'error';
        pushActivity(`✓ Step 0${activeStepIndex + 1} Done: ${stepObj.summary}`, activeStepIndex + 1, eventType);

        // Phase 3: Pause 600ms so judge can clearly see the finished step, then advance!
        finishTimerRef.current = setTimeout(() => {
          setJustCompletedStep(null);
          if (activeStepIndex < 9) {
            setActiveStepIndex((prev) => prev + 1);
          } else {
            // Finished all 10 steps!
            setFlowState('COMPLETED');
            pushActivity(
              `🎉 10-Step Pipeline Finished! Final Status: ${pipelineData.final_status} (₹${pipelineData.recovered_amount.toLocaleString('en-IN')} rescued)`,
              10,
              pipelineData.is_recovered ? 'success' : 'warning'
            );
          }
        }, 600);
      }, processingTime);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, [flowState, activeStepIndex, pipelineData, autoPlay, speedMode]);

  // Step Through manually
  const handleStepThrough = () => {
    if (flowState === 'IDLE') {
      handleStartRecovery();
      setAutoPlay(false);
      return;
    }

    if (activeStepIndex < 9 && pipelineData) {
      setJustCompletedStep(activeStepIndex);
      setCompletedSteps((prev) => (prev.includes(activeStepIndex) ? prev : [...prev, activeStepIndex]));
      const nextIndex = activeStepIndex + 1;

      setTimeout(() => {
        setJustCompletedStep(null);
        setActiveStepIndex(nextIndex);
        const stepObj = pipelineData.steps[nextIndex];
        pushActivity(`Manual Step 0${nextIndex + 1}: ${stepObj.name} — ${stepObj.summary}`, nextIndex + 1, 'info');

        if (nextIndex === 9) {
          setCompletedSteps((prev) => (prev.includes(9) ? prev : [...prev, 9]));
          setFlowState('COMPLETED');
          pushActivity(`10-Step Pipeline Complete: ${pipelineData.final_status}`, 10, pipelineData.is_recovered ? 'success' : 'warning');
        }
      }, 300);
    }
  };

  // Toggle Pause/Resume
  const handleTogglePause = () => {
    if (flowState === 'RUNNING') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFlowState('PAUSED');
      setAutoPlay(false);
      pushActivity(`Execution paused by operator at Step 0${activeStepIndex + 1}`, activeStepIndex + 1, 'warning');
    } else if (flowState === 'PAUSED') {
      setFlowState('RUNNING');
      setAutoPlay(true);
      pushActivity(`Resuming automated pipeline at Step 0${activeStepIndex + 1}`, activeStepIndex + 1, 'info');
    }
  };

  const currentStepData = pipelineData && activeStepIndex >= 0 ? pipelineData.steps[activeStepIndex] : null;

  return (
    <PageContainer
      title="LIVE REVENUE RECOVERY"
      onRefresh={handleReset}
    >
      {/* Top Banner Notice */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
              Autonomous 10-Step Recovery Engine Console
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold uppercase">
                SANDBOX / DEMO SIMULATION
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive judge inspection tool: Select or enter any failed payment to trace deterministic diagnosis, probability, policy gate, and recovery verification in real time.
            </p>
          </div>
        </div>

        {/* Global Controls & Speed Selector */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {/* Speed Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
            <span className="text-slate-500 px-1.5 hidden md:inline">Speed:</span>
            {(['presentation', 'normal', 'fast'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSpeedMode(m)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  speedMode === m
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {m === 'presentation' ? '2.4s (Demo)' : m === 'normal' ? '1.7s' : '1.0s (Fast)'}
              </button>
            ))}
          </div>

          {flowState === 'IDLE' || flowState === 'ERROR' ? (
            <button
              onClick={handleStartRecovery}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{flowState === 'ERROR' ? 'RETRY RECOVERY' : 'START RECOVERY'}</span>
            </button>
          ) : flowState === 'COMPLETED' ? (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RUN ANOTHER CASE</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleTogglePause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                {flowState === 'RUNNING' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{flowState === 'RUNNING' ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={handleStepThrough}
                disabled={activeStepIndex >= 9}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>Step Through</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
                title="Reset Flow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Operations 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================================
            LEFT COLUMN (Col span 4): Revenue Case Input Panel & Demo Presets
        ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Revenue Case Input</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Transaction</span>
            </div>

            {/* Quick Demo Case Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>Choose Demo Case</span>
                <span className="text-[9px] font-mono text-emerald-400">8 Presets</span>
              </label>
              <select
                value={selectedPresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                disabled={flowState === 'RUNNING'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {DEMO_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.amount.toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Error Alert */}
            {inputError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-lg text-xs font-mono text-rose-300">
                {inputError}
              </div>
            )}

            {/* Editable Fields Form */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Customer ID</label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    disabled={flowState === 'RUNNING'}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Transaction ID</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    disabled={flowState === 'RUNNING'}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Amount at Risk (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    disabled={flowState === 'RUNNING'}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    disabled={flowState === 'RUNNING'}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FAILED">FAILED</option>
                    <option value="DROPPED">DROPPED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ABANDONED">ABANDONED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Failure Reason / Context</label>
                <input
                  type="text"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  disabled={flowState === 'RUNNING'}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={handleStartRecovery}
                disabled={flowState === 'RUNNING'}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {flowState === 'RUNNING' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START RECOVERY</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                disabled={flowState === 'IDLE'}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="Reset input and pipeline"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Quick Preset Badges */}
          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Scenario Quick Picker
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  disabled={flowState === 'RUNNING'}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-mono transition-all text-left cursor-pointer ${
                    selectedPresetId === p.id
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {p.name.split('. ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTER COLUMN (Col span 5): 10-Step Interactive Sequential Pipeline
        ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                10-Step Recovery Pipeline
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {completedSteps.length} of 10 Completed
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              {flowState === 'RUNNING'
                ? 'Processing...'
                : flowState === 'COMPLETED'
                ? 'Run Complete'
                : 'Waiting to Start'}
            </span>
          </div>

          {/* Step Cards List */}
          <div className="space-y-2.5">
            {STEP_DEFINITIONS.map((def, idx) => {
              const isCurrent = activeStepIndex === idx && flowState === 'RUNNING' && justCompletedStep !== idx;
              const isJustFinished = justCompletedStep === idx;
              const isDone = completedSteps.includes(idx) || isJustFinished;
              const isLocked = activeStepIndex < idx && !isDone;
              const stepResult = pipelineData?.steps?.[idx];

              return (
                <div
                  key={def.num}
                  className={`p-3 rounded-xl border transition-all duration-300 ${
                    isJustFinished
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-xl shadow-emerald-950/70 ring-2 ring-emerald-400 scale-[1.015] duration-300'
                      : isCurrent
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : isDone
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-60'
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] transition-all duration-300 ${
                          isJustFinished
                            ? 'bg-emerald-400 text-slate-950 font-bold scale-110 shadow-md shadow-emerald-400'
                            : isDone
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : isCurrent
                            ? 'bg-cyan-600 text-white animate-pulse'
                            : 'bg-slate-950 text-slate-600 border border-slate-800'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : `0${def.num}`}
                      </div>

                      <div>
                        <h4 className={`text-xs font-bold transition-colors ${
                          isJustFinished
                            ? 'text-emerald-300 font-bold'
                            : isCurrent
                            ? 'text-cyan-300'
                            : isDone
                            ? 'text-slate-100'
                            : 'text-slate-500'
                        }`}>
                          {def.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{def.desc}</p>
                      </div>
                    </div>

                    {/* Step Status Pill */}
                    <div className="shrink-0">
                      {isJustFinished ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/30 animate-pulse">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>DONE</span>
                        </span>
                      ) : isDone ? (
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            stepResult?.status === 'SKIPPED'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : stepResult?.status === 'FAILED'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                              : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {stepResult?.status || 'COMPLETED'}
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700 animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                          PROCESSING
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active Step Real-time Progress Bar */}
                  {isCurrent && (
                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden my-2 border border-slate-800/80">
                      <div className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 animate-pulse w-full duration-1000" />
                    </div>
                  )}

                  {/* Render Detailed Live Result when Done or Running */}
                  {(isDone || isCurrent) && stepResult && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-xs space-y-1.5 animate-in fade-in">
                      {/* Step 1: Detect Output */}
                      {idx === 0 && (
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                          <div>
                            <span className="text-slate-500 block text-[9px]">At Risk</span>
                            <span className="text-rose-400 font-bold">{formatter.format(stepResult.data.amount_at_risk)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px]">Severity</span>
                            <span className="text-amber-400 font-bold">{stepResult.data.severity}</span>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Validation Checks */}
                      {idx === 1 && (
                        <div className="space-y-1 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
                          {stepResult.data.checks?.slice(0, 3).map((c: any, cI: number) => (
                            <div key={cI} className="flex items-center justify-between text-slate-300">
                              <span>{c.check}</span>
                              <span className="text-emerald-400 font-bold">✓ PASS</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Step 3: Diagnosis Output */}
                      {idx === 2 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Root Cause:</span>
                            <span className="text-cyan-300 font-bold">{stepResult.data.primary_cause}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Confidence: <strong className="text-emerald-400">{stepResult.data.confidence_pct}%</strong></span>
                            <span>Category: <strong className="text-slate-300">{stepResult.data.category}</strong></span>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Prediction Output */}
                      {idx === 3 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Recovery Probability</span>
                            <span className="text-emerald-400 font-mono font-bold">{stepResult.data.recovery_probability_pct}%</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${stepResult.data.recovery_probability_pct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Step 5: Strategy Selection */}
                      {idx === 4 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Selected Strategy:</span>
                            <span className="text-indigo-300 font-bold font-mono">{stepResult.data.strategy}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{stepResult.data.action_name}</p>
                        </div>
                      )}

                      {/* Step 6: Channel Optimization */}
                      {idx === 5 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Best Channel:</span>
                            <span className="text-emerald-400 font-bold">{stepResult.data.selected_channel}</span>
                          </div>
                          <div className="flex gap-2 text-[9px] font-mono text-slate-500">
                            {stepResult.data.channels?.slice(0, 2).map((ch: any, chI: number) => (
                              <span key={chI} className={ch.selected ? 'text-emerald-400 font-bold' : ''}>
                                {ch.channel}: {ch.score}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 7: Execution Sandbox */}
                      {idx === 6 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Mode: <strong className="text-cyan-400">SANDBOX SIMULATION</strong></span>
                            <span className="text-emerald-400">✓ EXECUTED</span>
                          </div>
                          {stepResult.data.idempotency_key && (
                            <span className="text-slate-500 block truncate">Key: {stepResult.data.idempotency_key}</span>
                          )}
                        </div>
                      )}

                      {/* Step 8: Verification */}
                      {idx === 7 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Outcome:</span>
                            <span className={`font-bold ${stepResult.data.verified_outcome === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {stepResult.data.verified_outcome}
                            </span>
                          </div>
                          {stepResult.data.bank_utr && stepResult.data.bank_utr !== 'N/A' && (
                            <span className="text-slate-400 block truncate">Bank UTR: {stepResult.data.bank_utr}</span>
                          )}
                        </div>
                      )}

                      {/* Step 9: Measure Impact */}
                      {idx === 8 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-500 block">Recovered</span>
                            <span className="text-emerald-400 font-bold text-xs">{formatter.format(stepResult.data.amount_recovered)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Remaining Risk</span>
                            <span className="text-slate-300 font-bold text-xs">{formatter.format(stepResult.data.remaining_revenue_at_risk)}</span>
                          </div>
                        </div>
                      )}

                      {/* Step 10: Learn & Audit */}
                      {idx === 9 && (
                        <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Audit Log ID:</span>
                            <strong className="text-cyan-300">{stepResult.data.audit_log_id}</strong>
                          </div>
                          <span className="text-emerald-400 block">✓ Telemetry feedback loop recorded</span>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-400 italic mt-1">{stepResult.summary}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (Col span 3): Live Decision Panel & Activity Event Log
        ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          {/* Current Decision Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Current Decision</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                {flowState}
              </span>
            </div>

            {flowState === 'IDLE' ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-2">
                <Bot className="w-8 h-8 mx-auto text-slate-700" />
                <p>Waiting for revenue case to start execution.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Revenue at Risk:</span>
                    <span className="font-mono font-bold text-slate-100">{formatter.format(amount)}</span>
                  </div>

                  {pipelineData && (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Strategy:</span>
                        <span className="font-mono font-bold text-indigo-300">{pipelineData.strategy}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Channel:</span>
                        <span className="font-medium text-emerald-400">{pipelineData.channel}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Final Outcome:</span>
                        <span className={`font-mono font-bold ${pipelineData.is_recovered ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {pipelineData.final_status}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {flowState === 'COMPLETED' && pipelineData && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-2 text-center animate-in zoom-in-95">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">Rescued Revenue</span>
                      <h4 className="text-lg font-bold text-white font-mono">{formatter.format(pipelineData.recovered_amount)}</h4>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {pipelineData.is_recovered
                        ? '100% loss recovered through automated intervention.'
                        : 'Case held safely under risk policy. Zero accidental loss.'}
                    </p>

                    <button
                      onClick={() => navigate('/audit')}
                      className="w-full mt-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Full Audit Trail</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recovery Agent Activity Log Stream */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Activity Feed</h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Live Telemetry</span>
            </div>

            <div className="h-64 overflow-y-auto space-y-2 pr-1 font-mono text-[10px]">
              {activityEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-center">
                  <span>No active telemetry yet</span>
                </div>
              ) : (
                activityEvents.map((evt) => (
                  <div key={evt.id} className="p-1.5 rounded bg-slate-950/70 border border-slate-800/60 leading-relaxed">
                    <div className="flex items-center justify-between text-slate-500 mb-0.5">
                      <span>Step 0{evt.stepNum}</span>
                      <span>{evt.time}</span>
                    </div>
                    <p
                      className={
                        evt.type === 'success'
                          ? 'text-emerald-300 font-semibold'
                          : evt.type === 'warning'
                          ? 'text-amber-300 font-semibold'
                          : evt.type === 'error'
                          ? 'text-rose-400 font-bold'
                          : 'text-slate-300'
                      }
                    >
                      {evt.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={activityEndRef} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
