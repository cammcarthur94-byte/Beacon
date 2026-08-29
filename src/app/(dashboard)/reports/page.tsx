'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Shield,
  Layers,
  Calendar,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getReportsData, ReportsData } from '@/lib/actions/reports';
import { EngineIcon } from '@/components/ui/engine-icon';

import Link from 'next/link';

export default function ReportsPage() {
  const [data, setData] = React.useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getReportsData();
      setData(res);
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <RotateCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Compiling executive visibility and citation report...
        </span>
      </div>
    );
  }

  const { executiveSummary, trendTimeline, shareOfVoice, blindSpotMatrix, actionItems } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 print:p-0 print:m-0 print:max-w-none print:space-y-4">
      
      {/* ========================================================================= */}
      {/* Print-Only Executive Cover Header */}
      {/* ========================================================================= */}
      <div className="hidden print:flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight text-slate-900">BEACON</div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Generative Engine Optimization (GEO) • Executive Report
            </div>
          </div>
        </div>

        <div className="text-right text-xs space-y-0.5 font-mono">
          <div><strong>Target:</strong> {data.brandName} ({data.primaryDomain})</div>
          <div className="text-slate-500"><strong>Generated:</strong> {data.generatedAt}</div>
          <div className="text-slate-500"><strong>Period:</strong> {data.dateRange}</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Top Header & Export Controls (Screen Mode) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Executive Intelligence
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              {data.dateRange}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            AI Visibility & GEO Performance Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Comprehensive audit snapshot for <strong className="text-slate-900 dark:text-zinc-200">{data.brandName}</strong> across OpenAI, Perplexity, Gemini, Claude, and Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <Button
            asChild
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2 shadow-sm cursor-pointer"
          >
            <Link href="/reports/default">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Executive Audit (Gemini 3.7)</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-9 px-3 rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <a
            href="/api/export"
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Serverless PDF</span>
          </a>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="h-9 px-4 rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Executive Summary: 4 Top-Level KPI Cards with Sparklines */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3">
        {Object.entries(executiveSummary).map(([key, kpi]) => {
          const sparklineData = kpi.sparkline.map((val, idx) => ({ idx, val }));

          return (
            <div
              key={key}
              className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 flex flex-col justify-between space-y-3 print:border-slate-300 print:shadow-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  {kpi.title}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  {kpi.change}
                </span>
              </div>

              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    {kpi.subtitle}
                  </div>
                </div>

                {/* Mini Sparkline Chart */}
                <div className="w-20 h-10 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="val"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 2. Middle Row: Stacked Area Trend & Competitive Share of Voice */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:grid-cols-12 print:gap-4 items-start">
        
        {/* Left (8 Cols): Stacked Area Trend Chart */}
        <div className="lg:col-span-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4 print:col-span-8 print:border-slate-300 print:shadow-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Multi-Engine Visibility Trendline</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                  5 Engines
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Weekly historical citation capture percentage by generative AI model
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="repChatGpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="repPerplexity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="repGemini" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="repClaude" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-800 space-y-1.5 font-mono">
                          <div className="font-bold text-indigo-400">{label} Visibility</div>
                          {payload.map((item: any) => (
                            <div key={item.dataKey} className="flex items-center justify-between gap-4 text-[11px]">
                              <span className="capitalize text-slate-300">{item.dataKey}:</span>
                              <span className="font-bold text-white">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="chatgpt" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#repChatGpt)" />
                <Area type="monotone" dataKey="perplexity" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#repPerplexity)" />
                <Area type="monotone" dataKey="gemini" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#repGemini)" />
                <Area type="monotone" dataKey="claude" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#repClaude)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>ChatGPT (84%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span>Perplexity (86%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Gemini (72%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Claude (69%)</span>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): Share of Voice Donut Chart */}
        <div className="lg:col-span-4 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4 print:col-span-4 print:border-slate-300 print:shadow-none">
          <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Competitive Share of Voice
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Brand mention volume vs benchmark competitors
            </p>
          </div>

          <div className="relative h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shareOfVoice}
                  dataKey="sov"
                  nameKey="entity"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {shareOfVoice.map((entry, index) => (
                    <Cell key={`sov-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl font-mono">
                          <div className="font-bold">{item.entity}</div>
                          <div className="text-indigo-300 font-bold">{item.sov}% Share of Voice</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                44%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider mt-0.5">
                Market SOV
              </span>
            </div>
          </div>

          {/* Legend breakdown */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
            {shareOfVoice.map((item) => (
              <div
                key={item.entity}
                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/50 dark:bg-zinc-800/40"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className={cn('truncate', item.isTargetBrand ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-zinc-400')}>
                    {item.entity} {item.isTargetBrand && '(Your Brand)'}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {item.sov}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. Blind Spot Matrix (Heatmap Grid: Prompts vs AI Engines) */}
      {/* ========================================================================= */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Platform-Specific Blind Spot Matrix</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/60 font-mono">
                Coverage Heatmap
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Query-level citation presence across individual AI search answer models
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>Cited (Ranked)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Missing (Blind Spot)</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-[40%] min-w-[260px]">Tracked Prompt / Query</th>
                <th className="py-3 px-3 w-[12%] text-center">ChatGPT</th>
                <th className="py-3 px-3 w-[12%] text-center">Perplexity</th>
                <th className="py-3 px-3 w-[12%] text-center">Gemini</th>
                <th className="py-3 px-3 w-[12%] text-center">Claude</th>
                <th className="py-3 px-3 w-[12%] text-center">Copilot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {blindSpotMatrix.map((row) => (
                <tr key={row.promptId} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">
                      &ldquo;{row.prompt}&rdquo;
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                        {row.pillar}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {row.intent}
                      </span>
                    </div>
                  </td>

                  {/* ChatGPT Cell */}
                  <td className="py-3.5 px-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all',
                        row.chatgpt.cited
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      )}
                    >
                      {row.chatgpt.cited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{row.chatgpt.score}%</span>
                    </div>
                  </td>

                  {/* Perplexity Cell */}
                  <td className="py-3.5 px-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all',
                        row.perplexity.cited
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      )}
                    >
                      {row.perplexity.cited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{row.perplexity.score}%</span>
                    </div>
                  </td>

                  {/* Gemini Cell */}
                  <td className="py-3.5 px-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all',
                        row.gemini.cited
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      )}
                    >
                      {row.gemini.cited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{row.gemini.score}%</span>
                    </div>
                  </td>

                  {/* Claude Cell */}
                  <td className="py-3.5 px-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all',
                        row.claude.cited
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      )}
                    >
                      {row.claude.cited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{row.claude.score}%</span>
                    </div>
                  </td>

                  {/* Copilot Cell */}
                  <td className="py-3.5 px-3 text-center">
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono border transition-all',
                        row.copilot.cited
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                      )}
                    >
                      {row.copilot.cited ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{row.copilot.score}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Action Items: Prioritized Next Steps from AI Fix Queue */}
      {/* ========================================================================= */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4 print:border-slate-300 print:shadow-none print:break-inside-avoid">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Prioritized Strategic Action Items</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              High-impact optimizations generated to close identified platform blind spots
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 font-mono">
            {actionItems.length} Active Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {actionItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col justify-between space-y-3 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border',
                      item.impact === 'CRITICAL' && 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300',
                      item.impact === 'HIGH' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
                      item.impact === 'MEDIUM' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                    )}
                  >
                    {item.impact} IMPACT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Target: {item.engine}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-[11px]">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                  {item.estimatedLift}
                </span>
                <span className="text-slate-400">
                  Effort: <strong>{item.effort}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
