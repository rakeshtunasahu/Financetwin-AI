import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function PageContainer({ title, children, onRefresh }: PageContainerProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 relative">
      {/* Background Glow Overlay */}
      <div className="fixed top-0 left-64 w-[calc(100vw-16rem)] h-96 bg-gradient-to-b from-brand-500/5 via-transparent to-transparent pointer-events-none z-0" />

      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative z-10">
        <Header title={title} onRefresh={onRefresh} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
