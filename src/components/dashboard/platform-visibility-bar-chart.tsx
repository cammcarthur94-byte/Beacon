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
import { BarChart3, Maximize2, Minimize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';

export interface PlatformScore {
  name: string;
  score: number;
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

export function PlatformVisibilityBarChart({
  data = [],
  activeEngines,
  onToggleEngine,
  dateRange = 'Last 30 Days',
}: PlatformVisibilityBarChartProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const platformList = React.useMemo(() => {
    return [...(data || [])].sort((a, b) => b.score - a.score);
  }, [data]);

  const activeCount = activeEngines ? activeEngines.length : platformList.length;
  const topPlatform = platformList[0] || null;
  const avgScore = platformList.length > 0
    ? (platformList.reduce((acc, curr) => acc + curr.score, 0) / platformList.length).toFixed(1)
    : '0.0';

  // Generate timeline data points from real platform scores
  const timelineData = React.useMemo(() => {
    if (platformList.length === 0) return [];

    const dates =
      dateRange === 'Last 7 Days'
        ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    return dates.map((date) => {
      const row: Record<string, any> = { date };
      platformList.forEach((platform) => {
        row[platform.name] = platform.score;
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
    <>
      <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                  Platform Visibility Breakdown
                </CardTitle>
                {topPlatform && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                    Top: {topPlatform.name} ({topPlatform.score}/100)
                  </span>
                )}
                {platformList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    title="Expand chart"
                    className="p-1 rounded-lg border border-gray-200/80 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer ml-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <CardDescription className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Visibility index per generative engine ({dateRange})
              </CardDescription>
            </div>

            {/* Quick Engine Filter Pill Badges */}
            {onToggleEngine && platformList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {platformList.map((platform) => {
                  const isEnabled = !activeEngines || activeEngines.includes(platform.name);
                  return (
                    <button
                      key={platform.name}
                      type="button"
                      onClick={() => onToggleEngine(platform.name)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                        isEnabled
                          ? 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 font-semibold'
                          : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                      )}
                    >
                      <span
                        className={cn(
                          'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                          isEnabled ? 'scale-125' : 'bg-gray-400 dark:bg-zinc-600'
                        )}
                        style={{ backgroundColor: isEnabled ? platform.color : undefined }}
                      />
                      <span>{platform.name}</span>
                      {isEnabled && <span className="text-[10px] font-mono pl-0.5">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            {platformList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.12)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomLineTooltip />} />

                  {platformList.map((platform) => {
                    const isVisible = !activeEngines || activeEngines.includes(platform.name);
                    if (!isVisible) return null;

                    return (
                      <Line
                        key={platform.name}
                        type="monotone"
                        dataKey={platform.name}
                        stroke={platform.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: platform.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: platform.color, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/30">
                <BarChart3 className="w-8 h-8 text-gray-400 dark:text-zinc-600 mb-2" />
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  No Platform Scores Available
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1 max-w-sm">
                  Run audits across AI answer engines to track individual model visibility curves.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal View */}
      {platformList.length > 0 && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-5xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span>Platform Visibility Index (Expanded View)</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    Engine score trajectories over {dateRange} (0–100 visibility index)
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="h-[420px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} tickMargin={10} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomLineTooltip />} />
                  {platformList.map((platform) => {
                    const isVisible = !activeEngines || activeEngines.includes(platform.name);
                    if (!isVisible) return null;

                    return (
                      <Line
                        key={`expanded-${platform.name}`}
                        type="monotone"
                        dataKey={platform.name}
                        stroke={platform.color}
                        strokeWidth={3}
                        dot={{ r: 4, fill: platform.color, stroke: '#ffffff', strokeWidth: 2 }}
                        activeDot={{ r: 7, fill: platform.color, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
