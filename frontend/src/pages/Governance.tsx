import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PolicyPanel from '../components/governance/PolicyPanel';
import PolicySimulator from '../components/governance/PolicySimulator';
import PolicyImpact from '../components/governance/PolicyImpact';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Policy, PolicySimulationResponse } from '../types';
import { ShieldCheck, Lock, Sliders, AlertCircle } from 'lucide-react';

export default function Governance() {
  const { currentUser, hasPermission, isRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [simulation, setSimulation] = useState<PolicySimulationResponse | null>(null);

  const fetchPolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Policy>('/api/governance/policy');
      setPolicy(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch policy.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [currentUser]);

  const handleSimulate = async (simValues: Partial<Policy>) => {
    setSimulating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await apiFetch<PolicySimulationResponse>('/api/governance/simulate', {
        method: 'POST',
        body: JSON.stringify(simValues),
      });
      setSimulation(data);
    } catch (err: any) {
      setError(err.message || 'Simulation failed.');
    } finally {
      setSimulating(false);
    }
  };

  const handleApply = async (applyValues: Policy) => {
    setSimulating(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await apiFetch<Policy>('/api/governance/policy', {
        method: 'POST',
        body: JSON.stringify(applyValues),
      });
      setPolicy(data);
      setSimulation(null);
      setSuccessMsg('Governance policy changes applied live to the matching engine.');
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      setError(err.message || 'Failed to apply policy.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <PageContainer title="Governance & Policy Simulation Engine" onRefresh={fetchPolicy}>
      {/* Role Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">Governance Scope: {currentUser.role}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700">
                {currentUser.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRole('RECOVERY_ADMIN')
                ? 'Authorized to simulate parameters and apply live thresholds directly to the recovery & matching engine.'
                : isRole('RECOVERY_MANAGER')
                ? 'Authorized for policy parameter simulation and financial exposure stress testing (Apply disabled).'
                : 'Read-only view of active governance safety limits and guardrail thresholds.'}
            </p>

          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error && !policy ? (
        <ErrorState message={error} onRetry={fetchPolicy} />
      ) : (
        <div className="space-y-6">
          <PolicyPanel policy={policy} />
          
          <PolicySimulator
            policy={policy}
            onSimulate={handleSimulate}
            onApply={handleApply}
            loading={simulating}
          />
          
          {simulation && (
            <PolicyImpact
              before={simulation.before}
              after={simulation.after}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
