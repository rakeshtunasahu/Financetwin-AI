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
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Header title={title} onRefresh={onRefresh} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
