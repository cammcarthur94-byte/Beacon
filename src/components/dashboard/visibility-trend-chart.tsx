'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Eye, PieChart as PieIcon, MessageSquare, Heart, TrendingUp } from 'lucide-react';

export interface KpiTimeSeriesPoint {
  date: string;
  visibility: number;      // 0 - 100
  shareOfVoice: number;    // 0 - 100 (%)
  mentions: number;        // 0 - 100 (% mention rate or count)
  mentionsRaw?: string;    // e.g. "44/56"
  sentiment: number;       // 0 - 100 (% positive)
}

export type MetricKey = 'visibility' | 'shareOfVoice' | 'mentions' | 'sentiment';

interface MetricConfig {
  key: MetricKey;
  name: string;
  shortName: string;
  color: string;
  gradientId: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  unit: string;
  yDomain: [number, number];
  growthText: string;
  description: string;
}

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  visibility: {
    key: 'visibility',
    name: 'AI Visibility Score Trend',
    shortName: 'AI Visibility',
    color: '#10b981',
    gradientId: 'visSingleGrad',
    icon: Eye,
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    activeBorder: 'border-emerald-300 dark:border-emerald-700',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    unit: '/100',
    yDomain: [0, 100],
    growthText: '+14.7% Growth',
    description: 'Aggregated generative AI visibility index across tracked engines',
  },
  shareOfVoice: {
    key: 'shareOfVoice',
    name: 'AI Share of Voice Trend',
    shortName: 'Share of Voice',
    color: '#3b82f6',
    gradientId: 'sovSingleGrad',
    icon: PieIcon,
    activeBg: 'bg-blue-50 dark:bg-blue-950/60',
    activeBorder: 'border-blue-300 dark:border-blue-700',
    activeText: 'text-blue-700 dark:text-blue-300',
    unit: '%',
    yDomain: [0, 100],
    growthText: '+3.2% vs Competitors',
    description: 'Percentage of generative search brand citations vs. competitors',
  },
  mentions: {
    key: 'mentions',
    name: 'AI Prompt Citations & Mentions',
    shortName: 'AI Mentions',
    color: '#8b5cf6',
    gradientId: 'mentionsSingleGrad',
    icon: MessageSquare,
    activeBg: 'bg-purple-50 dark:bg-purple-950/60',
    activeBorder: 'border-purple-300 dark:border-purple-700',
    activeText: 'text-purple-700 dark:text-purple-300',
    unit: '%',
    yDomain: [0, 100],
    growthText: '+8.5% Citations',
    description: 'Prompt coverage and mention volume across simulated search clusters',
  },
  sentiment: {
    key: 'sentiment',
    name: 'Brand Sentiment Positive Ratio',
    shortName: 'Sentiment',
    color: '#f59e0b',
    gradientId: 'sentimentSingleGrad',
    icon: Heart,
    activeBg: 'bg-amber-50 dark:bg-amber-950/60',
    activeBorder: 'border-amber-300 dark:border-amber-700',
    activeText: 'text-amber-700 dark:text-amber-300',
    unit: '%',
    yDomain: [50, 100],
    growthText: '92% Positive Context',
    description: 'Contextual tone and perception evaluation in generative answers',
  },
};

const DEFAULT_SAMPLE_DATA: KpiTimeSeriesPoint[] = [
  { date: 'Aug 01', visibility: 68, shareOfVoice: 34, mentions: 64, mentionsRaw: '36/56', sentiment: 84 },
  { date: 'Aug 05', visibility: 71, shareOfVoice: 36, mentions: 68, mentionsRaw: '38/56', sentiment: 86 },
  { date: 'Aug 09', visibility: 70, shareOfVoice: 38, mentions: 71, mentionsRaw: '40/56', sentiment: 88 },
  { date: 'Aug 13', visibility: 74, shareOfVoice: 39, mentions: 73, mentionsRaw: '41/56', sentiment: 87 },
  { date: 'Aug 17', visibility: 73, shareOfVoice: 40, mentions: 75, mentionsRaw: '42/56', sentiment: 89 },
  { date: 'Aug 21', visibility: 76, shareOfVoice: 41, mentions: 77, mentionsRaw: '43/56', sentiment: 91 },
  { date: 'Aug 25', visibility: 77, shareOfVoice: 42, mentions: 78, mentionsRaw: '44/56', sentiment: 92 },
  { date: 'Aug 27', visibility: 78, shareOfVoice: 42, mentions: 79, mentionsRaw: '44/56', sentiment: 92 },
];

interface VisibilityTrendChartProps {
  data?: KpiTimeSeriesPoint[];
  dateRange?: string;
  selectedMetric?: MetricKey;
  onSelectMetric?: (key: MetricKey) => void;
}

export function VisibilityTrendChart({
  data = DEFAULT_SAMPLE_DATA,
  dateRange = 'Last 30 Days',
  selectedMetric = 'visibility',
  onSelectMetric,
}: VisibilityTrendChartProps) {
  const currentMetric = METRIC_CONFIGS[selectedMetric] || METRIC_CONFIGS.visibility;
  const chartData = data && data.length > 0 ? data : DEFAULT_SAMPLE_DATA;

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
            <span>{label}, 2026</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Audit Data
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
        </div>
      </CardContent>
    </Card>
  );
}



