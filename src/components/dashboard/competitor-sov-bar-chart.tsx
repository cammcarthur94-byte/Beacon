'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CompetitorShareItem {
  name: string;
  share: number; // percentage
  color: string;
  isUser?: boolean;
  delta?: string;
  domain?: string;
}

interface CompetitorSovBarChartProps {
  userSov?: number; // e.g. 42
  brandName?: string;
  competitors?: CompetitorShareItem[];
}

const DEFAULT_COMPETITORS: CompetitorShareItem[] = [
  { name: 'Acme Sync (You)', share: 42, color: '#3b82f6', isUser: true, delta: '+3.2%', domain: 'acmelabs.com' },
  { name: 'Competitor Alpha (Omni)', share: 26, color: '#8b5cf6', isUser: false, delta: '-1.4%', domain: 'omnisync.com' },
  { name: 'Competitor Beta (Nexus)', share: 18, color: '#06b6d4', isUser: false, delta: '-0.8%', domain: 'nexusai.io' },
  { name: 'Competitor Gamma (Apex)', share: 14, color: '#f59e0b', isUser: false, delta: '+0.5%', domain: 'apexplatform.com' },
];

export function CompetitorSovBarChart({
  userSov = 42,
  brandName = 'Acme Sync (You)',
  competitors = DEFAULT_COMPETITORS,
}: CompetitorSovBarChartProps) {
  // Ensure chart data is sorted from highest share to lowest share
  const chartData = React.useMemo(() => {
    const data = competitors && competitors.length > 0 ? competitors : DEFAULT_COMPETITORS;
    return [...data].sort((a, b) => b.share - a.share);
  }, [competitors]);

  const topCompetitor = chartData.find((c) => !c.isUser) || { name: 'Competitor Alpha', share: 26 };
  const leadGap = Math.max(0, userSov - topCompetitor.share);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as CompetitorShareItem;
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1 mb-1 font-semibold text-gray-900 dark:text-zinc-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{item.share}%</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-zinc-400">
            <span>Market Lead Status:</span>
            <span className={cn('font-semibold font-mono', item.isUser ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-zinc-300')}>
              {item.isUser ? `Leader (+${leadGap}% gap)` : `-${Math.abs(userSov - item.share)}% vs you`}
            </span>
          </div>
          {item.domain && (
            <div className="flex justify-between text-[11px] text-gray-400 dark:text-zinc-500">
              <span>Domain:</span>
              <span className="font-mono">{item.domain}</span>
            </div>
          )}
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
            Competitor Share of Voice Breakdown
          </CardTitle>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            +{leadGap}% Lead
          </span>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
          Actionable competitor market share & citation displacement analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Horizontal Bar Chart */}
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.12)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 50]}
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={125}
                tickFormatter={(name: string) => name.split('(')[0].trim()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="share" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Structured summary row */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50">
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Your Dominance</div>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5 font-mono">
              {userSov}% Total SOV
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50">
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Competitors Combined</div>
            <div className="text-xs font-bold text-gray-900 dark:text-zinc-100 mt-0.5 font-mono">
              {100 - userSov}% Total SOV
            </div>
          </div>
        </div>

        {/* Subtle Description Subtext */}
        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-1">
          <span>Tracking top 4 market entities</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +3.2% vs #1 competitor
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
