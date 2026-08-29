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
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, ShieldCheck, ArrowUpRight, Maximize2, Minimize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface CompetitorShareItem {
  name: string;
  share: number;
  color: string;
  isUser?: boolean;
  delta?: string;
  domain?: string;
}

interface CompetitorSovBarChartProps {
  userSov?: number;
  brandName?: string;
  competitors?: CompetitorShareItem[];
  dateRange?: string;
}

export function CompetitorSovBarChart({
  userSov = 0,
  brandName = 'Your Brand',
  competitors = [],
  dateRange = 'Last 30 Days',
}: CompetitorSovBarChartProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeCompetitors, setActiveCompetitors] = React.useState<string[]>([]);

  const competitorList = React.useMemo(() => {
    return competitors || [];
  }, [competitors]);

  React.useEffect(() => {
    if (competitorList.length > 0) {
      setActiveCompetitors(competitorList.map((c) => c.name));
    }
  }, [competitorList]);

  const topCompetitor = competitorList.find((c) => !c.isUser) || { name: 'Competitor', share: 0 };
  const leadGap = Math.max(0, userSov - topCompetitor.share);

  // Generate timeline data points from real SOV values
  const timelineData = React.useMemo(() => {
    if (competitorList.length === 0) return [];

    const dates =
      dateRange === 'Last 7 Days'
        ? ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
        : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

    return dates.map((date) => {
      const row: Record<string, any> = { date };
      competitorList.forEach((c) => {
        row[c.name] = c.share;
      });
      return row;
    });
  }, [competitorList, dateRange]);

  const toggleEntity = (entityName: string) => {
    setActiveCompetitors((prev) => {
      if (prev.includes(entityName)) {
        if (prev.length === 1) return prev;
        return prev.filter((n) => n !== entityName);
      }
      return [...prev, entityName];
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[220px]">
          <div className="font-semibold text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] font-mono text-gray-400">Share of Voice</span>
          </div>

          <div className="space-y-1.5">
            {payload.map((entry: any, i: number) => {
              const comp = competitorList.find((c) => c.name === entry.name);
              return (
                <div key={`tt-${i}`} className="flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className={cn('truncate', comp?.isUser ? 'font-bold text-gray-900 dark:text-zinc-100' : 'text-gray-600 dark:text-zinc-400')}>
                      {entry.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-900 dark:text-zinc-100">
                    {entry.value}%
                  </span>
                </div>
              );
            })}
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
                  Competitive Share of Voice (SOV)
                </CardTitle>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                  {userSov}% Target Share
                </span>
                {competitorList.length > 0 && (
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
                Market share percentage across audited AI answer engines ({dateRange})
              </CardDescription>
            </div>

            {/* Entity Toggle Filter Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {competitorList.map((c) => {
                const isSelected = activeCompetitors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleEntity(c.name)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 font-semibold'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                        isSelected ? 'scale-125' : 'bg-gray-400 dark:bg-zinc-600'
                      )}
                      style={{ backgroundColor: isSelected ? c.color : undefined }}
                    />
                    <span className="truncate max-w-[100px]">{c.name}</span>
                    {isSelected && <span className="text-[10px] font-mono pl-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            {competitorList.length > 0 ? (
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
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {competitorList.map((c) => {
                    if (!activeCompetitors.includes(c.name)) return null;
                    return (
                      <Line
                        key={c.name}
                        type="monotone"
                        dataKey={c.name}
                        name={c.name}
                        stroke={c.color}
                        strokeWidth={c.isUser ? 3.5 : 2}
                        dot={{ r: c.isUser ? 4 : 2, fill: c.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 6, fill: c.color, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/30">
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  No Competitor Share of Voice Data
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1 max-w-sm">
                  Add competitors in Brand Kit and run audits to track market share over time.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal */}
      {competitorList.length > 0 && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-5xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Competitive Share of Voice (Expanded View)</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    Detailed multi-entity visibility comparisons over {dateRange}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="h-[420px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} tickMargin={10} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  {competitorList.map((c) => {
                    if (!activeCompetitors.includes(c.name)) return null;
                    return (
                      <Line
                        key={`modal-${c.name}`}
                        type="monotone"
                        dataKey={c.name}
                        name={c.name}
                        stroke={c.color}
                        strokeWidth={c.isUser ? 4 : 2.5}
                        dot={{ r: 4, fill: c.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                        activeDot={{ r: 7, fill: c.color, stroke: '#ffffff', strokeWidth: 2 }}
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
