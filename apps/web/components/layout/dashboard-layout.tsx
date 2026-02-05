'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { TopNav } from './top-nav';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <TopNav user={user} />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
