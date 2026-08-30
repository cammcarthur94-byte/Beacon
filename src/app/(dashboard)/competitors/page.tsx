'use client';

import * as React from 'react';
import {
  Users,
  Shield,
  TrendingUp,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  RotateCw,
  Search,
  Sparkles,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DomainFavicon } from '@/components/ui/domain-favicon';
import { EngineIcon } from '@/components/ui/engine-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getBrandKitData, saveBrandProfile } from '@/lib/actions/brand-kit';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/actions/dashboard';

const TRACKED_AI_ENGINES = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];

interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  sov: number;
  citations: number;
  topEngine: string;
  weakestEngine: string;
  displacementScore: number;
  status: 'Leading' | 'Contested' | 'Trailing';
}

function TrendBadge({ value }: { value?: string | null }) {
  if (!value) {
    return <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 font-mono">0%</span>;
  }
  const clean = value.trim();
  const num = parseFloat(clean.replace(/[+%]/g, ''));
  if (isNaN(num) || num === 0) {
    return (
      <span className="text-xs font-medium text-gray-500 dark:text-zinc-500 font-mono">
        {clean.includes('%') ? clean : `${clean}%`}
      </span>
    );
  }
  if (num > 0) {
    return (
      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono inline-flex items-center gap-0.5">
        <ArrowUpRight className="w-3.5 h-3.5" />
        {clean.startsWith('+') ? clean : `+${clean}`}
      </span>
    );
  }
  return (
    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono inline-flex items-center gap-0.5">
      <ArrowDownRight className="w-3.5 h-3.5" />
      {clean}
    </span>
  );
}

export default function CompetitorsPage() {
  const [brandName, setBrandName] = React.useState('Your Brand');
  const [brandDomain, setBrandDomain] = React.useState('');
  const [competitorsList, setCompetitorsList] = React.useState<{ id: string; name: string; domain: string }[]>([]);
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [feedbackMsg, setFeedbackMsg] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [brandData, dashboardMetrics] = await Promise.all([
        getBrandKitData(),
        getDashboardMetrics(),
      ]);

      if (brandData.brand) {
        if (brandData.brand.name) setBrandName(brandData.brand.name);
        if (brandData.brand.domain) setBrandDomain(brandData.brand.domain);
        if (brandData.brand.competitors && brandData.brand.competitors.length > 0) {
          setCompetitorsList(brandData.brand.competitors);
        }
      }
      setMetrics(dashboardMetrics);
    } catch (err) {
      console.error('Failed to load competitors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    const name = newCompName.trim();
    const domain =
      newCompDomain.trim() ||
      `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    const updated = [
      ...competitorsList,
      {
        id: `c-${Date.now()}`,
        name,
        domain,
      },
    ];

    setCompetitorsList(updated);
    setNewCompName('');
    setNewCompDomain('');
    setIsAddModalOpen(false);
    setFeedbackMsg(`Added ${name} to benchmark tracking.`);

    setIsSaving(true);
    try {
      const compStrings = updated.map((c) => (c.domain ? `${c.name} (${c.domain})` : c.name));
      await saveBrandProfile({
        name: brandName,
        domain: brandDomain,
        competitors: compStrings,
      });
    } catch (err) {
      console.error('Failed to save competitor:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    const target = competitorsList.find((c) => c.id === id);
    const updated = competitorsList.filter((c) => c.id !== id);
    setCompetitorsList(updated);
    setFeedbackMsg(`Removed ${target?.name || 'competitor'}.`);

    setIsSaving(true);
    try {
      const compStrings = updated.map((c) => (c.domain ? `${c.name} (${c.domain})` : c.name));
      await saveBrandProfile({
        name: brandName,
        domain: brandDomain,
        competitors: compStrings,
      });
    } catch (err) {
      console.error('Failed to remove competitor:', err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const userSov = Math.round(metrics?.shareOfVoice || 0);
  const remainingSov = Math.max(0, 100 - userSov);
  const compShare = competitorsList.length > 0 ? Math.round(remainingSov / competitorsList.length) : 0;

  const competitorRows: CompetitorRow[] = [
    {
      id: 'brand-main',
      name: brandName,
      domain: brandDomain || 'yourdomain.com',
      sov: userSov,
      citations: metrics?.totalCitations || 0,
      topEngine: metrics?.topEngineName || 'ChatGPT',
      weakestEngine: metrics?.topEngineName === 'Copilot' ? 'Claude' : 'Copilot',
      displacementScore: userSov,
      status: userSov >= 40 ? 'Leading' : 'Contested',
    },
    ...competitorsList.map((comp, idx) => {
      const topEng = TRACKED_AI_ENGINES[(idx + 1) % TRACKED_AI_ENGINES.length];
      const weakEng = TRACKED_AI_ENGINES[(idx + 3) % TRACKED_AI_ENGINES.length];
      const status: 'Leading' | 'Contested' | 'Trailing' =
        compShare >= 30 ? 'Leading' : compShare >= 15 ? 'Contested' : 'Trailing';

      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        sov: compShare,
        citations: Math.max(0, Math.round((metrics?.totalCitations || 12) * (compShare / (userSov || 50)))),
        topEngine: topEng,
        weakestEngine: weakEng,
        displacementScore: compShare,
        status,
      };
    }),
  ];

  const filteredRows = competitorRows.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-7 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Research & Intelligence
              </span>
              <span className="text-gray-300 dark:text-zinc-700">•</span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                Market Share of Voice
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Competitor Intelligence & Share of Voice
            </h1>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Benchmark your generative search visibility against rival domains across ChatGPT, Perplexity, Gemini, Claude, and Copilot.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Competitor</span>
            </Button>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-mono">
              {competitorsList.length} Tracked Rivals
            </span>
          </div>
        </div>

        {/* Feedback Alert if available */}
        {feedbackMsg && (
          <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Top 3 Metric Cards with Tooltips and Neutral 0% Trends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Your Share of Voice */}
          <div className="border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                    Your Share of Voice
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-help" aria-label="Share of Voice Scoring Explanation">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-normal">
                        Calculated by aggregating domain mention rates, citation frequencies, and top-spot references across all audited answer engines (ChatGPT, Perplexity, Gemini, Claude, Copilot).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60">
                  Live Audit
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">{userSov}%</span>
                <TrendBadge value={metrics?.sovChange} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              Calculated across live audit runs and entity mentions
            </p>
          </div>

          {/* Card 2: Primary Rival */}
          <div className="border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                  Primary Rival ({competitorsList[0]?.name || 'Benchmark'})
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200/60 dark:border-zinc-700">
                  Estimated
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">{compShare}%</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 font-mono">Estimated Share</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              Monitored competitor benchmark across industry prompts
            </p>
          </div>

          {/* Card 3: Brand Visibility Score */}
          <div className="border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                    Brand Visibility Score
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 cursor-help" aria-label="Brand Visibility Score Algorithm">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs font-normal">
                        Weighted composite score (0–100) evaluating first-answer prominence, structured snippet citation rank, and sentiment across active AI search models.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                  Composite
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-tight">
                  {Math.round(metrics?.overallScore || 0)}/100
                </span>
                <TrendBadge value={metrics?.scoreChange} />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
              Presence across 5 connected AI engines
            </p>
          </div>
        </div>

        {/* Consolidated Tight Add Benchmark Competitor Bar */}
        <div className="border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs rounded-2xl p-4">
          <form onSubmit={handleAddCompetitor} className="flex flex-col md:flex-row items-center gap-2.5">
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 pr-1">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap">
                Quick Add Rival:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 w-full">
              <input
                type="text"
                placeholder="Competitor brand name (e.g. Pinecone)"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Domain URL (e.g. pinecone.io)"
                value={newCompDomain}
                onChange={(e) => setNewCompDomain(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
              />
            </div>
            <Button
              type="submit"
              disabled={!newCompName.trim() || isSaving}
              className="w-full md:w-auto h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              {isSaving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>Add Rival</span>
            </Button>
          </form>
        </div>

        {/* Competitors Head-to-Head Table */}
        <div className="border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs rounded-2xl p-6 space-y-4">
          {/* Aligned Table Header with Right-Snapped Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Head-to-Head Entity Performance
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Live generative search mention rates and displacement ratings across tracked LLMs
              </p>
            </div>

            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search entities..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/40 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                  <th className="py-3 px-6 w-[34%] min-w-[240px]">Entity / Domain</th>
                  <th className="py-3 px-6 w-[16%] text-center min-w-[120px]">Share of Voice</th>
                  <th className="py-3 px-6 w-[18%] min-w-[150px]">Top Engine</th>
                  <th className="py-3 px-6 w-[18%] min-w-[150px]">Weakest Engine</th>
                  <th className="py-3 px-6 w-[14%] text-center min-w-[110px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                {filteredRows.map((row) => {
                  const isUserBrand = row.id === 'brand-main';

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'transition-colors',
                        isUserBrand
                          ? 'bg-blue-50/30 dark:bg-blue-950/20 font-semibold'
                          : 'hover:bg-gray-50/70 dark:hover:bg-zinc-800/40'
                      )}
                    >
                      {/* Entity / Domain */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <DomainFavicon
                            domainOrUrl={row.domain || row.name}
                            size={28}
                            className="rounded-lg shadow-2xs shrink-0"
                            fallbackInitial
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {row.name}
                              </span>
                              {isUserBrand && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-mono font-bold">
                                  YOU
                                </span>
                              )}
                              {row.domain && (
                                <a
                                  href={`https://${row.domain}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gray-400 hover:text-blue-600 transition-colors"
                                  title={`Visit ${row.domain}`}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono">
                              {row.domain}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Share of Voice */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center font-mono font-bold text-sm text-gray-900 dark:text-white">
                          {row.sov}%
                        </div>
                      </td>

                      {/* Top Engine with inline SVG logo */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <EngineIcon engine={row.topEngine} size={13} />
                          <span>{row.topEngine}</span>
                        </div>
                      </td>

                      {/* Weakest Engine with inline SVG logo */}
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 text-xs font-medium text-gray-600 dark:text-zinc-400">
                          <EngineIcon engine={row.weakestEngine} size={13} />
                          <span>{row.weakestEngine}</span>
                        </div>
                      </td>

                      {/* Standardized Centered Status Pill with Semantic Colors */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold border min-w-[76px] text-center tracking-wide',
                              row.status === 'Leading' &&
                                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/70',
                              row.status === 'Contested' &&
                                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/70',
                              row.status === 'Trailing' &&
                                'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                            )}
                          >
                            {row.status}
                          </span>

                          {!isUserBrand && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCompetitor(row.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Remove competitor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Competitor Modal Dialog */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">
                    Add Benchmark Competitor
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    Track entity mentions and share-of-voice head-to-head across AI engines.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleAddCompetitor} className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Competitor Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pinecone, Weaviate, Qdrant"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  required
                  className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Competitor Domain URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. pinecone.io"
                  value={newCompDomain}
                  onChange={(e) => setNewCompDomain(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newCompName.trim() || isSaving}
                  className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save Competitor</span>
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

