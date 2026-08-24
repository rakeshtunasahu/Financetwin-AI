import React from 'react';
import { Database } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  subMessage?: string;
}

export default function EmptyState({ 
  message = 'No records found', 
  subMessage = 'Try triggering a reconciliation run or seeding the dataset.' 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-900/10">
      <Database className="w-8 h-8 text-zinc-700 mb-3" />
      <h3 className="text-sm font-semibold text-zinc-300">{message}</h3>
      <p className="text-xs text-zinc-500 max-w-sm mt-1">{subMessage}</p>
    </div>
  );
}
