'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Eye, PieChart as PieIcon, MessageSquare, Heart } from 'lucide-react';

export interface KpiTimeSeriesPoint {
  date: string;
  visibility: number;      // 0 - 100
  shareOfVoice: number;    // 0 - 100 (%)
  mentions: number;        // 0 - 100 (% mention rate or count)
  mentionsRaw?: string;    // e.g. "44/56"
  sentiment: number;       // 0 - 100 (% positive)
}

interface VisibilityTrendChartProps {
  data?: KpiTimeSeriesPoint[];
  dateRange?: string;
}

type MetricKey = 'visibility' | 'shareOfVoice' | 'mentions' | 'sentiment';

interface MetricConfig {
  key: MetricKey;
  name: string;
  color: string;
  strokeColor: string;
  gradientId: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  dotColor: string;
  unit: string;
}

const METRICS: MetricConfig[] = [
  {
    key: 'visibility',
    name: 'AI Visibility',
    color: '#10b981',
    strokeColor: '#10b981',
    gradientId: 'visibilityGrad',
    icon: Eye,
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    activeBorder: 'border-emerald-300 dark:border-emerald-700',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    dotColor: '#10b981',
    unit: '/100',
  },
  {
    key: 'shareOfVoice',
    name: 'Share of Voice',
    color: '#3b82f6',
    strokeColor: '#3b82f6',
    gradientId: 'sovGrad',
    icon: PieIcon,
    activeBg: 'bg-blue-50 dark:bg-blue-950/60',
    activeBorder: 'border-blue-300 dark:border-blue-700',
    activeText: 'text-blue-700 dark:text-blue-300',
    dotColor: '#3b82f6',
    unit: '%',
  },
  {
    key: 'mentions',
    name: 'AI Mentions',
    color: '#8b5cf6',
    strokeColor: '#8b5cf6',
    gradientId: 'mentionsGrad',
    icon: MessageSquare,
    activeBg: 'bg-purple-50 dark:bg-purple-950/60',
    activeBorder: 'border-purple-300 dark:border-purple-700',
    activeText: 'text-purple-700 dark:text-purple-300',
    dotColor: '#8b5cf6',
    unit: '%',
  },
  {
    key: 'sentiment',
    name: 'Sentiment',
    color: '#f59e0b',
    strokeColor: '#f59e0b',
    gradientId: 'sentimentGrad',
    icon: Heart,
    activeBg: 'bg-amber-50 dark:bg-amber-950/60',
    activeBorder: 'border-amber-300 dark:border-amber-700',
    activeText: 'text-amber-700 dark:text-amber-300',
    dotColor: '#f59e0b',
    unit: '%',
  },
];

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

export function VisibilityTrendChart({
  data = DEFAULT_SAMPLE_DATA,
  dateRange = 'Last 30 Days',
}: VisibilityTrendChartProps) {
  // All 4 metrics active by default
  const [activeMetrics, setActiveMetrics] = React.useState<MetricKey[]>([
    'visibility',
    'shareOfVoice',
    'mentions',
    'sentiment',
  ]);

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev; // keep at least 1 metric active
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const chartData = data && data.length > 0 ? data : DEFAULT_SAMPLE_DATA;

  // Custom hover tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload as KpiTimeSeriesPoint;
      return (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-2 min-w-[210px]">
          <div className="font-semibold text-gray-900 dark:text-zinc-100 border-b border-gray-100 dark:border-zinc-800 pb-1.5 flex items-center justify-between">
            <span>{label}, 2026</span>
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              Audit Snapshot
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            {METRICS.filter((m) => activeMetrics.includes(m.key)).map((m) => {
              let displayVal = `${row[m.key]}${m.unit}`;
              if (m.key === 'mentions' && row.mentionsRaw) {
                displayVal = `${row.mentionsRaw} (${row.mentions}%)`;
              } else if (m.key === 'visibility') {
                displayVal = `${row.visibility}/100`;
              }

              return (
                <div key={m.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-gray-600 dark:text-zinc-400">{m.name}:</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">
                    {displayVal}
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
    <Card className="border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs col-span-1">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                AI Visibility Over Time
              </CardTitle>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                +14.7% Growth
              </span>
            </div>
            <CardDescription className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Historical multi-metric tracking across historical audits ({dateRange})
            </CardDescription>
          </div>

          {/* Line Selection Legend Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {METRICS.map((metric) => {
              const isActive = activeMetrics.includes(metric.key);
              return (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => toggleMetric(metric.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                    isActive
                      ? cn(metric.activeBg, metric.activeBorder, metric.activeText)
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                      isActive ? 'scale-110' : 'bg-gray-400 dark:bg-zinc-600'
                    )}
                    style={{ backgroundColor: isActive ? metric.color : undefined }}
                  />
                  <span>{metric.name}</span>
                  {isActive && <span className="text-[10px] font-mono pl-0.5">✓</span>}
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
                <linearGradient id="visibilityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="mentionsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.10} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Metric 1: Visibility */}
              {activeMetrics.includes('visibility') && (
                <Area
                  type="monotone"
                  dataKey="visibility"
                  name="AI Visibility"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#visibilityGrad)"
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Metric 2: Share of Voice */}
              {activeMetrics.includes('shareOfVoice') && (
                <Area
                  type="monotone"
                  dataKey="shareOfVoice"
                  name="Share of Voice"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sovGrad)"
                  activeDot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Metric 3: Mentions */}
              {activeMetrics.includes('mentions') && (
                <Area
                  type="monotone"
                  dataKey="mentions"
                  name="AI Mentions"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#mentionsGrad)"
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Metric 4: Sentiment */}
              {activeMetrics.includes('sentiment') && (
                <Area
                  type="monotone"
                  dataKey="sentiment"
                  name="Sentiment"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sentimentGrad)"
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


