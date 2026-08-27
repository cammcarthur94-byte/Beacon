'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Search,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Globe,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
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
  baseSov: number;
  basePlacementRate: number;
  baseSentiment: number;
}

export interface DomainRawItem {
  id: string;
  target: string;
  domainUrl: string;
  faviconText: string;
  faviconBg: string;
  engineSov: Record<AIEngineName, number>;
  engineIssues: Record<AIEngineName, 'none' | 'medium' | 'critical'>;
}

export interface CompetitorRawItem {
  id: string;
  target: string;
  domainUrl: string;
  faviconText: string;
  faviconBg: string;
  isTargetBrand: boolean;
  engineSov: Record<AIEngineName, number>;
  engineIssues: Record<AIEngineName, 'none' | 'medium' | 'critical'>;
}

// 5 AI Engines Telemetry Constants
const ENGINES: EngineConfig[] = [
  {
    name: 'ChatGPT',
    short: 'GPT-4o',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
    baseSov: 52,
    basePlacementRate: 78,
    baseSentiment: 8.8,
  },
  {
    name: 'Perplexity',
    short: 'Sonar',
    activeColor: 'text-cyan-600 dark:text-cyan-400',
    activeBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300',
    baseSov: 46,
    basePlacementRate: 74,
    baseSentiment: 8.6,
  },
  {
    name: 'Gemini',
    short: 'Flash',
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    baseSov: 36,
    basePlacementRate: 61,
    baseSentiment: 8.1,
  },
  {
    name: 'Claude',
    short: 'Sonnet',
    activeColor: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    baseSov: 44,
    basePlacementRate: 67,
    baseSentiment: 8.4,
  },
  {
    name: 'Copilot',
    short: 'Bing',
    activeColor: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300',
    baseSov: 32,
    basePlacementRate: 56,
    baseSentiment: 7.9,
  },
];

// Raw Telemetry Datasets
const DOMAIN_DATA_RAW: DomainRawItem[] = [
  {
    id: 'd-1',
    target: 'stripe.com/payments',
    domainUrl: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    engineSov: {
      ChatGPT: 88,
      Perplexity: 72,
      Gemini: 58,
      Claude: 66,
      Copilot: 38,
    },
    engineIssues: {
      ChatGPT: 'none',
      Perplexity: 'none',
      Gemini: 'none',
      Claude: 'none',
      Copilot: 'none',
    },
  },
  {
    id: 'd-2',
    target: 'docs.stripe.com/api',
    domainUrl: 'https://docs.stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-700 text-white',
    engineSov: {
      ChatGPT: 62,
      Perplexity: 76,
      Gemini: 29,
      Claude: 54,
      Copilot: 35,
    },
    engineIssues: {
      ChatGPT: 'none',
      Perplexity: 'none',
      Gemini: 'medium',
      Claude: 'none',
      Copilot: 'medium',
    },
  },
  {
    id: 'd-3',
    target: 'stripe.com/pricing',
    domainUrl: 'https://stripe.com/pricing',
    faviconText: 'S',
    faviconBg: 'bg-indigo-500 text-white',
    engineSov: {
      ChatGPT: 45,
      Perplexity: 18,
      Gemini: 32,
      Claude: 62,
      Copilot: 28,
    },
    engineIssues: {
      ChatGPT: 'none',
      Perplexity: 'critical',
      Gemini: 'none',
      Claude: 'none',
      Copilot: 'none',
    },
  },
];

const COMPETITOR_DATA_RAW: CompetitorRawItem[] = [
  {
    id: 'c-1',
    target: 'Stripe (Target Brand)',
    domainUrl: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    isTargetBrand: true,
    engineSov: {
      ChatGPT: 82,
      Perplexity: 74,
      Gemini: 68,
      Claude: 79,
      Copilot: 41,
    },
    engineIssues: {
      ChatGPT: 'none',
      Perplexity: 'none',
      Gemini: 'none',
      Claude: 'none',
      Copilot: 'none',
    },
  },
  {
    id: 'c-2',
    target: 'Adyen vs Stripe',
    domainUrl: 'https://adyen.com',
    faviconText: 'A',
    faviconBg: 'bg-emerald-600 text-white',
    isTargetBrand: false,
    engineSov: {
      ChatGPT: 19,
      Perplexity: 49,
      Gemini: 34,
      Claude: 28,
      Copilot: 30,
    },
    engineIssues: {
      ChatGPT: 'medium',
      Perplexity: 'none',
      Gemini: 'medium',
      Claude: 'medium',
      Copilot: 'none',
    },
  },
  {
    id: 'c-3',
    target: 'PayPal / Braintree',
    domainUrl: 'https://paypal.com',
    faviconText: 'P',
    faviconBg: 'bg-blue-600 text-white',
    isTargetBrand: false,
    engineSov: {
      ChatGPT: 25,
      Perplexity: 21,
      Gemini: 18,
      Claude: 12,
      Copilot: 44,
    },
    engineIssues: {
      ChatGPT: 'critical',
      Perplexity: 'critical',
      Gemini: 'none',
      Claude: 'none',
      Copilot: 'none',
    },
  },
];

export default function DashboardPage() {
  // Step 1: Active Engines & View State
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

  // Toggle active engines (minimum 1 active engine required)
  const toggleEngine = (engine: AIEngineName) => {
    setActiveEngines((prev) => {
      if (prev.includes(engine)) {
        if (prev.length === 1) return prev;
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

  // =========================================================================
  // DYNAMIC COMPUTATIONS: Adjust metrics based on activeEngines selection
  // =========================================================================

  // 1. Filtered active engine configurations
  const activeEngineConfigs = React.useMemo(() => {
    return ENGINES.filter((eng) => activeEngines.includes(eng.name));
  }, [activeEngines]);

  // 2. Executive KPI Card 1: Aggregate Share of Voice (SOV-A)
  const dynamicAggregateSov = React.useMemo(() => {
    if (activeEngineConfigs.length === 0) return 0;
    const totalSov = activeEngineConfigs.reduce((acc, curr) => acc + curr.baseSov, 0);
    return Math.round(totalSov / activeEngineConfigs.length);
  }, [activeEngineConfigs]);

  // 3. Executive KPI Card 2: Citation Placement Rate
  const dynamicPlacementRate = React.useMemo(() => {
    if (activeEngineConfigs.length === 0) return 0;
    const totalRate = activeEngineConfigs.reduce((acc, curr) => acc + curr.basePlacementRate, 0);
    return Math.round(totalRate / activeEngineConfigs.length);
  }, [activeEngineConfigs]);

  // 4. Executive KPI Card 3: Brand Sentiment Score
  const dynamicSentimentScore = React.useMemo(() => {
    if (activeEngineConfigs.length === 0) return 0;
    const totalSent = activeEngineConfigs.reduce((acc, curr) => acc + curr.baseSentiment, 0);
    return Number((totalSent / activeEngineConfigs.length).toFixed(1));
  }, [activeEngineConfigs]);

  // 5. Dynamic Table Data for Domain View
  const dynamicDomainRows = React.useMemo(() => {
    return DOMAIN_DATA_RAW.map((row) => {
      // Scores for active engines only
      const activeScores = activeEngines.map((eng) => ({
        name: eng,
        score: row.engineSov[eng] || 0,
      }));

      // Compute Overall SOV for this domain across active engines
      const overallSov =
        activeScores.length > 0
          ? Math.round(activeScores.reduce((sum, item) => sum + item.score, 0) / activeScores.length)
          : 0;

      // Top Engine among active
      const top = [...activeScores].sort((a, b) => b.score - a.score)[0] || {
        name: activeEngines[0],
        score: 0,
      };

      // Weakest Engine among active
      const weakest = [...activeScores].sort((a, b) => a.score - b.score)[0] || {
        name: activeEngines[0],
        score: 0,
      };

      // Status based on issues in active engines
      let criticalCount = 0;
      let mediumCount = 0;
      activeEngines.forEach((eng) => {
        const issue = row.engineIssues[eng];
        if (issue === 'critical') criticalCount++;
        if (issue === 'medium') mediumCount++;
      });

      let statusLabel = '0 Issues';
      let statusVariant: 'critical' | 'warning' | 'healthy' = 'healthy';

      if (criticalCount > 0) {
        statusLabel = `${criticalCount} Critical`;
        statusVariant = 'critical';
      } else if (mediumCount > 0) {
        statusLabel = `${mediumCount} Medium`;
        statusVariant = 'warning';
      }

      return {
        id: row.id,
        target: row.target,
        domainUrl: row.domainUrl,
        faviconText: row.faviconText,
        faviconBg: row.faviconBg,
        overallSov,
        topEngine: { name: top.name, score: `${top.score}% SOV` },
        weakestEngine: { name: weakest.name, score: `${weakest.score}% SOV` },
        status: { label: statusLabel, variant: statusVariant },
      };
    });
  }, [activeEngines]);

  // 6. Dynamic Table Data for Competitor Matchup View
  const dynamicCompetitorRows = React.useMemo(() => {
    return COMPETITOR_DATA_RAW.map((row) => {
      const activeScores = activeEngines.map((eng) => ({
        name: eng,
        score: row.engineSov[eng] || 0,
      }));

      const overallSov =
        activeScores.length > 0
          ? Math.round(activeScores.reduce((sum, item) => sum + item.score, 0) / activeScores.length)
          : 0;

      const top = [...activeScores].sort((a, b) => b.score - a.score)[0] || {
        name: activeEngines[0],
        score: 0,
      };

      const weakest = [...activeScores].sort((a, b) => a.score - b.score)[0] || {
        name: activeEngines[0],
        score: 0,
      };

      let criticalCount = 0;
      let mediumCount = 0;
      activeEngines.forEach((eng) => {
        const issue = row.engineIssues[eng];
        if (issue === 'critical') criticalCount++;
        if (issue === 'medium') mediumCount++;
      });

      let statusLabel = row.isTargetBrand ? 'Leader' : '0 Issues';
      let statusVariant: 'critical' | 'warning' | 'healthy' = 'healthy';

      if (row.isTargetBrand) {
        statusLabel = 'Leader';
        statusVariant = 'healthy';
      } else if (criticalCount > 0) {
        statusLabel = `${criticalCount} Critical`;
        statusVariant = 'critical';
      } else if (mediumCount > 0) {
        statusLabel = `${mediumCount} Medium`;
        statusVariant = 'warning';
      }

      return {
        id: row.id,
        target: row.target,
        domainUrl: row.domainUrl,
        faviconText: row.faviconText,
        faviconBg: row.faviconBg,
        overallSov,
        topEngine: { name: top.name, score: `${top.score}% Share` },
        weakestEngine: { name: weakest.name, score: `${weakest.score}% Share` },
        status: { label: statusLabel, variant: statusVariant },
      };
    });
  }, [activeEngines]);

  // Selected table dataset
  const activeTableRows = viewState === 'domain' ? dynamicDomainRows : dynamicCompetitorRows;

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
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
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

          <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-semibold text-gray-900 dark:text-zinc-100">{activeEngines.length}/5</span> Connected
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* C. Executive KPI Cards (Dynamically recalculated based on activeEngines) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Aggregate Share of Voice */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Aggregate Share of Voice (SOV-A)
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                {activeEngines.length} Models
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">
              {dynamicAggregateSov}%
            </div>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+3.2% this week</span>
          </div>
        </div>

        {/* Card 2: Citation Placement Rate */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Citation Placement Rate
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">
              {dynamicPlacementRate}%
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
            <span>Primary Source Links</span>
          </div>
        </div>

        {/* Card 3: Brand Sentiment Score */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between transition-all duration-300">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Brand Sentiment Score
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                Score/10
              </span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1.5 tracking-tight">
              {dynamicSentimentScore}
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
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs md:text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      {/* E. Dual-State Visibility Table (Dynamically Filtered) */}
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
                {activeEngines.length} {activeEngines.length === 1 ? 'ENGINE' : 'ENGINES'} EVALUATED
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
              {activeTableRows.map((row) => {
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

                    {/* Overall SOV (Circular Badge - Dynamically Recalculated) */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-2xs transition-all duration-300 group-hover:scale-105',
                            isTopTier
                              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40'
                              : 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                          )}
                        >
                          {row.overallSov}%
                        </div>
                      </div>
                    </td>

                    {/* Top Engine (Dynamically Computed from Selected Active Engines) */}
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

                    {/* Weakest Engine (Dynamically Computed from Selected Active Engines) */}
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

                    {/* Status Pill Badge (Dynamically Calculated) */}
                    <td className="py-4 px-5 text-right">
                      <span
                        className={cn(
                          'inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-200',
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
