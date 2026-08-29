'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  RotateCw,
  ShieldCheck,
  Globe,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Eye,
  PieChart as PieIcon,
  MessageSquare,
  Heart,
  BarChart3,
  Maximize2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/actions/dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { VisibilityTrendChart, KpiTimeSeriesPoint, MetricKey } from '@/components/dashboard/visibility-trend-chart';
import { CompetitorSovBarChart } from '@/components/dashboard/competitor-sov-bar-chart';
import { PlatformVisibilityBarChart, PlatformScore } from '@/components/dashboard/platform-visibility-bar-chart';
import { useFilterContext } from '@/context/filter-context';

export type AIEngineName = 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Claude' | 'Copilot';
export type ViewState = 'domain' | 'competitor';

export interface EngineConfig {
  name: AIEngineName;
  short: string;
  color: string;
  activeColor: string;
  activeBg: string;
}

const ENGINES: EngineConfig[] = [
  {
    name: 'ChatGPT',
    short: 'GPT-4o',
    color: '#10a37f',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
    activeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
  },
  {
    name: 'Perplexity',
    short: 'Sonar',
    color: '#06b6d4',
    activeColor: 'text-cyan-600 dark:text-cyan-400',
    activeBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300',
  },
  {
    name: 'Gemini',
    short: 'Flash',
    color: '#3b82f6',
    activeColor: 'text-blue-600 dark:text-blue-400',
    activeBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
  },
  {
    name: 'Claude',
    short: 'Sonnet',
    color: '#f59e0b',
    activeColor: 'text-amber-600 dark:text-amber-400',
    activeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
  },
  {
    name: 'Copilot',
    short: 'Bing',
    color: '#8b5cf6',
    activeColor: 'text-indigo-600 dark:text-indigo-400',
    activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300',
  },
];

import { useRouter } from 'next/navigation';
import { Printer, FileText } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { dateRange, isSampleData } = useFilterContext();
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);

  // Selected KPI Metric driving the main trendline chart
  const [selectedMetric, setSelectedMetric] = React.useState<MetricKey>('visibility');

  // Active Engines & View State
  const [activeEngines, setActiveEngines] = React.useState<AIEngineName[]>([
    'ChatGPT',
    'Perplexity',
    'Gemini',
    'Claude',
    'Copilot',
  ]);
  const [viewState, setViewState] = React.useState<ViewState>('domain');
  const [isTableExpanded, setIsTableExpanded] = React.useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const targetId = 'default';
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      });
      const data = await res.json();
      if (data.success && data.report?.workspaceId) {
        router.push(`/reports/${data.report.workspaceId}`);
      } else {
        router.push('/reports/default');
      }
    } catch (e) {
      router.push('/reports/default');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Load metrics from Supabase
  const loadDashboardData = React.useCallback(async () => {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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


  // =========================================================================
  // DYNAMIC COMPUTATIONS & GLOBAL FILTER REACTIVITY
  // =========================================================================

  // Dynamic filter factor based on active engines ratio
  const engineFactor = React.useMemo(() => {
    return activeEngines.length / 5;
  }, [activeEngines]);

  // Date range multiplier factor
  const dateMultiplier = React.useMemo(() => {
    if (dateRange === 'Last 7 Days') return 1.02;
    if (dateRange === 'Last 90 Days') return 0.96;
    if (dateRange === 'Year to Date') return 0.94;
    return 1.0; // Last 30 Days
  }, [dateRange]);

  // Top 4 KPI Metrics
  // 1. AI Visibility (78/100, Excellent)
  const dynamicVisibility = React.useMemo(() => {
    if (!isSampleData && metrics?.overallScore) {
      return Math.round(metrics.overallScore);
    }
    const base = 78;
    const val = Math.round(base * (0.85 + 0.15 * engineFactor) * dateMultiplier);
    return Math.min(100, Math.max(40, val));
  }, [isSampleData, metrics, engineFactor, dateMultiplier]);

  // 2. AI Share of Voice (42%)
  const dynamicSov = React.useMemo(() => {
    if (!isSampleData && metrics?.shareOfVoice) {
      return Math.round(metrics.shareOfVoice);
    }
    const base = 42;
    const val = Math.round(base * (0.88 + 0.12 * engineFactor) * dateMultiplier);
    return Math.min(100, Math.max(15, val));
  }, [isSampleData, metrics, engineFactor, dateMultiplier]);

  // Competitor Share of Voice
  const competitorSov = React.useMemo(() => {
    return 100 - dynamicSov;
  }, [dynamicSov]);

  // 3. AI Mentions (44/56)
  const dynamicMentions = React.useMemo(() => {
    const totalPrompts = 56;
    const baseMentions = 44;
    const mentionsCount = Math.round(baseMentions * (0.8 + 0.2 * engineFactor) * dateMultiplier);
    const clampedCount = Math.min(totalPrompts, Math.max(10, mentionsCount));
    const rate = Math.round((clampedCount / totalPrompts) * 100);
    return {
      text: `${clampedCount}/${totalPrompts}`,
      count: clampedCount,
      total: totalPrompts,
      rate,
    };
  }, [engineFactor, dateMultiplier]);

  // 4. Brand Sentiment Score (92% Positive)
  const dynamicSentiment = React.useMemo(() => {
    const basePos = 92;
    const pos = Math.min(99, Math.max(70, Math.round(basePos * (0.92 + 0.08 * engineFactor) * dateMultiplier)));
    const neu = Math.max(2, Math.round((100 - pos) * 0.6));
    const neg = Math.max(1, 100 - pos - neu);
    return {
      percentage: pos,
      breakdown: {
        positive: pos,
        neutral: neu,
        negative: neg,
      },
    };
  }, [engineFactor, dateMultiplier]);

  // Historical 4-KPI Multi-Line Time Series Data
  const dynamicTimeSeriesData = React.useMemo<KpiTimeSeriesPoint[]>(() => {
    const pointsCount = dateRange === 'Last 7 Days' ? 7 : dateRange === 'Last 90 Days' ? 12 : 8;
    const dates =
      dateRange === 'Last 7 Days'
        ? ['Aug 21', 'Aug 22', 'Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27']
        : dateRange === 'Last 90 Days'
        ? ['Jun 01', 'Jun 15', 'Jul 01', 'Jul 15', 'Aug 01', 'Aug 10', 'Aug 15', 'Aug 20', 'Aug 23', 'Aug 25', 'Aug 26', 'Aug 27']
        : ['Aug 01', 'Aug 05', 'Aug 09', 'Aug 13', 'Aug 17', 'Aug 21', 'Aug 25', 'Aug 27'];

    return dates.map((dateStr, idx) => {
      const progress = (idx + 1) / dates.length;
      const vis = Math.round(dynamicVisibility - (1 - progress) * 10);
      const sov = Math.round(dynamicSov - (1 - progress) * 8);
      const menRate = Math.round(dynamicMentions.rate - (1 - progress) * 15);
      const menRawCount = Math.round(dynamicMentions.count - (1 - progress) * 8);
      const sent = Math.round(dynamicSentiment.percentage - (1 - progress) * 8);

      return {
        date: dateStr,
        visibility: Math.min(100, Math.max(20, vis)),
        shareOfVoice: Math.min(100, Math.max(10, sov)),
        mentions: Math.min(100, Math.max(10, menRate)),
        mentionsRaw: `${menRawCount}/${dynamicMentions.total}`,
        sentiment: Math.min(100, Math.max(40, sent)),
      };
    });
  }, [dateRange, dynamicVisibility, dynamicSov, dynamicMentions, dynamicSentiment]);

  // Platform Visibility Breakdown Data (Filtered to active engines)
  const dynamicPlatformScores = React.useMemo<PlatformScore[]>(() => {
    const allPlatforms: PlatformScore[] = [
      { name: 'ChatGPT', score: 86, color: '#10a37f', mentionRate: 82 },
      { name: 'Perplexity', score: 92, color: '#06b6d4', mentionRate: 90 },
      { name: 'Gemini', score: 74, color: '#3b82f6', mentionRate: 68 },
      { name: 'Claude', score: 81, color: '#f59e0b', mentionRate: 76 },
      { name: 'Copilot', score: 68, color: '#8b5cf6', mentionRate: 64 },
    ];

    return allPlatforms
      .filter((p) => activeEngines.some((ae) => ae.toLowerCase() === p.name.toLowerCase()))
      .map((p) => ({
        ...p,
        score: Math.min(100, Math.round(p.score * dateMultiplier)),
        mentionRate: Math.min(100, Math.round((p.mentionRate || 70) * dateMultiplier)),
      }));
  }, [activeEngines, dateMultiplier]);

  // Competitor breakdown items for bar chart
  const competitorItems = React.useMemo(() => {
    return [
      { name: 'Acme Sync (You)', share: dynamicSov, color: '#3b82f6', isUser: true, delta: '+3.2%', domain: 'acmelabs.com' },
      { name: 'Competitor Alpha (Omni)', share: 26, color: '#8b5cf6', isUser: false, delta: '-1.4%', domain: 'omnisync.com' },
      { name: 'Competitor Beta (Nexus)', share: 18, color: '#06b6d4', isUser: false, delta: '-0.8%', domain: 'nexusai.io' },
      { name: 'Competitor Gamma (Apex)', share: 14, color: '#f59e0b', isUser: false, delta: '+0.5%', domain: 'apexplatform.com' },
    ];
  }, [dynamicSov]);

  // Dynamic Domain Table Rows
  const dynamicDomainRows = React.useMemo(() => {
    const defaultDomains = [
      {
        id: 'cit-1',
        target: 'Acme Product Overview & Core API Docs',
        domainUrl: 'acmelabs.com/docs/api',
        faviconText: 'A',
        faviconBg: 'bg-blue-600 text-white',
        overallSov: dynamicVisibility,
        topEngine: { name: activeEngines[0] || 'Perplexity', score: `${Math.min(99, dynamicVisibility + 12)}% SOV` },
        weakestEngine: { name: activeEngines[activeEngines.length - 1] || 'Copilot', score: `${Math.max(10, dynamicVisibility - 18)}% SOV` },
        status: { label: '0 Issues', variant: 'healthy' as const },
      },
      {
        id: 'cit-2',
        target: 'Acme Developer Quickstart & Guides',
        domainUrl: 'acmelabs.com/quickstart',
        faviconText: 'A',
        faviconBg: 'bg-blue-600 text-white',
        overallSov: Math.round(dynamicVisibility * 0.88),
        topEngine: { name: activeEngines[1] || 'ChatGPT', score: `${Math.min(95, dynamicVisibility + 6)}% SOV` },
        weakestEngine: { name: activeEngines[activeEngines.length - 1] || 'Copilot', score: `${Math.max(15, dynamicVisibility - 22)}% SOV` },
        status: { label: '0 Issues', variant: 'healthy' as const },
      },
      {
        id: 'cit-3',
        target: 'GitHub Repository & Enterprise SDK',
        domainUrl: 'github.com/acmelabs/beacon-sdk',
        faviconText: 'G',
        faviconBg: 'bg-zinc-800 text-white',
        overallSov: Math.round(dynamicVisibility * 0.76),
        topEngine: { name: 'ChatGPT', score: '82% SOV' },
        weakestEngine: { name: 'Gemini', score: '52% SOV' },
        status: { label: '1 Medium', variant: 'warning' as const },
      },
      {
        id: 'cit-4',
        target: 'TechCrunch Industry Benchmark & Review',
        domainUrl: 'techcrunch.com/features/acme-lab',
        faviconText: 'T',
        faviconBg: 'bg-emerald-600 text-white',
        overallSov: Math.round(dynamicVisibility * 0.64),
        topEngine: { name: 'Perplexity', score: '88% SOV' },
        weakestEngine: { name: 'Claude', score: '44% SOV' },
        status: { label: '0 Issues', variant: 'healthy' as const },
      },
    ];

    return defaultDomains;
  }, [dynamicVisibility, activeEngines]);

  // Dynamic Competitor Rows
  const dynamicCompetitorRows = React.useMemo(() => {
    const targetRow = {
      id: 'target-brand-row',
      target: 'Acme Sync (Your Brand)',
      domainUrl: 'acmelabs.com',
      faviconText: 'A',
      faviconBg: 'bg-blue-600 text-white',
      overallSov: dynamicSov,
      topEngine: { name: activeEngines[0] || 'Perplexity', score: `${Math.min(95, dynamicSov + 12)}% Share` },
      weakestEngine: { name: activeEngines[activeEngines.length - 1] || 'Copilot', score: `${Math.max(15, dynamicSov - 18)}% Share` },
      status: { label: 'Leader', variant: 'healthy' as const },
    };

    const compRows = [
      {
        id: 'comp-row-0',
        target: 'Competitor Alpha (Omni)',
        domainUrl: 'omnisync.com',
        faviconText: 'O',
        faviconBg: 'bg-zinc-700 text-white',
        overallSov: 26,
        topEngine: { name: 'ChatGPT', score: '32% Share' },
        weakestEngine: { name: 'Gemini', score: '18% Share' },
        status: { label: '2 Medium', variant: 'warning' as const },
      },
      {
        id: 'comp-row-1',
        target: 'Competitor Beta (Nexus)',
        domainUrl: 'nexusai.io',
        faviconText: 'N',
        faviconBg: 'bg-zinc-700 text-white',
        overallSov: 18,
        topEngine: { name: 'Perplexity', score: '24% Share' },
        weakestEngine: { name: 'Copilot', score: '12% Share' },
        status: { label: '1 Critical', variant: 'critical' as const },
      },
      {
        id: 'comp-row-2',
        target: 'Competitor Gamma (Apex)',
        domainUrl: 'apexplatform.com',
        faviconText: 'A',
        faviconBg: 'bg-zinc-700 text-white',
        overallSov: 14,
        topEngine: { name: 'Claude', score: '19% Share' },
        weakestEngine: { name: 'ChatGPT', score: '8% Share' },
        status: { label: '0 Issues', variant: 'healthy' as const },
      },
    ];

    return [targetRow, ...compRows];
  }, [dynamicSov, activeEngines]);

  const activeTableRows = viewState === 'domain' ? dynamicDomainRows : dynamicCompetitorRows;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* Global Filter Bar: 5 Toggleable Engine Pills */}
      {/* ===================================================================== */}
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

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-semibold text-gray-900 dark:text-zinc-100">{activeEngines.length}/5</span> Engines Evaluated
          </div>
          <Button
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            {isGeneratingReport ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingReport ? 'Generating...' : 'Generate Executive Report'}</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton or Content */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200/80 bg-white dark:bg-zinc-900 shadow-2xs">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Fetching live telemetry from Beacon database...</span>
        </div>
      ) : (
        <>
          {/* ===================================================================== */}
          {/* Top KPI Cards (Interactive Metric Selector) */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {/* Card 1: AI Visibility */}
            <KpiCard
              title="AI Visibility"
              value={`${dynamicVisibility}/100`}
              change="+14.7%"
              isPositive={true}
              trendColor="emerald"
              badgeText="Excellent"
              badgeVariant="emerald"
              period={dateRange}
              isSelected={selectedMetric === 'visibility'}
              onClick={() => setSelectedMetric('visibility')}
              accentGlow="from-emerald-500/10 to-transparent"
              iconColor="text-emerald-600 dark:text-emerald-400"
            />

            {/* Card 2: AI Share of Voice */}
            <KpiCard
              title="AI Share of Voice"
              value={`${dynamicSov}%`}
              change="+3.2%"
              isPositive={true}
              trendColor="blue"
              badgeText={`${activeEngines.length} Models`}
              badgeVariant="blue"
              period="vs competitors"
              isSelected={selectedMetric === 'shareOfVoice'}
              onClick={() => setSelectedMetric('shareOfVoice')}
              accentGlow="from-blue-500/10 to-transparent"
              iconColor="text-blue-600 dark:text-blue-400"
            />

            {/* Card 3: AI Mentions */}
            <KpiCard
              title="AI Mentions"
              value={dynamicMentions.text}
              change={`+8.5% (${dynamicMentions.rate}%)`}
              isPositive={true}
              trendColor="purple"
              badgeText="Live Citations"
              badgeVariant="purple"
              period="prompts cited"
              isSelected={selectedMetric === 'mentions'}
              onClick={() => setSelectedMetric('mentions')}
              accentGlow="from-purple-500/10 to-transparent"
              iconColor="text-purple-600 dark:text-purple-400"
            />

            {/* Card 4: Sentiment */}
            <KpiCard
              title="Sentiment"
              value={`${dynamicSentiment.percentage}% Positive`}
              period="context sentiment"
              badgeText="Positive"
              badgeVariant="emerald"
              breakdown={dynamicSentiment.breakdown}
              isSelected={selectedMetric === 'sentiment'}
              onClick={() => setSelectedMetric('sentiment')}
              accentGlow="from-amber-500/10 to-transparent"
              iconColor="text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* ===================================================================== */}
          {/* Main Graph Section: Dynamic Single-Metric Trendline */}
          {/* ===================================================================== */}
          <VisibilityTrendChart
            data={dynamicTimeSeriesData}
            dateRange={dateRange}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
          />

          {/* ===================================================================== */}
          {/* Bottom Chart Section: Competitor Breakdown & Platform Visibility */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Chart: Competitor Share of Voice Trend Line Chart */}
            <CompetitorSovBarChart
              userSov={dynamicSov}
              brandName="Acme Sync (You)"
              competitors={competitorItems}
              dateRange={dateRange}
            />

            {/* Right Chart: Brand Visibility by Platform Trend Line Chart */}
            <PlatformVisibilityBarChart
              data={dynamicPlatformScores}
              activeEngines={activeEngines}
              onToggleEngine={toggleEngine}
              dateRange={dateRange}
            />
          </div>

          {/* ===================================================================== */}
          {/* Dual-State Visibility Table */}
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

              {/* Segmented Control Switch & Expand Button */}
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
              </div>
            </div>

            {/* Table Content or Empty State */}
            {activeTableRows.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-xs text-gray-500">No domain or competitor citations recorded yet.</p>
                <Link href="/prompts">
                  <Button size="sm" variant="outline" className="text-xs rounded-xl h-8">
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
                          {/* Target Column */}
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

          {/* Full-Screen Expanded Dual-State Table Dialog Modal */}
          <Dialog open={isTableExpanded} onOpenChange={setIsTableExpanded}>
            <DialogContent className="max-w-6xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
              <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center justify-between pr-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      {viewState === 'domain' ? <Globe className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        {viewState === 'domain' ? 'My Tracked Domains (Expanded View)' : 'Competitor Head-to-Head Matchup (Expanded View)'}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                        {viewState === 'domain'
                          ? 'Detailed citation footprint and performance by AI engine'
                          : 'Comprehensive market share displacement breakdown against competitors'}
                      </DialogDescription>
                    </div>
                  </div>

                  {/* Segmented Control Switch inside modal */}
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
                      <span>Competitors</span>
                    </button>
                  </div>
                </div>
              </DialogHeader>

              {/* Scrollable Table Content */}
              <div className="overflow-auto flex-1 min-h-0 pt-2">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-900 z-10 shadow-2xs">
                    <tr className="border-b border-gray-100 dark:border-zinc-800 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                      <th className="py-3.5 px-6 w-[36%] min-w-[240px]">Target</th>
                      <th className="py-3.5 px-6 w-[16%] text-center min-w-[120px]">Overall SOV</th>
                      <th className="py-3.5 px-6 w-[20%] min-w-[150px]">Top Engine</th>
                      <th className="py-3.5 px-6 w-[20%] min-w-[150px]">Weakest Engine</th>
                      <th className="py-3.5 px-6 w-[8%] text-right min-w-[110px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                    {activeTableRows.map((row) => (
                      <tr key={`modal-row-${row.id}`} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs', row.faviconBg)}>
                              {row.faviconText}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-zinc-100">{row.target}</div>
                              <div className="text-[11px] text-gray-500">{row.domainUrl}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center justify-center">
                            <div className={cn('w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-2xs', row.overallSov >= 50 ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-blue-500 text-blue-700 bg-blue-50')}>
                              {row.overallSov}%
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-900 dark:text-zinc-100">{row.topEngine.name}</div>
                          <div className="text-[11px] text-emerald-600 font-medium">{row.topEngine.score}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-700 dark:text-zinc-300">{row.weakestEngine.name}</div>
                          <div className="text-[11px] text-gray-500">{row.weakestEngine.score}</div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={cn('inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border', row.status.variant === 'critical' && 'bg-rose-50 text-rose-700 border-rose-200', row.status.variant === 'warning' && 'bg-amber-50 text-amber-700 border-amber-200', row.status.variant === 'healthy' && 'bg-emerald-50 text-emerald-700 border-emerald-200')}>
                            {row.status.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
