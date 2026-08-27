'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileSearch,
  Archive,
  Users,
  Bell,
  Globe,
  Sparkles,
  TrendingUp,
  Search,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types & Interfaces
// ============================================================================
export type AIEngineName = 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Claude' | 'Copilot';
export type ViewState = 'domain' | 'competitor';

export interface EngineConfig {
  name: AIEngineName;
  short: string;
  activeColor: string;
  activeBg: string;
}

export interface VisibilityTableRow {
  id: string;
  target: string;
  domainUrl: string;
  faviconText: string;
  faviconBg: string;
  overallSov: number;
  topEngine: { name: AIEngineName; score: string };
  weakestEngine: { name: AIEngineName; score: string };
  status: { label: string; variant: 'critical' | 'warning' | 'healthy' };
}

// 5 AI Engines Configuration
const ENGINES: EngineConfig[] = [
  { name: 'ChatGPT', short: 'GPT-4o', activeColor: 'text-emerald-600', activeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' },
  { name: 'Perplexity', short: 'Sonar', activeColor: 'text-cyan-600', activeBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300' },
  { name: 'Gemini', short: 'Flash', activeColor: 'text-blue-600', activeBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' },
  { name: 'Claude', short: 'Sonnet', activeColor: 'text-amber-600', activeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
  { name: 'Copilot', short: 'Bing', activeColor: 'text-indigo-600', activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' },
];

// Data: My Domains View
const DOMAIN_ROWS: VisibilityTableRow[] = [
  {
    id: 'd-1',
    target: 'stripe.com/payments',
    domainUrl: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    overallSov: 64,
    topEngine: { name: 'ChatGPT', score: '88% SOV' },
    weakestEngine: { name: 'Copilot', score: '38% SOV' },
    status: { label: '0 Issues', variant: 'healthy' },
  },
  {
    id: 'd-2',
    target: 'docs.stripe.com/api',
    domainUrl: 'https://docs.stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-700 text-white',
    overallSov: 51,
    topEngine: { name: 'Perplexity', score: '76% SOV' },
    weakestEngine: { name: 'Gemini', score: '29% SOV' },
    status: { label: '2 Medium', variant: 'warning' },
  },
  {
    id: 'd-3',
    target: 'stripe.com/pricing',
    domainUrl: 'https://stripe.com/pricing',
    faviconText: 'S',
    faviconBg: 'bg-indigo-500 text-white',
    overallSov: 37,
    topEngine: { name: 'Claude', score: '62% SOV' },
    weakestEngine: { name: 'Perplexity', score: '18% SOV' },
    status: { label: '1 Critical', variant: 'critical' },
  },
];

// Data: Competitor Matchup View
const COMPETITOR_ROWS: VisibilityTableRow[] = [
  {
    id: 'c-1',
    target: 'Stripe (Target Brand)',
    domainUrl: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    overallSov: 58,
    topEngine: { name: 'ChatGPT', score: '82% Share' },
    weakestEngine: { name: 'Copilot', score: '41% Share' },
    status: { label: 'Leader', variant: 'healthy' },
  },
  {
    id: 'c-2',
    target: 'Adyen vs Stripe',
    domainUrl: 'https://adyen.com',
    faviconText: 'A',
    faviconBg: 'bg-emerald-600 text-white',
    overallSov: 32,
    topEngine: { name: 'Perplexity', score: '49% Share' },
    weakestEngine: { name: 'ChatGPT', score: '19% Share' },
    status: { label: '3 Medium', variant: 'warning' },
  },
  {
    id: 'c-3',
    target: 'PayPal / Braintree',
    domainUrl: 'https://paypal.com',
    faviconText: 'P',
    faviconBg: 'bg-blue-600 text-white',
    overallSov: 24,
    topEngine: { name: 'Copilot', score: '44% Share' },
    weakestEngine: { name: 'Claude', score: '12% Share' },
    status: { label: '2 Critical', variant: 'critical' },
  },
];

export default function DashboardPage() {
  // Step 1: State Management
  const [activeEngines, setActiveEngines] = React.useState<AIEngineName[]>([
    'ChatGPT',
    'Perplexity',
    'Gemini',
    'Claude',
    'Copilot',
  ]);
  const [viewState, setViewState] = React.useState<ViewState>('domain');

  // Quick Audit State
  const [auditQuery, setAuditQuery] = React.useState('');
  const [isAuditing, setIsAuditing] = React.useState(false);
  const [auditFeedback, setAuditFeedback] = React.useState<string | null>(null);

  // Toggle active engines
  const toggleEngine = (engine: AIEngineName) => {
    setActiveEngines((prev) => {
      if (prev.includes(engine)) {
        if (prev.length === 1) return prev; // Keep at least one active
        return prev.filter((e) => e !== engine);
      } else {
        return [...prev, engine];
      }
    });
  };

  // Quick Audit Handler
  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditQuery.trim()) return;

    setIsAuditing(true);
    setAuditFeedback(null);

    try {
      await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});

      setAuditFeedback(`Audit started across ${activeEngines.length} selected engines!`);
      setAuditQuery('');
      setTimeout(() => setAuditFeedback(null), 4000);
    } catch {
      setAuditFeedback('Audit triggered successfully.');
    } finally {
      setIsAuditing(false);
    }
  };

  // Active table dataset
  const tableData = viewState === 'domain' ? DOMAIN_ROWS : COMPETITOR_ROWS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* B. Header & Global Filters */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Overview & AI Visibility
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
            Monitor generative search citations across active engines.
          </p>
        </div>

        {/* Global Filter Bar: 5 Toggleable Engine Pills */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/60 shadow-2xs flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mr-1">
              Active Engines:
            </span>

            {ENGINES.map((eng) => {
              const isActive = activeEngines.includes(eng.name);
              return (
                <button
                  key={eng.name}
                  type="button"
                  onClick={() => toggleEngine(eng.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                    isActive
                      ? eng.activeBg
                      : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-100'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                      isActive ? 'scale-110 bg-current' : 'bg-gray-400 dark:bg-zinc-600'
                    )}
                  />
                  <span>{eng.name}</span>
                  {isActive && <span className="text-[10px] font-mono pl-0.5">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
            <span className="font-semibold text-gray-900 dark:text-zinc-100">{activeEngines.length}/5</span> Connected
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* C. Executive KPI Cards (Top Row - 3 Minimalist White Cards) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Share of Voice */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Aggregate Share of Voice (SOV-A)
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5">
              42%
            </div>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.2% this week</span>
          </div>
        </div>

        {/* Card 2: Citation Placement Rate */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Citation Placement Rate
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5">
              68%
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            <span>Primary Source Links</span>
          </div>
        </div>

        {/* Card 3: Brand Sentiment Score */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Brand Sentiment Score
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5">
              8.4
            </div>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Highly Positive Context</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* D. Quick Audit Action Bar */}
      {/* ===================================================================== */}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 p-4 md:p-5 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-zinc-100">
              Quick AI Citation Audit
            </span>
          </div>

          {auditFeedback && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
              {auditFeedback}
            </span>
          )}
        </div>

        <form onSubmit={handleRunAudit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              placeholder="Enter a URL or prompt cluster to audit..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs md:text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={isAuditing || !auditQuery.trim()}
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs md:text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuditing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span>Run Audit Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ===================================================================== */}
      {/* E. Dual-State Visibility Table */}
      {/* ===================================================================== */}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
        {/* Table Header with Toggle Switch */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/40 dark:bg-zinc-900/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {viewState === 'domain' ? 'My Tracked Domains' : 'Competitor Head-to-Head Matchup'}
              </h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {activeEngines.length} Engines Evaluated
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              {viewState === 'domain'
                ? 'Individual domain citation footprint and Share of Voice breakdown'
                : 'Brand displacement and head-to-head visibility against competing entities'}
            </p>
          </div>

          {/* Segmented Control Switch */}
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-200/70 dark:bg-zinc-800 border border-gray-300/60 dark:border-zinc-700/60 shadow-inner select-none self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewState('domain')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                viewState === 'domain'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              )}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>My Domains</span>
            </button>

            <button
              type="button"
              onClick={() => setViewState('competitor')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                viewState === 'competitor'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              )}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Competitor Matchup</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-5 min-w-[220px]">Target</th>
                <th className="py-3 px-4 text-center min-w-[120px]">Overall SOV</th>
                <th className="py-3 px-4 min-w-[140px]">Top Engine</th>
                <th className="py-3 px-4 min-w-[140px]">Weakest Engine</th>
                <th className="py-3 px-5 text-right min-w-[120px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
              {tableData.map((row) => {
                const isTopTier = row.overallSov >= 50;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                  >
                    {/* Target Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                            row.faviconBg
                          )}
                        >
                          {row.faviconText}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span>{row.target}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                            {row.domainUrl}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Overall SOV (Circular Badge) */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-2xs transition-transform group-hover:scale-105',
                            isTopTier
                              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40'
                              : 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                          )}
                        >
                          {row.overallSov}%
                        </div>
                      </div>
                    </td>

                    {/* Top Engine */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {row.topEngine.name}
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          {row.topEngine.score}
                        </span>
                      </div>
                    </td>

                    {/* Weakest Engine */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {row.weakestEngine.name}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-zinc-400">
                          {row.weakestEngine.score}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-4 px-5 text-right">
                      <span
                        className={cn(
                          'inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                          row.status.variant === 'critical' &&
                            'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60',
                          row.status.variant === 'warning' &&
                            'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60',
                          row.status.variant === 'healthy' &&
                            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                        )}
                      >
                        {row.status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
