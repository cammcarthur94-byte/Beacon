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
import { BarChart3, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlatformScore {
  name: string;
  score: number; // 0 - 100
  color: string;
  mentions?: number;
  mentionRate?: number;
}

interface PlatformVisibilityBarChartProps {
  data?: PlatformScore[];
  activeEngines?: string[];
  onToggleEngine?: (engineName: any) => void;
}


const DEFAULT_PLATFORMS: PlatformScore[] = [
  { name: 'ChatGPT', score: 86, color: '#10a37f', mentionRate: 78 },
  { name: 'Perplexity', score: 92, color: '#06b6d4', mentionRate: 88 },
  { name: 'Gemini', score: 74, color: '#3b82f6', mentionRate: 68 },
  { name: 'Claude', score: 81, color: '#f59e0b', mentionRate: 74 },
  { name: 'Copilot', score: 68, color: '#8b5cf6', mentionRate: 62 },
];

export function PlatformVisibilityBarChart({
  data = DEFAULT_PLATFORMS,
  activeEngines,
  onToggleEngine,
}: PlatformVisibilityBarChartProps) {
  // Sort platforms from highest to lowest score
  const chartData = React.useMemo(() => {
    const raw = data && data.length > 0 ? data : DEFAULT_PLATFORMS;
    return [...raw].sort((a, b) => b.score - a.score);
  }, [data]);

  const activeCount = activeEngines ? activeEngines.length : chartData.length;
  const topPlatform = chartData[0] || { name: 'Perplexity', score: 92 };
  const avgScore = chartData.length > 0
    ? (chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length).toFixed(1)
    : '80.0';

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as PlatformScore;
      const isEngineActive = !activeEngines || activeEngines.some((ae) => ae.toLowerCase() === item.name.toLowerCase());
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-1 mb-1 font-semibold text-gray-900 dark:text-zinc-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">{item.score}/100</span>
          </div>
          {item.mentionRate !== undefined && (
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Mention Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-zinc-100 font-mono">{item.mentionRate}%</span>
            </div>
          )}
          <div className="flex justify-between text-[11px] text-gray-400 dark:text-zinc-500 pt-0.5 border-t border-gray-100 dark:border-zinc-800">
            <span>Filter Status:</span>
            <span className={cn('font-semibold font-mono', isEngineActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-zinc-500')}>
              {isEngineActive ? 'Active Engine' : 'Excluded'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (entry: any) => {
    if (entry && entry.name && onToggleEngine) {
      onToggleEngine(entry.name);
    }
  };

  return (
    <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs col-span-1 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Brand Visibility by Platform
          </CardTitle>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            Scale /100
          </span>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
          Ranked from highest to lowest visibility score (click to toggle)
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
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
                domain={[0, 100]}
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
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={85}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="score"
                radius={[0, 6, 6, 0]}
                barSize={20}
                className="cursor-pointer"
                onClick={handleBarClick}
              >
                {chartData.map((entry, index) => {
                  const isEngineActive = !activeEngines || activeEngines.some((ae) => ae.toLowerCase() === entry.name.toLowerCase());
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={isEngineActive ? 1 : 0.25}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mini stats summary below chart */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-lg bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50">
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Top Performing</div>
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
              {topPlatform.name} ({topPlatform.score}/100)
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50">
            <div className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">Average Index</div>
            <div className="text-xs font-bold text-gray-900 dark:text-zinc-100 mt-0.5 font-mono">
              {avgScore} / 100
            </div>
          </div>
        </div>

        {/* Subtle Description Subtext */}
        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-1">
          <span>Benchmarked across active engines</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {activeCount} Active {activeCount === 1 ? 'Model' : 'Models'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}


