'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';

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
  dateRange?: string;
}

const DEFAULT_PLATFORMS: PlatformScore[] = [
  { name: 'Perplexity', score: 92, color: '#06b6d4', mentionRate: 88 },
  { name: 'ChatGPT', score: 86, color: '#10a37f', mentionRate: 78 },
  { name: 'Claude', score: 81, color: '#f59e0b', mentionRate: 74 },
  { name: 'Gemini', score: 74, color: '#3b82f6', mentionRate: 68 },
  { name: 'Copilot', score: 68, color: '#8b5cf6', mentionRate: 62 },
];

export function PlatformVisibilityBarChart({
  data = DEFAULT_PLATFORMS,
  activeEngines,
  onToggleEngine,
  dateRange = 'Last 30 Days',
}: PlatformVisibilityBarChartProps) {
  const platformList = React.useMemo(() => {
    const raw = data && data.length > 0 ? data : DEFAULT_PLATFORMS;
    return [...raw].sort((a, b) => b.score - a.score);
  }, [data]);

  const activeCount = activeEngines ? activeEngines.length : platformList.length;
  const topPlatform = platformList[0] || { name: 'Perplexity', score: 92 };
  const avgScore = platformList.length > 0
    ? (platformList.reduce((acc, curr) => acc + curr.score, 0) / platformList.length).toFixed(1)
    : '80.2';

  // Generate historical timeline data points for Platform Visibility over time
  const timelineData = React.useMemo(() => {
    const dates =
      dateRange === 'Last 7 Days'
        ? ['Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27']
        : dateRange === 'Last 90 Days'
        ? ['Jun 01', 'Jun 15', 'Jul 01', 'Jul 15', 'Aug 01', 'Aug 10', 'Aug 18', 'Aug 27']
        : ['Aug 01', 'Aug 05', 'Aug 09', 'Aug 13', 'Aug 17', 'Aug 21', 'Aug 25', 'Aug 27'];

    return dates.map((date, idx) => {
      const progress = (idx + 1) / dates.length;

      const row: Record<string, any> = { date };
      platformList.forEach((platform) => {
        // Base score with historical ramp-up curve and subtle organic variation
        const startScore = platform.score - 10;
        const current = Math.round(startScore + progress * 10 + Math.sin(idx * 1.3 + platform.score) * 2);
        row[platform.name] = Math.min(100, Math.max(20, current));
      });

      return row;
    });
  }, [platformList, dateRange]);

  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px]">
          <p className="font-bold text-[11px] text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 pb-1">
            {label} — Visibility Score
          </p>
          <div className="space-y-1">
            {payload.map((entry: any) => (
              <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <EngineIcon engine={entry.name} size={12} />
                  <span className="text-gray-700 dark:text-zinc-300 truncate font-medium">
                    {entry.name}
                  </span>
                </div>
                <span className="font-bold font-mono text-gray-900 dark:text-white shrink-0">
                  {entry.value}/100
                </span>
              </div>
            ))}
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
            <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Brand Visibility by Platform Trend
          </CardTitle>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            Scale /100
          </span>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
          Ranked visibility scores tracked across generative AI models overtime
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
        {/* Multi-Line Chart Canvas */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={timelineData}
              margin={{ top: 8, right: 12, left: -20, bottom: 2 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.12)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomLineTooltip />} />
              
              {platformList.map((platform) => {
                const isEngineActive =
                  !activeEngines ||
                  activeEngines.some((ae) => ae.toLowerCase() === platform.name.toLowerCase());

                if (!isEngineActive) return null;

                return (
                  <Line
                    key={platform.name}
                    type="monotone"
                    dataKey={platform.name}
                    stroke={platform.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 1 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Engine Legend Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
          {platformList.map((platform) => {
            const isEngineActive =
              !activeEngines ||
              activeEngines.some((ae) => ae.toLowerCase() === platform.name.toLowerCase());

            return (
              <button
                key={platform.name}
                type="button"
                onClick={() => onToggleEngine && onToggleEngine(platform.name)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer select-none',
                  isEngineActive
                    ? 'bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 shadow-2xs'
                    : 'bg-gray-100/40 dark:bg-zinc-900/40 text-gray-400 dark:text-zinc-600 border-gray-200/50 dark:border-zinc-800/50 line-through opacity-50'
                )}
              >
                <EngineIcon
                  engine={platform.name}
                  size={11}
                  className={!isEngineActive ? 'grayscale opacity-40' : ''}
                />
                <span>{platform.name}</span>
                <span className="font-mono text-[9px] opacity-70">({platform.score})</span>
              </button>
            );
          })}
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
        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-0.5">
          <span>Benchmarked across active engines</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {activeCount} Active {activeCount === 1 ? 'Model' : 'Models'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}


