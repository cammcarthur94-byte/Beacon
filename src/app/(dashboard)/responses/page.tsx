'use client';

import * as React from 'react';
import {
  History,
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getResponseHistory, DbResponseLog } from '@/lib/actions/responses';
import { getUserBrands, DbBrand } from '@/lib/actions/brands';
import {
  AuditRunItem,
  EngineType,
  SentimentType,
  TimelineDataPoint,
  EngineDistributionItem,
} from '@/types/responses';
import { ResponseCharts } from '@/components/responses/response-charts';
import { ResponseFeed } from '@/components/responses/response-feed';
import { InspectionDrawer } from '@/components/responses/inspection-drawer';
import { EngineIcon } from '@/components/ui/engine-icon';

function generateTimelineData(items: AuditRunItem[]): TimelineDataPoint[] {
  if (items.length === 0) {
    return [];
  }

  const groups = new Map<string, Record<EngineType, number[]>>();

  items.forEach((item) => {
    const d = new Date(item.timestamp);
    const key = isNaN(d.getTime())
      ? 'Today'
      : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    if (!groups.has(key)) {
      groups.set(key, { ChatGPT: [], Perplexity: [], Gemini: [], Claude: [], Copilot: [], 'Google AIO': [] });
    }
    const g = groups.get(key)!;
    if (g[item.engine]) g[item.engine].push(item.visibilityScore);
  });

  return Array.from(groups.entries()).map(([date, g]) => ({
    date,
    ChatGPT: g.ChatGPT.length ? Math.round(g.ChatGPT.reduce((a, b) => a + b, 0) / g.ChatGPT.length) : 0,
    Perplexity: g.Perplexity.length ? Math.round(g.Perplexity.reduce((a, b) => a + b, 0) / g.Perplexity.length) : 0,
    Gemini: g.Gemini.length ? Math.round(g.Gemini.reduce((a, b) => a + b, 0) / g.Gemini.length) : 0,
    Claude: g.Claude.length ? Math.round(g.Claude.reduce((a, b) => a + b, 0) / g.Claude.length) : 0,
    Copilot: g.Copilot.length ? Math.round(g.Copilot.reduce((a, b) => a + b, 0) / g.Copilot.length) : 0,
  }));
}

function generateDistributionData(items: AuditRunItem[]): EngineDistributionItem[] {
  const counts: Record<EngineType, number> = {
    ChatGPT: 0,
    Perplexity: 0,
    Gemini: 0,
    Claude: 0,
    Copilot: 0,
    'Google AIO': 0,
  };

  const colors: Record<EngineType, string> = {
    ChatGPT: '#10b981',
    Perplexity: '#06b6d4',
    Gemini: '#3b82f6',
    Claude: '#f59e0b',
    Copilot: '#8b5cf6',
    'Google AIO': '#ec4899',
  };

  items.forEach((item) => {
    if (item.isBrandCited && counts[item.engine] !== undefined) {
      counts[item.engine]++;
    }
  });

  const activeEngines: EngineType[] = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];
  const total = activeEngines.reduce((acc, eng) => acc + (counts[eng] || 0), 0);

  return activeEngines.map((eng) => {
    const count = counts[eng] || 0;
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return {
      name: eng,
      value: count,
      citationsCount: count,
      percentage: pct,
      color: colors[eng],
    };
  });
}

export default function ResponseHistoryPage() {
  const [auditRuns, setAuditRuns] = React.useState<AuditRunItem[]>([]);
  const [targetBrand, setTargetBrand] = React.useState<string>('Your Brand');
  const [brandAliases, setBrandAliases] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedAudit, setSelectedAudit] = React.useState<AuditRunItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [auditFeedback, setAuditFeedback] = React.useState<string | null>(null);

  // 1. Fetch live data from Supabase & active brand
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Brand Profile
      const brandRes = await getUserBrands();
      if (brandRes.success && brandRes.data.length > 0) {
        const primary = brandRes.data[0];
        setTargetBrand(primary.name);
        const aliases = [
          primary.name,
          primary.domain ? primary.domain.split('.')[0] : '',
        ].filter(Boolean);
        setBrandAliases(Array.from(new Set(aliases)));
      }

      // Fetch Response History
      const respRes = await getResponseHistory();
      if (respRes.success && respRes.data && respRes.data.length > 0) {
        const transformed: AuditRunItem[] = respRes.data.map((r) => {
          const rawEng = r.engine.toLowerCase();
          let eng: EngineType = 'ChatGPT';
          if (rawEng.includes('perplexity') || rawEng.includes('sonar')) eng = 'Perplexity';
          else if (rawEng.includes('gemini')) eng = 'Gemini';
          else if (rawEng.includes('claude')) eng = 'Claude';
          else if (rawEng.includes('copilot') || rawEng.includes('bing')) eng = 'Copilot';
          else if (rawEng.includes('google') || rawEng.includes('aio')) eng = 'Google AIO';

          const cited = r.citations.length > 0 || r.rawResponse.toLowerCase().includes(targetBrand.toLowerCase());

          return {
            id: r.id,
            runId: `run-${r.id.substring(0, 6)}`,
            promptId: `p-${r.id.substring(0, 4)}`,
            prompt: r.prompt,
            pillar: (r.pillar as any) || 'GEO',
            intent: (r.intent as any) || 'Informational',
            engine: eng,
            rawResponse: r.rawResponse,
            isBrandCited: cited,
            mentionRank: r.mentionRank || (cited ? 1 : null),
            visibilityScore: r.visibilityScore,
            sentiment: (r.sentiment as SentimentType) || (cited ? 'Positive' : 'Neutral'),
            citations: r.citations.map((c, idx) => ({
              url: c.url,
              domain: c.domain,
              position: c.position || idx + 1,
            })),
            competitorsMentioned: r.competitorsMentioned || [],
            timestamp: r.timestamp,
            timeAgo: r.timeAgo,
            executionType: 'manual',
            durationMs: 1200,
          };
        });

        setAuditRuns(transformed);
      } else {
        setAuditRuns([]);
      }
    } catch (err) {
      console.warn('Error loading live response history:', err);
      setAuditRuns([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetBrand]);

  React.useEffect(() => {
    loadData();

    const handleAuditComplete = () => {
      setAuditFeedback('Audit cycle completed! Feed updated.');
      loadData();
      setTimeout(() => setAuditFeedback(null), 4000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beacon:auditCompleted', handleAuditComplete);
      return () => {
        window.removeEventListener('beacon:auditCompleted', handleAuditComplete);
      };
    }
  }, [loadData]);

  // Handle row selection
  const handleSelectAudit = (item: AuditRunItem) => {
    setSelectedAudit(item);
    setIsDrawerOpen(true);
  };

  // Computed Chart Metrics
  const timelineData = React.useMemo(() => generateTimelineData(auditRuns), [auditRuns]);
  const distributionData = React.useMemo(() => generateDistributionData(auditRuns), [auditRuns]);

  const citedCount = auditRuns.filter((r) => r.isBrandCited).length;
  const overallCitationRate = auditRuns.length > 0 ? Math.round((citedCount / auditRuns.length) * 100) : 0;
  const totalCitationsCount = auditRuns.reduce((acc, r) => acc + (r.citations.length || (r.isBrandCited ? 1 : 0)), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Response History
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>Live Feed</span>
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Dense, scannable feed of AI-generated responses, brand citations, and raw model transcripts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Refresh Button */}
          <Button
            variant="outline"
            onClick={loadData}
            disabled={isLoading}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RotateCw className={cn('w-3.5 h-3.5 text-gray-500', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Audit Feedback Toast */}
      {auditFeedback && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{auditFeedback}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <RotateCw className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs font-medium text-gray-500">
            Loading response history from live database...
          </span>
        </div>
      ) : auditRuns.length === 0 ? (
        <div className="relative rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 shadow-xs overflow-hidden">
          {/* Wireframe Feed Background with Light Shading and Subtle Blur */}
          <div className="p-4 sm:p-6 space-y-3 opacity-35 dark:opacity-20 filter blur-[0.4px] pointer-events-none select-none" aria-hidden="true">
            {/* Wireframe Search & Filter Bar */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="h-8 w-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-7 w-20 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                <div className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
              </div>
            </div>

            {/* Wireframe Feed Placeholder Rows hinting at AI models, timestamps, citation tags, and text snippets */}
            {[
              { engine: 'ChatGPT', bg: 'bg-emerald-50 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/60', time: '12m ago', prompt: 'Best enterprise AI search optimization platform for marketing teams', cited: true, sentiment: 'Positive', rank: '#1' },
              { engine: 'Perplexity', bg: 'bg-cyan-50 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800/60', time: '28m ago', prompt: 'How does brand authority impact generative search engine citations?', cited: true, sentiment: 'Positive', rank: '#2' },
              { engine: 'Claude', bg: 'bg-amber-50 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/60', time: '45m ago', prompt: 'Compare leading Answer Engine Optimization (AEO) tools and software', cited: false, sentiment: 'Neutral', rank: 'Unranked' },
              { engine: 'Gemini', bg: 'bg-blue-50 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/60', time: '1h ago', prompt: 'Top software solutions for monitoring AI visibility in Google AIO', cited: true, sentiment: 'Positive', rank: '#1' },
              { engine: 'Copilot', bg: 'bg-purple-50 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/60', time: '2h ago', prompt: 'Enterprise generative engine optimization tracking and attribution', cited: false, sentiment: 'Neutral', rank: 'Unranked' },
            ].map((mock, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0', mock.bg, mock.text, mock.border)}>
                    <EngineIcon engine={mock.engine} size={13} />
                    <span>{mock.engine}</span>
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{mock.time}</span>
                  </span>
                  <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">•</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">
                      &ldquo;{mock.prompt}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    {mock.cited ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/60" />
                        <span className="hidden md:inline">Cited</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 dark:text-rose-400">
                        <XCircle className="w-4 h-4 text-rose-500 fill-rose-100 dark:fill-rose-950/60" />
                        <span className="hidden md:inline">Not Cited</span>
                      </span>
                    )}
                  </div>
                  <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold', mock.sentiment === 'Positive' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300')}>
                    {mock.sentiment}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100 w-16 text-right">
                    {mock.rank}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* Centered Empty State Callout Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 sm:p-8 text-center rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-600 dark:text-zinc-300 border border-gray-200/60 dark:border-zinc-700/60">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  No Audit Responses Recorded Yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Raw model transcripts and brand citations will appear here after your first evaluation.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/prompts">
                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm cursor-pointer gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Configure Prompts & Run Audit</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Visualizations */}
          <ResponseCharts
            timelineData={timelineData}
            distributionData={distributionData}
            overallCitationRate={overallCitationRate}
            totalCitationsCount={totalCitationsCount}
          />

          {/* Master List Feed */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Recent Audit Run Logs ({auditRuns.length})
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Click any log entry to open the side-by-side inspection drawer and raw LLM transcript
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                Target: <span className="text-blue-600 dark:text-blue-400 font-bold">{targetBrand}</span>
              </span>
            </div>

            <ResponseFeed
              items={auditRuns}
              onSelectAudit={handleSelectAudit}
              selectedAuditId={selectedAudit?.id}
            />
          </div>
        </>
      )}

      {/* Detail Inspection Drawer */}
      <InspectionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        auditItem={selectedAudit}
        targetBrandName={targetBrand}
        brandAliases={brandAliases}
      />
    </div>
  );
}
