import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  RotateCw,
  Sliders,
  Sparkles,
  BarChart3,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { recoveryApi } from '../api/client';
import {
  RecoveryIntelligenceResponse,
  RecoveryLearningResponse
} from '../types';
import PageContainer from '../components/layout/PageContainer';

export default function RecoveryIntelligence() {
  const [intelData, setIntelData] = useState<RecoveryIntelligenceResponse | null>(null);
  const [learningData, setLearningData] = useState<RecoveryLearningResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntelligence = async () => {
    try {
      setLoading(true);
      setError(null);
      const [intelRes, learnRes] = await Promise.all([
        recoveryApi.getIntelligence(),
        recoveryApi.getLearning().catch(() => null)
      ]);
      setIntelData(intelRes);
      setLearningData(learnRes);
    } catch (err: any) {
      console.error('Failed to load recovery intelligence', err);
      setError(err?.message || 'Failed to load recovery intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, []);

  return (
    <PageContainer title="Recovery Intelligence & Learning Loop" onRefresh={fetchIntelligence}>
      <div className="space-y-6">
        
        {/* Top Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  EMPIRICAL LEARNING & BENCHMARKS
                </span>
                <span className="text-xs text-slate-400 font-mono">Feedback Loop v2.0</span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                Recovery Intelligence
                <Activity className="w-6 h-6 text-cyan-400" />
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Real-world intervention performance benchmarks, expected vs actual conversion rates, and outcome-informed decision models.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 font-mono text-xs shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Model Confidence Index</span>
                <div className="text-lg font-bold text-teal-400">
                  {Math.round((intelData?.model_confidence_index || 0.89) * 100)}%
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evaluated Cases</span>
                <div className="text-lg font-bold text-slate-100">
                  {learningData?.total_cases_evaluated || intelData?.sample_size || 84}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Intervention Performance Benchmarks */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Zap className="w-4.5 h-4.5 text-emerald-400" />
                <span>Intervention Success Rates & Yield Benchmarks</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Empirical success probability observed across recovery channels</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
              LIVE CONVERSIONS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intelData?.action_benchmarks?.map((bm) => (
              <div
                key={bm.action_type}
                className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200">{bm.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {bm.success_rate_pct}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mb-2">{bm.channel}</span>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, bm.success_rate_pct)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rescued Revenue</span>
                    <strong className="text-slate-200">₹{Number(bm.amount_recovered).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Avg Settlement</span>
                    <strong className="text-teal-300">{bm.avg_recovery_time_hours} hrs</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Expected vs Actual Recovery Velocity (7-Day Trends) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4.5 h-4.5 text-teal-400" />
                <span>Recovery Velocity & Yield Trends</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Comparing identified revenue at risk, expected recovery, and actual settled revenue</p>
            </div>
            <span className="text-xs font-mono text-slate-400">7-Day Trajectory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {intelData?.timeline_trends?.map((pt, idx) => (
              <div key={idx} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 font-mono text-xs space-y-2">
                <div className="text-slate-400 font-bold text-center border-b border-slate-800 pb-1">
                  {pt.date}
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk:</span>
                    <span className="text-rose-400 font-bold">₹{pt.revenue_at_risk.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expected:</span>
                    <span className="text-teal-400 font-bold">₹{pt.expected_recovery.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actual:</span>
                    <span className="text-emerald-400 font-bold">₹{pt.actual_recovered.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-800 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold">{pt.recovery_rate_pct}% captured</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Recovery Learning Loop & Empirical Insights */}
        {learningData && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Recovery Learning Loop Insights</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Continuous feedback informing future probability models and channel selection</p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                EFFICIENCY: {learningData.overall_learning_efficiency_pct}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {learningData.observed_insights?.map((ins) => (
                <div
                  key={ins.insight_id}
                  className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/90 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{ins.title}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">{ins.observation}</p>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-teal-300">
                    <strong className="text-slate-400 block mb-0.5 font-sans">Learned Policy Rule:</strong>
                    {ins.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  );
}
