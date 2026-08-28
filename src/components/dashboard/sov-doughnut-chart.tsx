'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SovDoughnutChartProps {
  userSov?: number; // e.g. 42
  competitorSov?: number; // e.g. 58
  competitorBreakdown?: {
    name: string;
    share: number;
    color: string;
  }[];
  brandName?: string;
}

export function SovDoughnutChart({
  userSov = 42,
  competitorSov = 58,
  competitorBreakdown = [
    { name: 'Competitor Alpha (Omni)', share: 26, color: '#64748b' },
    { name: 'Competitor Beta (Nexus)', share: 18, color: '#94a3b8' },
    { name: 'Competitor Gamma (Apex)', share: 14, color: '#cbd5e1' },
  ],
  brandName = 'Acme Sync (You)',
}: SovDoughnutChartProps) {
  const chartData = [
    { name: brandName, value: userSov, color: '#3b82f6' },
    { name: 'Competitors Combined', value: competitorSov, color: '#64748b' },
  ];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1 min-w-[170px]">
          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-zinc-100">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.payload.color }} />
            <span>{item.name}</span>
          </div>
          <div className="text-gray-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Share of Voice:</span>
            <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{item.value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs col-span-1 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            AI Share of Voice (User vs. Competitors)
          </CardTitle>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            100% Total
          </span>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
          Compare your brand&apos;s presence against competitors
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
        {/* Doughnut Graphic with Center Readout */}
        <div className="relative h-[200px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-mono">
              {userSov}%
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              User SOV
            </span>
          </div>
        </div>

        {/* Legend & Breakdown Segment summary */}
        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-zinc-100">{brandName}</span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono text-xs">{userSov}% SOV</span>
          </div>

          <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
              <span className="font-medium text-gray-700 dark:text-zinc-300">All Competitors Combined</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-zinc-100 font-mono text-xs">{competitorSov}% SOV</span>
          </div>
        </div>

        {/* Subtle Description Subtext */}
        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-1">
          <span>Market presence ratio</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +3.2% vs competitors
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
