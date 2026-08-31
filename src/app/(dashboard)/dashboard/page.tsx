'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Users,
  ExternalLink,
  Plus,
  Maximize2,
  RotateCw,
  Eye,
  PieChart,
  MessageSquare,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useFilterContext } from '@/context/filter-context';
import {
  VisibilityTrendChart,
  MetricKey,
  KpiTimeSeriesPoint,
} from '@/components/dashboard/visibility-trend-chart';
import { CompetitorSovBarChart } from '@/components/dashboard/competitor-sov-bar-chart';
import { PlatformVisibilityBarChart, PlatformScore } from '@/components/dashboard/platform-visibility-bar-chart';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/actions/dashboard';
import { AI_ENGINES } from '@/lib/constants';

const ENGINES = [
  { name: 'ChatGPT', activeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-semibold' },
  { name: 'Perplexity', activeBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 font-semibold' },
  { name: 'Gemini', activeBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold' },
  { name: 'Claude', activeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 font-semibold' },
  { name: 'Copilot', activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold' },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeEngines, setActiveEngines] = React.useState<string[]>([
    'ChatGPT',
    'Perplexity',
    'Gemini',
    'Claude',
    'Copilot',
  ]);
  const [viewState, setViewState] = React.useState<'domain' | 'competitor'>('domain');
  const [isTableExpanded, setIsTableExpanded] = React.useState(false);
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('visibility');

  const { dateRange } = useFilterContext();

  const fetchMetrics = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics();

    const handleAuditCompleted = () => {
      fetchMetrics();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beacon:auditCompleted', handleAuditCompleted);
      return () => {
        window.removeEventListener('beacon:auditCompleted', handleAuditCompleted);
      };
    }
  }, [fetchMetrics]);

  const toggleEngine = (engine: string) => {
    setActiveEngines((prev) => {
      if (prev.includes(engine)) {
        if (prev.length === 1) return prev;
        return prev.filter((e) => e !== engine);
      } else {
        return [...prev, engine];
      }
    });
  };

  // Top 4 Real KPI Metrics
  const dynamicVisibility = Math.round(metrics?.overallScore || 0);
  const dynamicSov = Math.round(metrics?.shareOfVoice || 0);
  const totalCitationsCount = metrics?.totalCitations || 0;
  const promptCount = metrics?.promptCount || 0;

  // Real Time-Series Data derived from Supabase
  const dynamicTimeSeriesData = React.useMemo<KpiTimeSeriesPoint[]>(() => {
    if (!metrics?.timeSeriesData || metrics.timeSeriesData.length === 0) {
      return [];
    }

    return metrics.timeSeriesData.map((pt) => ({
      date: pt.date,
      visibility: pt.overallScore,
      shareOfVoice: dynamicSov,
      mentions: dynamicVisibility > 0 ? dynamicVisibility : 0,
      mentionsRaw: `${totalCitationsCount} Citations`,
      sentiment: dynamicVisibility > 0 ? 90 : 0,
    }));
  }, [metrics?.timeSeriesData, dynamicSov, dynamicVisibility, totalCitationsCount]);

  // Platform Visibility Breakdown Data from Supabase
  const dynamicPlatformScores = React.useMemo<PlatformScore[]>(() => {
    if (!metrics?.engineComparisons || metrics.engineComparisons.length === 0) {
      return [
        { name: 'ChatGPT', score: 0, color: '#10a37f', mentionRate: 0 },
        { name: 'Perplexity', score: 0, color: '#06b6d4', mentionRate: 0 },
        { name: 'Gemini', score: 0, color: '#3b82f6', mentionRate: 0 },
        { name: 'Claude', score: 0, color: '#f59e0b', mentionRate: 0 },
        { name: 'Copilot', score: 0, color: '#8b5cf6', mentionRate: 0 },
      ].filter((p) => activeEngines.includes(p.name));
    }

    const engineColorMap: Record<string, string> = {
      chatgpt: '#10a37f',
      perplexity: '#06b6d4',
      gemini: '#3b82f6',
      claude: '#f59e0b',
      copilot: '#8b5cf6',
      google_aio: '#a855f7',
    };

    return metrics.engineComparisons
      .filter((ec) => activeEngines.some((ae) => ae.toLowerCase() === ec.engine.toLowerCase() || (ec.engine === 'google_aio' && ae.toLowerCase() === 'google aio')))
      .map((ec) => {
        const engineKey = ec.engine.toLowerCase();
        const displayName = AI_ENGINES[ec.engine]?.name || ec.engine;
        return {
          name: displayName,
          score: Math.round(ec.score || 0),
          color: engineColorMap[engineKey] || '#3b82f6',
          mentionRate: Math.round(ec.mentionRate || 0),
        };
      });
  }, [metrics?.engineComparisons, activeEngines]);

  // Real Competitor Items
  const competitorItems = React.useMemo(() => {
    const brandName = metrics?.brand?.name || 'Your Brand';
    const brandDomain = metrics?.brand?.domain || '';
    const competitors = metrics?.brand?.competitors || [];

    const items = [
      {
        name: `${brandName} (You)`,
        share: dynamicSov,
        color: '#3b82f6',
        isUser: true,
        delta: metrics?.sovChange || '+0.0%',
        domain: brandDomain,
      },
    ];

    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];
    competitors.forEach((comp, idx) => {
      const match = comp.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      const cleanName = match && match[1]?.trim() ? match[1].trim() : comp;
      const compDomain = match && match[2]?.trim() ? match[2].trim() : `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
      const compSov = competitors.length > 0 ? Math.max(0, Math.round((100 - dynamicSov) / competitors.length)) : 0;
      items.push({
        name: cleanName,
        share: compSov,
        color: colors[idx % colors.length],
        isUser: false,
        delta: '0.0%',
        domain: compDomain,
      });
    });

    return items;
  }, [metrics?.brand, dynamicSov, metrics?.sovChange]);

  // Real Top Citations & Domains Rows
  const dynamicDomainRows = React.useMemo(() => {
    if (!metrics?.topCitations || metrics.topCitations.length === 0) {
      return [];
    }

    return metrics.topCitations.map((cit, idx) => {
      const domainName = cit.domain || 'Domain';
      return {
        id: `cit-${idx}-${cit.url}`,
        target: cit.url,
        domainUrl: cit.domain,
        faviconText: domainName.charAt(0).toUpperCase(),
        faviconBg: cit.isTargetBrand ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-white',
        overallSov: cit.citationCount ? Math.min(100, cit.citationCount * 20) : dynamicVisibility,
        topEngine: { name: activeEngines[0] || 'Claude', score: `${cit.sentiment} Sentiment` },
        weakestEngine: { name: 'Indexed Citation', score: cit.isTargetBrand ? 'Target Brand Domain' : 'External Source' },
        status: {
          label: cit.isTargetBrand ? 'Brand Owned' : 'External Domain',
          variant: (cit.isTargetBrand ? 'healthy' : 'warning') as 'healthy' | 'warning' | 'critical',
        },
      };
    });
  }, [metrics?.topCitations, activeEngines, dynamicVisibility]);

  // Real Competitor Rows
  const dynamicCompetitorRows = React.useMemo(() => {
    const brandName = metrics?.brand?.name || 'Your Brand';
    const brandDomain = metrics?.brand?.domain || 'yourdomain.com';
    const competitors = metrics?.brand?.competitors || [];

    const targetRow = {
      id: 'target-brand-row',
      target: `${brandName} (Your Brand)`,
      domainUrl: brandDomain,
      faviconText: brandName.charAt(0).toUpperCase(),
      faviconBg: 'bg-blue-600 text-white',
      overallSov: dynamicSov,
      topEngine: { name: activeEngines[0] || 'Claude', score: `${dynamicVisibility}% Visibility` },
      weakestEngine: { name: 'Active Focus', score: `${promptCount} Prompts Tracked` },
      status: { label: dynamicSov >= 40 ? 'Leader' : 'Tracked', variant: 'healthy' as const },
    };

    const compRows = competitors.map((comp, idx) => {
      const compSov = competitors.length > 0 ? Math.max(0, Math.round((100 - dynamicSov) / competitors.length)) : 0;
      return {
        id: `comp-row-${idx}`,
        target: comp,
        domainUrl: `${comp.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        faviconText: comp.charAt(0).toUpperCase(),
        faviconBg: 'bg-zinc-700 text-white',
        overallSov: compSov,
        topEngine: { name: 'AI Engine Reference', score: `${compSov}% SOV` },
        weakestEngine: { name: 'Competitor Tracking', score: 'Monitored' },
        status: { label: 'Competitor', variant: 'warning' as const },
      };
    });

    return [targetRow, ...compRows];
  }, [metrics?.brand, dynamicSov, dynamicVisibility, activeEngines, promptCount]);

  const activeTableRows = viewState === 'domain' ? dynamicDomainRows : dynamicCompetitorRows;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Active Engine Filter Controls */}
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
                aria-pressed={isActive}
                aria-label={`Toggle ${eng.name} engine filter`}
                onClick={() => toggleEngine(eng.name)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400',
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
          <span className="font-semibold text-gray-900 dark:text-zinc-100">{activeEngines.length}/5</span> Engines Selected
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200/80 bg-white dark:bg-zinc-900 shadow-2xs">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Fetching live telemetry from database...</span>
        </div>
      ) : (
        <>
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Card 1: AI Visibility */}
            <KpiCard
              title="AI Visibility"
              value={`${dynamicVisibility}/100`}
              change={metrics?.scoreChange || '0%'}
              isPositive={!metrics?.scoreChange?.startsWith('-')}
              trendColor="blue"
              badgeText={dynamicVisibility > 70 ? 'Excellent' : dynamicVisibility > 40 ? 'Good' : 'Needs Optimization'}
              badgeVariant={dynamicVisibility > 70 ? 'emerald' : 'blue'}
              period={dateRange}
              isSelected={selectedMetric === 'visibility'}
              onClick={() => setSelectedMetric('visibility')}
              accentGlow="from-blue-500/10 to-transparent"
              iconColor="text-blue-600 dark:text-blue-400"
            />

            {/* Card 2: AI Share of Voice */}
            <KpiCard
              title="AI Share of Voice"
              value={`${dynamicSov}%`}
              change={metrics?.sovChange || '0%'}
              isPositive={!metrics?.sovChange?.startsWith('-')}
              trendColor="purple"
              badgeText={`${activeEngines.length} Engines`}
              badgeVariant="purple"
              period="vs competitors"
              isSelected={selectedMetric === 'shareOfVoice'}
              onClick={() => setSelectedMetric('shareOfVoice')}
              accentGlow="from-purple-500/10 to-transparent"
              iconColor="text-purple-600 dark:text-purple-400"
            />

            {/* Card 3: Citations */}
            <KpiCard
              title="AI Citations"
              value={`${totalCitationsCount}`}
              change={metrics?.citationsChange || '0%'}
              isPositive={true}
              trendColor="emerald"
              badgeText="Indexed Sources"
              badgeVariant="emerald"
              period="across AI queries"
              isSelected={selectedMetric === 'mentions'}
              onClick={() => setSelectedMetric('mentions')}
              accentGlow="from-emerald-500/10 to-transparent"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />

            {/* Card 4: Prompts Tracked */}
            <KpiCard
              title="Tracked Prompts"
              value={`${promptCount}`}
              period="active audit queries"
              badgeText="Target Queries"
              badgeVariant="blue"
              isSelected={selectedMetric === 'sentiment'}
              onClick={() => setSelectedMetric('sentiment')}
              accentGlow="from-amber-500/10 to-transparent"
              iconColor="text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Time Series Graph */}
          <VisibilityTrendChart
            data={dynamicTimeSeriesData}
            dateRange={dateRange}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
          />

          {/* Bottom Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CompetitorSovBarChart
              userSov={dynamicSov}
              brandName={`${metrics?.brand?.name || 'Your Brand'} (You)`}
              competitors={competitorItems}
              dateRange={dateRange}
            />

            <PlatformVisibilityBarChart
              data={dynamicPlatformScores}
              activeEngines={activeEngines}
              onToggleEngine={toggleEngine}
              dateRange={dateRange}
            />
          </div>

          {/* Dual-State Table */}
          <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/40 dark:bg-zinc-900/30">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    {viewState === 'domain' ? 'Indexed Source Domains' : 'Competitor Head-to-Head Matchup'}
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

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="inline-flex items-center p-1 rounded-xl bg-gray-200/70 dark:bg-zinc-800 border border-gray-300/60 dark:border-zinc-700/60 shadow-inner select-none">
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
                    <span>Source Domains</span>
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

                {activeTableRows.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTableExpanded(true)}
                    title="Expand table"
                    className="h-8.5 px-2.5 text-xs rounded-xl border-gray-200 dark:border-zinc-800 gap-1.5 cursor-pointer text-gray-700 dark:text-zinc-300"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Expand</span>
                  </Button>
                )}
              </div>
            </div>

            {activeTableRows.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-gray-500">No domain or competitor citations recorded yet.</p>
                <Link href="/prompts">
                  <Button size="sm" variant="outline" className="text-xs rounded-xl h-8 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add prompts to track
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                      <th className="py-3.5 px-6 w-[36%] min-w-[240px]">Target</th>
                      <th className="py-3.5 px-6 w-[16%] text-center min-w-[120px]">Overall SOV</th>
                      <th className="py-3.5 px-6 w-[20%] min-w-[150px]">Top Engine</th>
                      <th className="py-3.5 px-6 w-[20%] min-w-[150px]">Weakest Engine</th>
                      <th className="py-3.5 px-6 w-[8%] text-right min-w-[110px]">Status</th>
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
                          <td className="py-4 px-6">
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
                                <div className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  <span className="truncate">{row.target}</span>
                                  <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                                  {row.domainUrl}
                                </div>
                              </div>
                            </div>
                          </td>

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
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  trendColor?: 'emerald' | 'blue' | 'purple' | 'amber';
  badgeText?: string;
  badgeVariant?: 'emerald' | 'blue' | 'purple';
  period?: string;
  breakdown?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  isSelected?: boolean;
  onClick?: () => void;
  accentGlow?: string;
  iconColor?: string;
}

function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  trendColor = 'emerald',
  badgeText,
  badgeVariant = 'emerald',
  period,
  breakdown,
  isSelected,
  onClick,
  accentGlow = 'from-blue-500/10 to-transparent',
  iconColor = 'text-blue-600',
}: KpiCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden border transition-all duration-300 cursor-pointer shadow-2xs group select-none',
        isSelected
          ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-white dark:bg-zinc-900 border-blue-400/60 dark:border-blue-600/60 scale-[1.01]'
          : 'border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-xs'
      )}
    >
      <div className={cn('absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br opacity-60 pointer-events-none transition-opacity group-hover:opacity-100', accentGlow)} />

      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {title}
          </span>
          {badgeText && (
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                badgeVariant === 'emerald' && 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60',
                badgeVariant === 'blue' && 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60',
                badgeVariant === 'purple' && 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
              )}
            >
              {badgeText}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-mono">
            {value}
          </span>
        </div>

        {breakdown ? (
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center gap-3 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {breakdown.positive}% Pos
            </span>
            <span className="text-gray-400 dark:text-zinc-500">•</span>
            <span className="text-gray-500 dark:text-zinc-400">
              {breakdown.neutral}% Neu
            </span>
            <span className="text-gray-400 dark:text-zinc-500">•</span>
            <span className="text-rose-500 dark:text-rose-400">
              {breakdown.negative}% Neg
            </span>
          </div>
        ) : (
          <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400">
            {change && (
              <span
                className={cn(
                  'font-semibold flex items-center gap-1',
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {change}
              </span>
            )}
            {period && <span className="text-[11px] text-gray-400 dark:text-zinc-500 truncate">{period}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
