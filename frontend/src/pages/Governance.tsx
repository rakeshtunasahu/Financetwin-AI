import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import PolicyPanel from '../components/governance/PolicyPanel';
import PolicySimulator from '../components/governance/PolicySimulator';
import PolicyImpact from '../components/governance/PolicyImpact';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { Policy, PolicySimulationResponse } from '../types';

export default function Governance() {
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  const handleSimulate = async (simValues: Partial<Policy>) => {
    setSimulating(true);
    setError(null);
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
    try {
      const data = await apiFetch<Policy>('/api/governance/policy', {
        method: 'POST',
        body: JSON.stringify(applyValues),
      });
      setPolicy(data);
      setSimulation(null);
      alert('Governance policy changes applied live to the matching engine.');
    } catch (err: any) {
      setError(err.message || 'Failed to apply policy.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <PageContainer title="Governance & Policy Simulation Engine" onRefresh={fetchPolicy}>
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

