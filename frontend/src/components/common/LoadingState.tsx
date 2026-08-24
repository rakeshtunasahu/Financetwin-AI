import React from 'react';
import { RotateCw } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <RotateCw className="w-8 h-8 text-brand-500 animate-spin" />
      <span className="text-sm text-zinc-400 font-medium">Fetching real-time data...</span>
    </div>
  );
}
