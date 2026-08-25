import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
  onRefresh?: () => void;
}

export default function PageContainer({ title, children, onRefresh }: PageContainerProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 relative font-sans">
      {/* Background Subtle Gradient Overlay */}
      <div className="fixed top-0 left-0 lg:left-64 right-0 h-80 bg-gradient-to-b from-slate-900/60 via-slate-950/20 to-transparent pointer-events-none z-0" />

      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative z-10">
        <Header
          title={title}
          onRefresh={onRefresh}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

