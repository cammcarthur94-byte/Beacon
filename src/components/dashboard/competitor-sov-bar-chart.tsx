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
  dateRange?: string;
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
  dateRange = 'Last 30 Days',
}: CompetitorSovBarChartProps) {
  const [activeCompetitors, setActiveCompetitors] = React.useState<string[]>([
    'Acme Sync (You)',
    'Competitor Alpha (Omni)',
    'Competitor Beta (Nexus)',
    'Competitor Gamma (Apex)',
  ]);

  const competitorList = React.useMemo(() => {
    return competitors && competitors.length > 0 ? competitors : DEFAULT_COMPETITORS;
  }, [competitors]);

  const topCompetitor = competitorList.find((c) => !c.isUser) || { name: 'Competitor Alpha', share: 26 };
  const leadGap = Math.max(0, userSov - topCompetitor.share);

  // Generate historical timeline data points for SOV over time
  const timelineData = React.useMemo(() => {
    const dates =
      dateRange === 'Last 7 Days'
        ? ['Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27']
        : dateRange === 'Last 90 Days'
        ? ['Jun 01', 'Jun 15', 'Jul 01', 'Jul 15', 'Aug 01', 'Aug 10', 'Aug 18', 'Aug 27']
        : ['Aug 01', 'Aug 05', 'Aug 09', 'Aug 13', 'Aug 17', 'Aug 21', 'Aug 25', 'Aug 27'];

    return dates.map((date, idx) => {
      const progress = (idx + 1) / dates.length;
      // Acme Sync trending up from ~34% to userSov
      const youScore = Math.round(userSov - (1 - progress) * 8 + (Math.sin(idx * 1.5) * 1.5));
      // Alpha steady/slightly dropping from ~29% to 26%
      const alphaScore = Math.round(29 - progress * 3 + (Math.cos(idx * 1.2) * 1));
      // Beta fluctuating around 18%
      const betaScore = Math.round(19 - progress * 1 + (Math.sin(idx * 2) * 1));
      // Gamma steady around 14%
      const gammaScore = Math.round(13 + progress * 1);

      return {
        date,
        'Acme Sync (You)': Math.min(100, Math.max(10, youScore)),
        'Competitor Alpha (Omni)': Math.min(100, Math.max(5, alphaScore)),
        'Competitor Beta (Nexus)': Math.min(100, Math.max(5, betaScore)),
        'Competitor Gamma (Apex)': Math.min(100, Math.max(5, gammaScore)),
      };
    });
  }, [userSov, dateRange]);

  const toggleEntity = (entityName: string) => {
    setActiveCompetitors((prev) => {
      if (prev.includes(entityName)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((n) => n !== entityName);
      }
      return [...prev, entityName];
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
          <p className="font-bold text-[11px] text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 pb-1">
            {label} — Share of Voice
          </p>
          <div className="space-y-1">
            {payload.map((entry: any) => {
              const isUser = entry.name.includes('(You)');
              return (
                <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className={cn('truncate', isUser ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-zinc-300')}>
                      {entry.name.split('(')[0].trim()}
                    </span>
                  </div>
                  <span className="font-bold font-mono text-gray-900 dark:text-white shrink-0">
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
    <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs col-span-1 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Competitor Share of Voice Trend
          </CardTitle>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            +{leadGap}% Lead
          </span>
        </div>
        <CardDescription className="text-xs text-gray-500 dark:text-zinc-400">
          Historical competitor market share & citation displacement overtime
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-3.5">
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
                domain={[0, 50]}
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {competitorList.map((comp) => {
                const isActive = activeCompetitors.includes(comp.name);
                if (!isActive) return null;

                return (
                  <Line
                    key={comp.name}
                    type="monotone"
                    dataKey={comp.name}
                    stroke={comp.color}
                    strokeWidth={comp.isUser ? 3 : 2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 1 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Legend Toggles */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {competitorList.map((comp) => {
            const isActive = activeCompetitors.includes(comp.name);
            return (
              <button
                key={comp.name}
                type="button"
                onClick={() => toggleEntity(comp.name)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer select-none',
                  isActive
                    ? 'bg-gray-50 dark:bg-zinc-800/80 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 shadow-2xs'
                    : 'bg-gray-100/40 dark:bg-zinc-900/40 text-gray-400 dark:text-zinc-600 border-gray-200/50 dark:border-zinc-800/50 line-through opacity-50'
                )}
              >
                <span
                  className={cn('w-2 h-2 rounded-full shrink-0', !isActive && 'grayscale')}
                  style={{ backgroundColor: comp.color }}
                />
                <span>{comp.name.split('(')[0].trim()}</span>
                <span className="font-mono text-[9px] opacity-70">({comp.share}%)</span>
              </button>
            );
          })}
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
        <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-0.5">
          <span>Tracking top 4 market entities</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +3.2% vs #1 competitor
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
