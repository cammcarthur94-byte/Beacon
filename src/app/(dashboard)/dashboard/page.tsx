'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterProvider, useFilterContext } from '@/context/filter-context';
import { TopFilterBar } from '@/components/dashboard/top-filter-bar';
import { DualStateTable } from '@/components/dashboard/dual-state-table';

// Mini Bar Sparkline
function MiniBarChart({ values, color = 'blue' }: { values: number[]; color?: 'blue' | 'emerald' | 'amber' }) {
  const max = Math.max(...values, 100);
  const colorMap = {
    blue: 'bg-blue-500/30 group-hover:bg-blue-500/50',
    emerald: 'bg-emerald-500/30 group-hover:bg-emerald-500/50',
    amber: 'bg-amber-500/30 group-hover:bg-amber-500/50',
  };

  return (
    <div className="flex items-end gap-1 h-9 w-16 group">
      {values.map((v, i) => {
        const heightPct = Math.max(15, Math.round((v / max) * 100));
        const isLast = i === values.length - 1;
        return (
          <div
            key={i}
            style={{ height: `${heightPct}%` }}
            className={cn(
              'w-1.5 rounded-xs transition-all duration-300',
              isLast ? (color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500') : colorMap[color]
            )}
          />
        );
      })}
    </div>
  );
}

function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
          Agentic SEO • AEO • GEO audit platform
        </p>
      </div>

      {/* 2. Top Metric Cards (3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Sites Monitored */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Sites Monitored
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
              8
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>4 active monitoring</span>
          </div>
        </div>

        {/* Card 2: Avg. Score with Mini Chart */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Avg. Score
              </span>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
                83
              </div>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5% from last week</span>
            </div>
          </div>
          <div className="pl-4">
            <MiniBarChart values={[55, 62, 58, 70, 75, 80, 83]} color="emerald" />
          </div>
        </div>

        {/* Card 3: Active Issues with Mini Chart */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Active Issues
              </span>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
                79
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium">
              Across all sites
            </div>
          </div>
          <div className="pl-4">
            <MiniBarChart values={[90, 88, 85, 82, 80, 81, 79]} color="blue" />
          </div>
        </div>
      </div>

      {/* 3. Global Interactive Top Filter Bar */}
      <TopFilterBar />

      {/* 4. Dual-State Table (Domain View vs Competitor Matchup) */}
      <DualStateTable />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <FilterProvider>
      <DashboardContent />
    </FilterProvider>
  );
}
