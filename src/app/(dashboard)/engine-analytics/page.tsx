'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Radio,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';
import { AI_ENGINE_CONFIGS } from '@/config/ai-models';

interface EnginePerformance {
  key: string;
  name: string;
  model: string;
  provider: string;
  citationRate: number;
  change: string;
  avgLatency: string;
  sentimentScore: number;
  hallucinationRate: number;
  topSourceCategory: string;
  recommendedFocus: string;
  history7d: number[];
}

const ENGINE_DATA: EnginePerformance[] = [
  {
    key: 'claude',
    name: AI_ENGINE_CONFIGS.claude.name,
    model: AI_ENGINE_CONFIGS.claude.displayModel,
    provider: AI_ENGINE_CONFIGS.claude.provider,
    citationRate: 89.4,
    change: '+5.2%',
    avgLatency: '1.0s',
    sentimentScore: 96,
    hallucinationRate: 0.5,
    topSourceCategory: 'Technical Whitepapers & Research',
    recommendedFocus: 'Provide detailed architectural comparison tables and verified benchmarks.',
    history7d: [82.1, 83.5, 85.0, 84.2, 86.8, 88.0, 89.4],
  },
  {
    key: 'chatgpt',
    name: AI_ENGINE_CONFIGS.chatgpt.name,
    model: AI_ENGINE_CONFIGS.chatgpt.displayModel,
    provider: AI_ENGINE_CONFIGS.chatgpt.provider,
    citationRate: 84.2,
    change: '+6.1%',
    avgLatency: '1.2s',
    sentimentScore: 94,
    hallucinationRate: 1.2,
    topSourceCategory: 'Official Documentation & GitHub',
    recommendedFocus: 'Maintain Schema.org JSON-LD and clean technical markdown documentation.',
    history7d: [77.4, 78.9, 81.0, 80.5, 82.3, 83.1, 84.2],
  },
  {
    key: 'perplexity',
    name: AI_ENGINE_CONFIGS.perplexity.name,
    model: AI_ENGINE_CONFIGS.perplexity.displayModel,
    provider: AI_ENGINE_CONFIGS.perplexity.provider,
    citationRate: 86.5,
    change: '+8.4%',
    avgLatency: '0.9s',
    sentimentScore: 91,
    hallucinationRate: 0.8,
    topSourceCategory: 'Tech Media & Publisher Articles',
    recommendedFocus: 'Distribute PR articles across high Domain Authority tech publications.',
    history7d: [76.0, 78.5, 80.2, 82.0, 81.5, 84.7, 86.5],
  },
  {
    key: 'gemini',
    name: AI_ENGINE_CONFIGS.gemini.name,
    model: AI_ENGINE_CONFIGS.gemini.displayModel,
    provider: AI_ENGINE_CONFIGS.gemini.provider,
    citationRate: 74.0,
    change: '+3.8%',
    avgLatency: '1.4s',
    sentimentScore: 89,
    hallucinationRate: 1.9,
    topSourceCategory: 'Analyst Reports & Review Sites',
    recommendedFocus: 'Strengthen G2 and Capterra reviews and Knowledge Graph entity links.',
    history7d: [68.5, 69.8, 70.5, 71.2, 72.0, 72.8, 74.0],
  },
  {
    key: 'copilot',
    name: AI_ENGINE_CONFIGS.copilot.name,
    model: AI_ENGINE_CONFIGS.copilot.displayModel,
    provider: AI_ENGINE_CONFIGS.copilot.provider,
    citationRate: 72.8,
    change: '+3.1%',
    avgLatency: '1.5s',
    sentimentScore: 87,
    hallucinationRate: 2.2,
    topSourceCategory: 'Enterprise Portals & News',
    recommendedFocus: 'Index corporate case studies and Microsoft ecosystem integrations.',
    history7d: [68.0, 69.1, 68.8, 70.4, 69.9, 71.5, 72.8],
  },
];

/**
 * Returns semantic text color for Hallucination Risk metric:
 * < 1%  -> text-green-600
 * 1-2%  -> text-amber-500
 * > 2%  -> text-red-500
 */
function getHallucinationTextColor(rate: number): string {
  if (rate < 1.0) {
    return 'text-green-600 dark:text-green-400';
  }
  if (rate <= 2.0) {
    return 'text-amber-500 dark:text-amber-400';
  }
  return 'text-red-500 dark:text-red-400';
}

/**
 * Inline SVG Sparkline component for visualizing 7-day trajectory.
 */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

function Sparkline({
  data,
  width = 58,
  height = 18,
  color = '#10b981',
  className = '',
}: SparklineProps) {
  const gradientId = React.useId();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 2;
  const usableHeight = height - paddingY * 2;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 4) + 2;
    const y = height - paddingY - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible shrink-0', className)}
      aria-label="7-day trajectory sparkline"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="1.8"
        fill={color}
      />
    </svg>
  );
}

export default function EngineAnalyticsPage() {
  const [viewMode, setViewMode] = React.useState<'card' | 'table'>('card');
  const [queuedEngines, setQueuedEngines] = React.useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleToggleQueue = (engineKey: string, engineName: string) => {
    setQueuedEngines((prev) => {
      const next = new Set(prev);
      if (next.has(engineKey)) {
        next.delete(engineKey);
        setToastMessage(`Removed ${engineName} recommendation from AI Fix Queue`);
      } else {
        next.add(engineKey);
        setToastMessage(`Added recommended action for ${engineName} to AI Fix Queue`);
      }
      return next;
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Research & Intelligence
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Multi-Model Breakdown
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engine Analytics & Citation Placement
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Compare generative search citation rates, latency, and sentiment across individual LLMs.
          </p>
        </div>

        {/* Top Right Controls: Engine Count & View Toggle Group */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-mono text-xs font-semibold">
            5 Active Engines Evaluated
          </span>

          {/* View Toggle Group */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'card'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
              aria-label="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              )}
              aria-label="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Queue Feedback Toast Banner */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <Link
            href="/actions"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline hover:text-emerald-900 dark:hover:text-emerald-100"
          >
            <span>View AI Fix Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* View Mode: Card View */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGINE_DATA.map((eng) => {
            const isQueued = queuedEngines.has(eng.key);
            const hallucinationColor = getHallucinationTextColor(eng.hallucinationRate);

            return (
              <div
                key={eng.key}
                className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
              >
                <div>
                  {/* Card Header with Engine Icon and Inline SVG Sparkline */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <EngineIcon engine={eng.name} size={22} />
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {eng.name}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {eng.model}
                        </p>
                      </div>
                    </div>

                    {/* Inline Sparkline & Trajectory Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Sparkline
                        data={eng.history7d}
                        width={52}
                        height={18}
                        color="#10b981"
                      />
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 font-mono">
                        <TrendingUp className="w-2.5 h-2.5" />
                        {eng.change}
                      </span>
                    </div>
                  </div>

                  {/* Metrics with Tightened Internal Padding (p-2) */}
                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <div className="text-[10px] text-slate-400 font-medium">Citation Rate</div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-tight mt-0.5">
                        {eng.citationRate}%
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <div className="text-[10px] text-slate-400 font-medium">Avg Latency</div>
                      <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-tight mt-0.5">
                        {eng.avgLatency}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <div className="text-[10px] text-slate-400 font-medium">Positive Sentiment</div>
                      <div className="text-base sm:text-lg font-extrabold text-emerald-600 font-mono leading-tight mt-0.5">
                        {eng.sentimentScore}%
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                      <div className="text-[10px] text-slate-400 font-medium">Hallucination Risk</div>
                      <div
                        className={cn(
                          'text-base sm:text-lg font-extrabold font-mono leading-tight mt-0.5',
                          hallucinationColor
                        )}
                      >
                        {eng.hallucinationRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Recommended Action Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Recommended Action</span>
                    </div>
                    {isQueued && (
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Queued
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed line-clamp-2">
                    {eng.recommendedFocus}
                  </p>

                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleQueue(eng.key, eng.name)}
                      className={cn(
                        'w-full h-7.5 px-2.5 text-xs font-medium rounded-lg transition-all cursor-pointer gap-1.5 shadow-2xs',
                        isQueued
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                          : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {isQueued ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Added to Fix Queue</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                          <span>Add to Fix Queue</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode: Table View */
        <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Comprehensive Model Comparison Matrix
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Side-by-side technical benchmarks, latency, risk indicators, and actionable optimization steps
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {ENGINE_DATA.length} engines active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                  <th className="py-3 px-4 w-[20%]">Engine / Model</th>
                  <th className="py-3 px-3 w-[15%] text-center">7-Day Trajectory</th>
                  <th className="py-3 px-3 w-[10%] text-center">Citation Rate</th>
                  <th className="py-3 px-3 w-[10%] text-center">Latency</th>
                  <th className="py-3 px-3 w-[10%] text-center">Sentiment</th>
                  <th className="py-3 px-3 w-[12%] text-center">Hallucination Risk</th>
                  <th className="py-3 px-4 w-[20%]">Primary Source</th>
                  <th className="py-3 px-4 w-[13%] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                {ENGINE_DATA.map((row) => {
                  const isQueued = queuedEngines.has(row.key);
                  const hallucinationColor = getHallucinationTextColor(row.hallucinationRate);

                  return (
                    <tr
                      key={row.key}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Engine / Model */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <EngineIcon engine={row.name} size={20} />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {row.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {row.model}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 7-Day Sparkline */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkline
                            data={row.history7d}
                            width={54}
                            height={18}
                            color="#10b981"
                          />
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 font-mono">
                            {row.change}
                          </span>
                        </div>
                      </td>

                      {/* Citation Rate */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                        {row.citationRate}%
                      </td>

                      {/* Latency */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-zinc-400">
                        {row.avgLatency}
                      </td>

                      {/* Sentiment */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-emerald-600">
                        {row.sentimentScore}%
                      </td>

                      {/* Hallucination Risk */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold">
                        <span className={cn('px-2 py-0.5 rounded-md text-[11px]', hallucinationColor)}>
                          {row.hallucinationRate}%
                        </span>
                      </td>

                      {/* Primary Source */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-zinc-300 text-[11px] truncate max-w-[220px]" title={row.topSourceCategory}>
                        {row.topSourceCategory}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleQueue(row.key, row.name)}
                          className={cn(
                            'h-7 px-2 text-[11px] font-medium rounded-lg transition-all cursor-pointer gap-1 shadow-2xs',
                            isQueued
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                          )}
                        >
                          {isQueued ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Queued</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 text-slate-500" />
                              <span>Add to Fix Queue</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
