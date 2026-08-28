'use client';

import * as React from 'react';
import {
  Globe,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFilterContext, ALL_ENGINES } from '@/context/filter-context';
import { AIEngine } from '@/types/geo';

export type TableViewMode = 'domains' | 'competitors';

interface DomainCitationData {
  id: string;
  domain: string;
  url: string;
  faviconText: string;
  faviconBg: string;
  isTargetBrand: boolean;
  engineCitations: Record<AIEngine, number>;
  category: string;
}

interface CompetitorMatchupData {
  id: string;
  name: string;
  domain: string;
  isTargetBrand: boolean;
  engineScores: Record<AIEngine, number>;
  engineCitations: Record<AIEngine, number>;
  winRateAgainstTarget: number; // percentage where this brand wins / outranks
}

const RAW_DOMAINS: DomainCitationData[] = [
  {
    id: 'dom-1',
    domain: 'stripe.com',
    url: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    isTargetBrand: true,
    engineCitations: {
      chatgpt: 48,
      perplexity: 52,
      gemini: 36,
      claude: 44,
      copilot: 38,
      google_aio: 41,
    },
    category: 'Commercial Intent',
  },
  {
    id: 'dom-2',
    domain: 'docs.stripe.com',
    url: 'https://docs.stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-700 text-white',
    isTargetBrand: true,
    engineCitations: {
      chatgpt: 35,
      perplexity: 42,
      gemini: 28,
      claude: 39,
      copilot: 30,
      google_aio: 34,
    },
    category: 'Technical Documentation',
  },
  {
    id: 'dom-3',
    domain: 'adyen.com',
    url: 'https://adyen.com',
    faviconText: 'A',
    faviconBg: 'bg-emerald-600 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 29,
      perplexity: 38,
      gemini: 24,
      claude: 31,
      copilot: 25,
      google_aio: 27,
    },
    category: 'Competitor Direct',
  },
  {
    id: 'dom-4',
    domain: 'paypal.com',
    url: 'https://paypal.com',
    faviconText: 'P',
    faviconBg: 'bg-blue-600 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 33,
      perplexity: 28,
      gemini: 30,
      claude: 26,
      copilot: 34,
      google_aio: 31,
    },
    category: 'Competitor Direct',
  },
  {
    id: 'dom-5',
    domain: 'square.com',
    url: 'https://squareup.com',
    faviconText: 'S',
    faviconBg: 'bg-zinc-800 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 22,
      perplexity: 30,
      gemini: 18,
      claude: 24,
      copilot: 20,
      google_aio: 23,
    },
    category: 'Competitor Direct',
  },
  {
    id: 'dom-6',
    domain: 'g2.com',
    url: 'https://g2.com',
    faviconText: 'G2',
    faviconBg: 'bg-orange-600 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 40,
      perplexity: 49,
      gemini: 33,
      claude: 42,
      copilot: 37,
      google_aio: 45,
    },
    category: 'Software Reviews & Aggregator',
  },
  {
    id: 'dom-7',
    domain: 'trustradius.com',
    url: 'https://trustradius.com',
    faviconText: 'TR',
    faviconBg: 'bg-cyan-700 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 18,
      perplexity: 26,
      gemini: 15,
      claude: 20,
      copilot: 19,
      google_aio: 22,
    },
    category: 'Review Site',
  },
  {
    id: 'dom-8',
    domain: 'techcrunch.com',
    url: 'https://techcrunch.com',
    faviconText: 'TC',
    faviconBg: 'bg-green-700 text-white',
    isTargetBrand: false,
    engineCitations: {
      chatgpt: 14,
      perplexity: 22,
      gemini: 12,
      claude: 16,
      copilot: 15,
      google_aio: 18,
    },
    category: 'Tech Media Authority',
  },
];

const RAW_COMPETITORS: CompetitorMatchupData[] = [
  {
    id: 'comp-1',
    name: 'Stripe',
    domain: 'stripe.com',
    isTargetBrand: true,
    engineScores: {
      chatgpt: 94,
      perplexity: 96,
      gemini: 88,
      claude: 92,
      copilot: 90,
      google_aio: 93,
    },
    engineCitations: {
      chatgpt: 83,
      perplexity: 94,
      gemini: 64,
      claude: 83,
      copilot: 68,
      google_aio: 75,
    },
    winRateAgainstTarget: 100, // Target brand benchmark
  },
  {
    id: 'comp-2',
    name: 'Adyen',
    domain: 'adyen.com',
    isTargetBrand: false,
    engineScores: {
      chatgpt: 76,
      perplexity: 82,
      gemini: 70,
      claude: 78,
      copilot: 74,
      google_aio: 77,
    },
    engineCitations: {
      chatgpt: 29,
      perplexity: 38,
      gemini: 24,
      claude: 31,
      copilot: 25,
      google_aio: 27,
    },
    winRateAgainstTarget: 28, // Wins 28% of head-to-head prompts
  },
  {
    id: 'comp-3',
    name: 'PayPal / Braintree',
    domain: 'paypal.com',
    isTargetBrand: false,
    engineScores: {
      chatgpt: 72,
      perplexity: 68,
      gemini: 75,
      claude: 70,
      copilot: 78,
      google_aio: 74,
    },
    engineCitations: {
      chatgpt: 33,
      perplexity: 28,
      gemini: 30,
      claude: 26,
      copilot: 34,
      google_aio: 31,
    },
    winRateAgainstTarget: 24,
  },
  {
    id: 'comp-4',
    name: 'Square',
    domain: 'squareup.com',
    isTargetBrand: false,
    engineScores: {
      chatgpt: 68,
      perplexity: 74,
      gemini: 62,
      claude: 66,
      copilot: 64,
      google_aio: 69,
    },
    engineCitations: {
      chatgpt: 22,
      perplexity: 30,
      gemini: 18,
      claude: 24,
      copilot: 20,
      google_aio: 23,
    },
    winRateAgainstTarget: 18,
  },
  {
    id: 'comp-5',
    name: 'Checkout.com',
    domain: 'checkout.com',
    isTargetBrand: false,
    engineScores: {
      chatgpt: 60,
      perplexity: 65,
      gemini: 56,
      claude: 62,
      copilot: 58,
      google_aio: 61,
    },
    engineCitations: {
      chatgpt: 15,
      perplexity: 21,
      gemini: 12,
      claude: 17,
      copilot: 14,
      google_aio: 16,
    },
    winRateAgainstTarget: 12,
  },
];

export function DualStateTable() {
  const [viewMode, setViewMode] = React.useState<TableViewMode>('domains');
  const { selectedEngines } = useFilterContext();

  // Active engines list filtered by global state
  const activeEnginesList = React.useMemo(
    () => ALL_ENGINES.filter((eng) => selectedEngines.includes(eng.id)),
    [selectedEngines]
  );

  // --------------------------------------------------------------------------
  // Recalculate Domain View Metrics Dynamically
  // --------------------------------------------------------------------------
  const processedDomains = React.useMemo(() => {
    // 1. Calculate active citations for each domain
    const withTotals = RAW_DOMAINS.map((d) => {
      const activeTotal = selectedEngines.reduce(
        (sum, engId) => sum + (d.engineCitations[engId] || 0),
        0
      );
      return {
        ...d,
        activeTotal,
      };
    });

    // 2. Compute grand total active citations
    const grandTotalActive = withTotals.reduce((sum, d) => sum + d.activeTotal, 0);

    // 3. Compute dynamic Share of Voice
    return withTotals.map((d) => {
      const shareOfVoice =
        grandTotalActive > 0 ? Math.round((d.activeTotal / grandTotalActive) * 100) : 0;
      return {
        ...d,
        shareOfVoice,
      };
    });
  }, [selectedEngines]);

  // --------------------------------------------------------------------------
  // Recalculate Competitor Matchup Metrics Dynamically
  // --------------------------------------------------------------------------
  const processedCompetitors = React.useMemo(() => {
    return RAW_COMPETITORS.map((c) => {
      const activeEnginesCount = selectedEngines.length || 1;

      // Recompute weighted average visibility score across active engines only
      const totalScoreSum = selectedEngines.reduce(
        (sum, engId) => sum + (c.engineScores[engId] || 0),
        0
      );
      const dynamicScore = Math.round(totalScoreSum / activeEnginesCount);

      // Recompute active citations
      const dynamicCitations = selectedEngines.reduce(
        (sum, engId) => sum + (c.engineCitations[engId] || 0),
        0
      );

      return {
        ...c,
        dynamicScore,
        dynamicCitations,
      };
    });
  }, [selectedEngines]);

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
      {/* View Mode Segmented Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/40 dark:bg-zinc-900/30">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {viewMode === 'domains' ? 'Citation & Authority Domain Breakdown' : 'Competitive Head-to-Head Matchup'}
            </h2>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              Live Filtered ({activeEnginesList.length} Engines)
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            {viewMode === 'domains'
              ? 'Real-time citation distribution across tracked generative search platforms'
              : 'Comparative visibility share and prompt displacement against main competitors'}
          </p>
        </div>

        {/* Segmented Control Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-gray-200/70 dark:bg-zinc-800 border border-gray-300/60 dark:border-zinc-700/60 shadow-inner select-none self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('domains')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              viewMode === 'domains'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Domain View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('competitors')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              viewMode === 'competitors'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs font-semibold'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Competitor Matchup</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW STATE A: Domain View */}
      {/* ========================================================================= */}
      {viewMode === 'domains' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-5 min-w-[220px]">Domain / Citation Source</th>
                {activeEnginesList.map((eng) => (
                  <th key={eng.id} className="py-3 px-3 text-center whitespace-nowrap">
                    <span className={cn('font-semibold', eng.badgeColor)}>
                      {eng.shortName}
                    </span>
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold text-gray-700 dark:text-zinc-300">
                  Total Citations
                </th>
                <th className="py-3 px-5 min-w-[140px]">Share of Voice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
              {processedDomains.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group',
                      item.isTargetBrand && 'bg-blue-50/20 dark:bg-blue-950/10'
                    )}
                  >
                    {/* Domain Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                            item.faviconBg
                          )}
                        >
                          {item.faviconText}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span>{item.domain}</span>
                            {item.isTargetBrand && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Target Brand
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                            {item.category}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Active Engine Citations */}
                    {activeEnginesList.map((eng) => {
                      const count = item.engineCitations[eng.id] || 0;
                      return (
                        <td key={eng.id} className="py-4 px-3 text-center font-mono">
                          <span
                            className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-md inline-block',
                              count >= 40
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold'
                                : count >= 25
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                                : 'text-gray-600 dark:text-zinc-400'
                            )}
                          >
                            {count}
                          </span>
                        </td>
                      );
                    })}

                    {/* Recomputed Total Active Citations */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-bold text-gray-900 dark:text-white px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800">
                        {item.activeTotal}
                      </span>
                    </td>

                    {/* Share of Voice Progress */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-900 dark:text-zinc-100">
                          <span>{item.shareOfVoice}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${item.shareOfVoice}%` }}
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              item.isTargetBrand
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                                : item.shareOfVoice >= 15
                                ? 'bg-emerald-500'
                                : 'bg-gray-400 dark:bg-zinc-600'
                            )}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW STATE B: Competitor Matchup */}
      {/* ========================================================================= */}
      {viewMode === 'competitors' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-5 min-w-[200px]">Brand / Competitor</th>
                <th className="py-3 px-4 text-center">Visibility Score</th>
                <th className="py-3 px-4 text-center">Displacement Win Rate</th>
                <th className="py-3 px-4 text-center">Active Citations</th>
                <th className="py-3 px-5 min-w-[240px]">Active Engine Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
              {processedCompetitors.map((comp) => {
                const isTarget = comp.isTargetBrand;

                return (
                  <tr
                    key={comp.id}
                    className={cn(
                      'hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group',
                      isTarget && 'bg-blue-50/20 dark:bg-blue-950/10 font-medium'
                    )}
                  >
                    {/* Brand Name */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                            isTarget
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300'
                          )}
                        >
                          {comp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-zinc-100">
                            <span>{comp.name}</span>
                            {isTarget && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                Your Brand
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                            {comp.domain}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dynamic Visibility Score Badge */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-2xs',
                            comp.dynamicScore >= 90
                              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                              : comp.dynamicScore >= 75
                              ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                          )}
                        >
                          {comp.dynamicScore}
                        </div>
                      </div>
                    </td>

                    {/* Win Rate */}
                    <td className="py-4 px-4 text-center">
                      {isTarget ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Benchmark (#1)</span>
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span
                            className={cn(
                              'text-xs font-semibold',
                              comp.winRateAgainstTarget < 20
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            )}
                          >
                            {comp.winRateAgainstTarget}% Win Rate
                          </span>
                          <div className="text-[10px] text-gray-400">
                            Stripe leads {100 - comp.winRateAgainstTarget}%
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Active Citations */}
                    <td className="py-4 px-4 text-center">
                      <span className="text-xs font-bold text-gray-900 dark:text-white px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800">
                        {comp.dynamicCitations}
                      </span>
                    </td>

                    {/* Engine Distribution Pills */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {activeEnginesList.map((eng) => {
                          const engScore = comp.engineScores[eng.id] || 0;
                          return (
                            <span
                              key={eng.id}
                              title={`${eng.name}: Score ${engScore}`}
                              className={cn(
                                'text-[10px] font-mono px-2 py-0.5 rounded-md border font-medium flex items-center gap-1',
                                engScore >= 85
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                                  : engScore >= 70
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60'
                                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200/60 dark:border-zinc-700/60'
                              )}
                            >
                              <span>{eng.shortName}:</span>
                              <span className="font-bold">{engScore}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
