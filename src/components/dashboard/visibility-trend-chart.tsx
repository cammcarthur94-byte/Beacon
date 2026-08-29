'use client';

import * as React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Eye, PieChart, MessageSquare, HeartHandshake, Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export type MetricKey = 'visibility' | 'shareOfVoice' | 'mentions' | 'sentiment';

export interface KpiTimeSeriesPoint {
  date: string;
  visibility: number;
  shareOfVoice: number;
  mentions: number;
  mentionsRaw?: string;
  sentiment: number;
}

interface MetricConfig {
  key: MetricKey;
  name: string;
  shortName: string;
  unit: string;
  color: string;
  gradientId: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  icon: React.ComponentType<{ className?: string }>;
  yDomain: [number, number];
  growthText: string;
  description: string;
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  visibility: {
    key: 'visibility',
    name: 'AI Visibility Score',
    shortName: 'Visibility',
    unit: '/100',
    color: '#2563eb', // Blue
    gradientId: 'colorVisibility',
    activeBg: 'bg-blue-50 dark:bg-blue-950/60',
    activeBorder: 'border-blue-300 dark:border-blue-700',
    activeText: 'text-blue-700 dark:text-blue-300',
    icon: Eye,
    yDomain: [0, 100],
    growthText: 'Tracked Score',
    description: 'Overall presence across generative engines & answer blocks',
  },
  shareOfVoice: {
    key: 'shareOfVoice',
    name: 'AI Share of Voice',
    shortName: 'Share of Voice',
    unit: '%',
    color: '#8b5cf6', // Purple
    gradientId: 'colorSov',
    activeBg: 'bg-purple-50 dark:bg-purple-950/60',
    activeBorder: 'border-purple-300 dark:border-purple-700',
    activeText: 'text-purple-700 dark:text-purple-300',
    icon: PieChart,
    yDomain: [0, 100],
    growthText: 'Market Share',
    description: 'Proportion of AI answers referencing your brand vs competitors',
  },
  mentions: {
    key: 'mentions',
    name: 'AI Mention Rate',
    shortName: 'Mentions',
    unit: '%',
    color: '#10b981', // Emerald
    gradientId: 'colorMentions',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    activeBorder: 'border-emerald-300 dark:border-emerald-700',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    icon: MessageSquare,
    yDomain: [0, 100],
    growthText: 'Frequency',
    description: 'Percentage of audited queries containing target brand mentions',
  },
  sentiment: {
    key: 'sentiment',
    name: 'Brand Sentiment',
    shortName: 'Sentiment',
    unit: '%',
    color: '#f59e0b', // Amber
    gradientId: 'colorSentiment',
    activeBg: 'bg-amber-50 dark:bg-amber-950/60',
    activeBorder: 'border-amber-300 dark:border-amber-700',
    activeText: 'text-amber-700 dark:text-amber-300',
    icon: HeartHandshake,
    yDomain: [0, 100],
    growthText: 'Net Positive',
    description: 'Contextual tone and perception evaluation in generative answers',
  },
};

interface VisibilityTrendChartProps {
  data?: KpiTimeSeriesPoint[];
  dateRange?: string;
  selectedMetric?: MetricKey;
  onSelectMetric?: (key: MetricKey) => void;
}

export function VisibilityTrendChart({
  data = [],
  dateRange = 'Last 30 Days',
  selectedMetric = 'visibility',
  onSelectMetric,
}: VisibilityTrendChartProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentMetric = METRIC_CONFIGS[selectedMetric] || METRIC_CONFIGS.visibility;
  const chartData = data && data.length > 0 ? data : [];

  // Custom hover tooltip for the single selected metric
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload as KpiTimeSeriesPoint;
      const rawVal = row[selectedMetric];
      let displayFormatted = `${rawVal}${currentMetric.unit}`;
      if (selectedMetric === 'mentions' && row.mentionsRaw) {
        displayFormatted = `${row.mentionsRaw} (${rawVal}%)`;
      } else if (selectedMetric === 'visibility') {
        displayFormatted = `${rawVal}/100`;
      }

      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="font-semibold text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Live Audit Data
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentMetric.color }} />
              <span className="font-medium text-gray-600 dark:text-zinc-300">{currentMetric.shortName}:</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono text-sm">
              {displayFormatted}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs col-span-1">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                  {currentMetric.name}
                </CardTitle>
                <span className={cn(
                  'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                  currentMetric.activeBg,
                  currentMetric.activeBorder,
                  currentMetric.activeText
                )}>
                  {currentMetric.growthText}
                </span>
                {chartData.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    title="Expand graph"
                    className="p-1 rounded-lg border border-gray-200/80 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer ml-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <CardDescription className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                {currentMetric.description} ({dateRange})
              </CardDescription>
            </div>

            {/* Metric Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(Object.keys(METRIC_CONFIGS) as MetricKey[]).map((key) => {
                const m = METRIC_CONFIGS[key];
                const isSelected = selectedMetric === key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => onSelectMetric?.(m.key)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                      isSelected
                        ? cn(m.activeBg, m.activeBorder, m.activeText, 'font-semibold')
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                        isSelected ? 'scale-125' : 'bg-gray-400 dark:bg-zinc-600'
                      )}
                      style={{ backgroundColor: isSelected ? m.color : undefined }}
                    />
                    <span>{m.shortName}</span>
                    {isSelected && <span className="text-[10px] font-mono pl-0.5">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={currentMetric.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

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
                    domain={currentMetric.yDomain}
                    tickFormatter={(val) => (currentMetric.unit === '/100' ? `${val}` : `${val}%`)}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    name={currentMetric.shortName}
                    stroke={currentMetric.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${currentMetric.gradientId})`}
                    activeDot={{ r: 6, fill: currentMetric.color, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-950/30">
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  No historical trend points recorded for {dateRange}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1 max-w-sm">
                  Run an audit or track queries across AI engines to populate live telemetry over time.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Modal Dialog */}
      {chartData.length > 0 && (
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent className="max-w-5xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
            <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{currentMetric.name} (Expanded View)</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    {currentMetric.description} — Live telemetry ({dateRange})
                  </DialogDescription>
                </div>

                {/* Metric Selector Pills inside modal */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(Object.keys(METRIC_CONFIGS) as MetricKey[]).map((key) => {
                    const m = METRIC_CONFIGS[key];
                    const isSelected = selectedMetric === key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => onSelectMetric?.(m.key)}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                          isSelected
                            ? cn(m.activeBg, m.activeBorder, m.activeText, 'font-semibold')
                            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                        )}
                      >
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full inline-block',
                            isSelected ? 'scale-125' : 'bg-gray-400 dark:bg-zinc-600'
                          )}
                          style={{ backgroundColor: isSelected ? m.color : undefined }}
                        />
                        <span>{m.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DialogHeader>

            {/* Large High-Res Canvas */}
            <div className="h-[420px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`modal_${currentMetric.gradientId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.32} />
                      <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(150,150,150,0.2)' }}
                    tickMargin={10}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={currentMetric.yDomain}
                    tickFormatter={(val) => (currentMetric.unit === '/100' ? `${val}` : `${val}%`)}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey={selectedMetric}
                    name={currentMetric.shortName}
                    stroke={currentMetric.color}
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill={`url(#modal_${currentMetric.gradientId})`}
                    dot={{ r: 4, fill: currentMetric.color, stroke: '#ffffff', strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: currentMetric.color, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
