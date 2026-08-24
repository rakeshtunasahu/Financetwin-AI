import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import ExceptionDetail from '../components/exceptions/ExceptionDetail';
import EvidencePanel from '../components/exceptions/EvidencePanel';
import AIInvestigationPanel from '../components/exceptions/AIInvestigationPanel';
import AuditTimeline from '../components/exceptions/AuditTimeline';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { apiFetch } from '../api/client';
import { ExceptionDetail as DetailType } from '../types';

export default function ExceptionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailType | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DetailType>(`/api/exceptions/${id}`);
      setDetail(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load exception details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <PageContainer title="Exception Investigation Case">
        <LoadingState />
      </PageContainer>
    );
  }

  if (error || !detail) {
    return (
      <PageContainer title="Exception Investigation Case">
        <ErrorState message={error || 'Failed to fetch details.'} onRetry={fetchDetail} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Exception Case: ${detail.exception_id}`} onRefresh={fetchDetail}>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate('/exceptions')}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Command Center
        </button>
      </div>

      <div className="space-y-6">
        <ExceptionDetail detail={detail} />
        
        <EvidencePanel detail={detail} />
        
        <AIInvestigationPanel
          exceptionId={detail.exception_id}
          initialInvestigation={detail.ai_investigation}
          onInvestigated={(data) => {
            setDetail((prev) => prev ? { ...prev, ai_investigation: data } : null);
            fetchDetail();
          }}
        />
        
        <AuditTimeline logs={detail.audit_history} />
      </div>
    </PageContainer>
  );
}
