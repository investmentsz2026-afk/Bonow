'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
        {children}
      </div>
    );
  }

  const isLandingPage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9] text-gray-900 dark:bg-zinc-950 dark:text-gray-100">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        {!isLandingPage && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <main className={`flex-1 min-w-0 ${isLandingPage ? 'p-0' : 'p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
