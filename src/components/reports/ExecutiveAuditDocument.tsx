'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
  Globe,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Target,
  FileCheck,
  Check,
  HelpCircle,
  BarChart3,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';
import { GeneratedAuditReport } from '@/app/api/reports/generate/route';

interface ExecutiveAuditDocumentProps {
  report: GeneratedAuditReport;
  className?: string;
}

export function ExecutiveAuditDocument({ report, className }: ExecutiveAuditDocumentProps) {
  const {
    id,
    brandName,
    domain,
    generatedAt,
    reportingPeriod,
    comparisonPeriod,
    isHistoricalSnapshot,
    metrics,
    engines,
    competitors,
    blindSpots = [],
    narrative,
    primaryColor = '#4f46e5',
  } = report;

  const formattedDate = React.useMemo(() => {
    try {
      return new Date(generatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return generatedAt;
    }
  }, [generatedAt]);

  return (
    <div
      className={cn(
        'w-full max-w-5xl mx-auto bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xl print:shadow-none print:border-none print:max-w-none print:rounded-none print:p-0 print:m-0 print:bg-white print:text-black p-6 sm:p-10 space-y-8 font-sans',
        className
      )}
    >
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE REPORT COVER HEADER */}
      {/* ========================================================================= */}
      <header className="border-b-2 border-slate-900/90 dark:border-zinc-700 pb-6 print:border-black print:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-md print:shadow-none"
                style={{ backgroundColor: primaryColor }}
              >
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400 print:text-slate-800">
                    BEACON GEO INTELLIGENCE
                  </span>
                  {isHistoricalSnapshot && (
                    <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold print:border print:border-black">
                      Versioned Snapshot
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                  Executive GEO Audit Report
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 print:text-slate-600 pt-1">
              Multi-Model AI Visibility, Citation Trajectory & Competitor Disruption Analysis
            </p>
          </div>

          {/* Target Metadata Block */}
          <div className="bg-slate-50 dark:bg-zinc-900 print:bg-slate-50 border border-slate-200/80 dark:border-zinc-800 print:border-slate-300 rounded-2xl p-3.5 sm:text-right text-xs space-y-1 font-mono shrink-0">
            <div className="flex sm:justify-end items-center gap-1.5 font-bold text-slate-900 dark:text-white print:text-black">
              <Target className="w-3.5 h-3.5 text-indigo-600 print:text-black" />
              <span>Target:</span>
              <span className="text-indigo-600 dark:text-indigo-400 print:text-black">{brandName}</span>
              <span className="text-slate-400 font-normal">({domain})</span>
            </div>
            <div className="flex sm:justify-end items-center gap-1.5 text-slate-500 dark:text-zinc-400 print:text-slate-600">
              <Calendar className="w-3.5 h-3.5" />
              <span>Generated:</span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300 print:text-black">{formattedDate}</span>
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-500">
              <span>Period: </span>
              <strong className="text-slate-600 dark:text-zinc-300 print:text-black">{reportingPeriod}</strong>
              <span className="text-slate-400"> (vs {comparisonPeriod})</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SECTION 1: PERFORMANCE OVERVIEW & HISTORICAL DELTAS */}
      {/* ========================================================================= */}
      <section className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold print:bg-slate-200 print:text-black">
              1
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              Performance Overview & Historical Deltas
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 print:text-slate-600">
            Calculated Metric Shifts
          </span>
        </div>

        {/* 4 Metric Delta Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Visibility Score */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 print:bg-white print:border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Visibility Score
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold',
                  metrics.visibilityScore.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 print:bg-slate-100 print:text-black'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 print:bg-slate-100 print:text-black'
                )}
              >
                {metrics.visibilityScore.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {metrics.visibilityScore.delta >= 0 ? '+' : ''}
                {metrics.visibilityScore.delta}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black">
              {metrics.visibilityScore.current}%
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-600 flex items-center justify-between">
              <span>Prev: {metrics.visibilityScore.previous}%</span>
              <span>{metrics.visibilityScore.deltaPercent >= 0 ? '+' : ''}{metrics.visibilityScore.deltaPercent}% shift</span>
            </div>
          </div>

          {/* Card 2: Total Citations */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 print:bg-white print:border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Total Citations
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold',
                  metrics.citations.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 print:bg-slate-100 print:text-black'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 print:bg-slate-100 print:text-black'
                )}
              >
                {metrics.citations.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {metrics.citations.delta >= 0 ? '+' : ''}
                {metrics.citations.delta.toLocaleString()}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black">
              {metrics.citations.current.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-600 flex items-center justify-between">
              <span>Prev: {metrics.citations.previous.toLocaleString()}</span>
              <span>Indexed URLs</span>
            </div>
          </div>

          {/* Card 3: SOV Market Lead */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 print:bg-white print:border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                SOV Market Lead
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold',
                  metrics.rankOneShare.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 print:bg-slate-100 print:text-black'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 print:bg-slate-100 print:text-black'
                )}
              >
                {metrics.rankOneShare.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {metrics.rankOneShare.delta >= 0 ? '+' : ''}
                {metrics.rankOneShare.delta}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black">
              {metrics.rankOneShare.current}%
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-600 flex items-center justify-between">
              <span>Prev: {metrics.rankOneShare.previous}%</span>
              <span>Rank #1 vs Rivals</span>
            </div>
          </div>

          {/* Card 4: Favorable Sentiment */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 print:bg-white print:border-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Favorable Sentiment
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold',
                  metrics.sentimentScore.isPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 print:bg-slate-100 print:text-black'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 print:bg-slate-100 print:text-black'
                )}
              >
                {metrics.sentimentScore.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {metrics.sentimentScore.delta >= 0 ? '+' : ''}
                {metrics.sentimentScore.delta}%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white print:text-black">
              {metrics.sentimentScore.current}%
            </div>
            <div className="text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-600 flex items-center justify-between">
              <span>Prev: {metrics.sentimentScore.previous}%</span>
              <span>Contextual tone</span>
            </div>
          </div>
        </div>

        {/* AI Key Findings Box */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 print:bg-slate-50 print:border-slate-300">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 print:text-black" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 print:text-black">
              AI Key Findings & Macro Performance Analysis
            </h3>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-zinc-300 print:text-slate-800">
            {narrative.key_findings}
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION 2: MULTI-ENGINE & TREND ANALYSIS */}
      {/* ========================================================================= */}
      <section className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold print:bg-slate-200 print:text-black">
              2
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              Multi-Engine & Trend Analysis
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 print:text-slate-600">
            Per-Model Citation Breakdowns
          </span>
        </div>

        {/* 5 Engine Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {engines.map((e) => (
            <div
              key={e.engine}
              className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 print:border-slate-300 print:bg-white space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <EngineIcon engine={e.engine} size={16} />
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 print:text-black">
                    {e.engine}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.2 rounded',
                    e.delta > 0
                      ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60 print:text-black'
                      : e.delta < 0
                      ? 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60 print:text-black'
                      : 'text-slate-600 bg-slate-100 dark:text-zinc-400 dark:bg-zinc-800'
                  )}
                >
                  {e.delta >= 0 ? '+' : ''}
                  {e.delta}%
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                  {e.current}%
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-500 font-mono">
                  was {e.previous}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* AI Visual Commentary Box */}
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 print:bg-white print:border-slate-300 space-y-1.5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 print:text-black" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 print:text-black">
              Multi-Engine Visual Commentary & Analysis
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 print:text-slate-800 leading-relaxed">
            {narrative.visual_explanations}
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION 3: COMPETITIVE SHARE OF VOICE */}
      {/* ========================================================================= */}
      <section className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold print:bg-slate-200 print:text-black">
              3
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              Competitive Share of Voice (SoV)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 print:text-slate-600">
            Brand Mention Volume vs Benchmark Rivals
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40 print:bg-white print:border-slate-300 p-4 sm:p-5 space-y-4">
          {/* Stacked Visual Bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-zinc-800 shadow-inner">
              {competitors.map((comp) => (
                <div
                  key={comp.name}
                  style={{
                    width: `${comp.share}%`,
                    backgroundColor: comp.isTargetBrand ? primaryColor : comp.color || '#94a3b8',
                  }}
                  className="h-full transition-all"
                  title={`${comp.name}: ${comp.share}%`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 print:text-slate-500 font-mono">
              <span>0% Market Share</span>
              <span>100% GEO Model Share</span>
            </div>
          </div>

          {/* Competitor Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-2 px-3">Brand / Competitor</th>
                  <th className="py-2 px-3 text-center">Rank</th>
                  <th className="py-2 px-3 text-right">Current SoV</th>
                  <th className="py-2 px-3 text-right">Previous</th>
                  <th className="py-2 px-3 text-right">Net Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 print:divide-slate-200">
                {competitors.map((comp, idx) => (
                  <tr
                    key={comp.name}
                    className={cn(
                      comp.isTargetBrand
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 font-semibold text-indigo-950 dark:text-indigo-100 print:bg-slate-100 print:text-black'
                        : 'text-slate-700 dark:text-zinc-300 print:text-slate-800'
                    )}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: comp.isTargetBrand ? primaryColor : comp.color || '#94a3b8',
                        }}
                      />
                      <span className="font-bold">{comp.name}</span>
                      {comp.isTargetBrand && (
                        <span className="text-[10px] uppercase tracking-wider bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.2 rounded font-bold print:bg-slate-200 print:text-black">
                          Target Brand
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">#{idx + 1}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white print:text-black">
                      {comp.share}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400 dark:text-zinc-500">
                      {comp.previousShare}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 font-bold',
                          comp.delta > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : comp.delta < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400'
                        )}
                      >
                        {comp.delta > 0 ? '+' : ''}
                        {comp.delta}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION 4: PLATFORM BLIND SPOTS & FRICTION AREAS */}
      {/* ========================================================================= */}
      <section className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 text-xs font-bold print:bg-slate-200 print:text-black">
              4
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              Platform Blind Spots & Friction Areas
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 print:text-slate-600">
            Query-Level Citation & Vulnerability Matrix
          </span>
        </div>

        {/* Narrative Friction Callouts */}
        <div className="space-y-2.5">
          {narrative.struggle_areas.map((area, index) => (
            <div
              key={index}
              className="p-3.5 sm:p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 print:bg-white print:border-slate-300 flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5 print:bg-slate-100 print:text-black">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-rose-950 dark:text-rose-200 print:text-black">
                  Friction Vector #{index + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 print:text-slate-800 leading-relaxed">
                  {area}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Query Matrix Table */}
        {blindSpots.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 print:border-slate-300 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white print:text-black flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-600" />
                Tracked Query Engine Citation Matrix
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{blindSpots.length} Key Prompts Evaluated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-2 px-2.5">Evaluated Query & Intent</th>
                    <th className="py-2 px-2 text-center">Score</th>
                    <th className="py-2 px-1.5 text-center">GPT</th>
                    <th className="py-2 px-1.5 text-center">Perp</th>
                    <th className="py-2 px-1.5 text-center">Gem</th>
                    <th className="py-2 px-1.5 text-center">Clau</th>
                    <th className="py-2 px-1.5 text-center">Copi</th>
                    <th className="py-2 px-2.5">Friction Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 print:divide-slate-200">
                  {blindSpots.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-2.5 max-w-xs">
                        <div className="font-semibold text-slate-800 dark:text-zinc-200 print:text-black truncate">
                          "{item.query}"
                        </div>
                        <div className="text-[10px] text-slate-400">{item.category}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold font-mono">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[11px]',
                            item.score >= 80
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : item.score >= 60
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          )}
                        >
                          {item.score}%
                        </span>
                      </td>
                      <td className="py-2.5 px-1.5 text-center">
                        {item.chatgpt ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                        )}
                      </td>
                      <td className="py-2.5 px-1.5 text-center">
                        {item.perplexity ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                        )}
                      </td>
                      <td className="py-2.5 px-1.5 text-center">
                        {item.gemini ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                        )}
                      </td>
                      <td className="py-2.5 px-1.5 text-center">
                        {item.claude ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                        )}
                      </td>
                      <td className="py-2.5 px-1.5 text-center">
                        {item.copilot ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline-block" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 inline-block" />
                        )}
                      </td>
                      <td className="py-2.5 px-2.5 text-[11px] text-slate-500 dark:text-zinc-400 print:text-slate-700">
                        {item.frictionReason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION 5: ACTION PLAN & RECOMMENDATIONS */}
      {/* ========================================================================= */}
      <section className="space-y-4 print:break-inside-avoid">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold print:bg-slate-200 print:text-black">
              5
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              Action Plan & Strategic Recommendations
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 print:text-slate-600">
            Prioritized Technical Execution Steps
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {narrative.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 print:bg-white print:border-slate-300 space-y-2.5 transition-all hover:border-indigo-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center print:bg-black print:text-white">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white print:text-black">
                    {rec.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {/* Target Engine Pill */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 print:bg-slate-100 print:text-black">
                    <EngineIcon engine={rec.target_engine} size={12} />
                    <span>{rec.target_engine}</span>
                  </span>

                  {/* Impact Badge */}
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                      rec.impact === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 print:border print:border-black'
                        : rec.impact === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    )}
                  >
                    {rec.impact} IMPACT
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 print:text-slate-800 leading-relaxed pl-7">
                {rec.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DOCUMENT FOOTER & AUDIT TRAIL */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-zinc-800 pt-4 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-zinc-500 print:text-slate-500 font-mono">
        <div>
          Beacon GEO Intelligence Engine • Snapshot ID:{' '}
          <span className="text-slate-600 dark:text-zinc-400 font-semibold">{id.substring(0, 13)}...</span>
        </div>
        <div>
          Validated across 5 LLM Search Architectures • Confidential Executive Document
        </div>
      </footer>
    </div>
  );
}
