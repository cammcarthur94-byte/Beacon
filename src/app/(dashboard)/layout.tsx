'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { FilterProvider } from '@/context/filter-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 print:bg-white print:text-black">
        {/* Fixed/Sticky Left Sidebar */}
        <Sidebar />

        {/* Main Content Shell with Rounded Separation */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-zinc-950 print:bg-white">
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 md:rounded-tl-2xl border-t md:border-l border-gray-200/80 dark:border-zinc-800/80 shadow-xs min-h-screen print:border-none print:shadow-none print:rounded-none print:bg-white">
            <Header />
            <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 print:p-0 print:m-0 print:max-w-none">
              {children}
            </main>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

