'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Globe,
  RotateCw,
  Sparkles,
  Download,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EngineIcon } from '@/components/ui/engine-icon';
import { cn } from '@/lib/utils';
import { getResponseHistory } from '@/lib/actions/responses';
import { getUserBrands } from '@/lib/actions/brands';
import {
  SourceDomain,
  CitationCategoryBreakdown,
  DomainKpiMetrics,
  DomainCategoryType,
} from '@/types/domains';
import { DomainKpis } from '@/components/domains/domain-kpis';
import { DomainCharts } from '@/components/domains/domain-charts';
import { DomainTable } from '@/components/domains/domain-table';

function deduceCategory(domain: string): DomainCategoryType {
  const d = domain.toLowerCase();
  if (d.includes('github') || d.includes('gitlab') || d.includes('docs.') || d.includes('developer.')) {
    return 'Official Documentation';
  }
  if (d.includes('reddit') || d.includes('news.ycombinator') || d.includes('stackoverflow') || d.includes('quora')) {
    return 'Community & Forum';
  }
  if (d.includes('g2.com') || d.includes('capterra') || d.includes('trustradius') || d.includes('softwareadvice')) {
    return 'Review & Aggregator';
  }
  if (d.includes('gartner') || d.includes('forrester') || d.includes('idc.com')) {
    return 'Analyst & Research';
  }
  return 'Tech Media';
}

function calculateCategoryBreakdowns(domains: SourceDomain[]): CitationCategoryBreakdown[] {
  const totalCitations = domains.reduce((acc, d) => acc + d.totalCitations, 0) || 1;
  const map = new Map<DomainCategoryType, { count: number; citations: number }>();

  domains.forEach((d) => {
    if (!map.has(d.category)) {
      map.set(d.category, { count: 0, citations: 0 });
    }
    const item = map.get(d.category)!;
    item.count++;
    item.citations += d.totalCitations;
  });

  const categoryColors: Record<DomainCategoryType, string> = {
    'Tech Media': '#3b82f6',
    'Review & Aggregator': '#10b981',
    'Community & Forum': '#f59e0b',
    'Analyst & Research': '#8b5cf6',
    'Official Documentation': '#06b6d4',
  };

  return Array.from(map.entries()).map(([category, data]) => ({
    category,
    citationsCount: data.citations,
    domainsCount: data.count,
    percentage: Math.round((data.citations / totalCitations) * 100),
    color: categoryColors[category] || '#6b7280',
    barColor: categoryColors[category] || '#6b7280',
  }));
}

function calculateKpiMetrics(domains: SourceDomain[]): DomainKpiMetrics {
  const totalDomains = domains.length;
  const totalCitations = domains.reduce((acc, d) => acc + d.totalCitations, 0);
  const avgDomainAuthority =
    totalDomains > 0
      ? Math.round(domains.reduce((acc, d) => acc + d.domainAuthority, 0) / totalDomains)
      : 0;

  return {
    totalDomains,
    totalDomainsMom: 0,
    totalCitations,
    totalCitationsMom: 0,
    avgDomainAuthority,
    avgDomainAuthorityMom: 0,
    newThisMonth: totalDomains,
    newThisMonthMom: 0,
  };
}

export default function SourceIntelligencePage() {
  const [domains, setDomains] = React.useState<SourceDomain[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);

  // 1. Fetch live citations from Supabase
  const loadData = React.useCallback(async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const respRes = await getResponseHistory();
      if (respRes.success && respRes.data && respRes.data.length > 0) {
        const domainMap = new Map<string, { count: number; url: string; engines: Set<string>; isBrand: boolean }>();

        respRes.data.forEach((r) => {
          r.citations.forEach((c) => {
            const domain = c.domain || c.url.replace(/^https?:\/\//, '').split('/')[0];
            if (!domainMap.has(domain)) {
              domainMap.set(domain, { count: 0, url: c.url, engines: new Set(), isBrand: false });
            }
            domainMap.get(domain)!.count++;
            domainMap.get(domain)!.engines.add(r.engine);
          });
        });

        if (domainMap.size > 0) {
          const liveDomains: SourceDomain[] = Array.from(domainMap.entries()).map(
            ([dom, data], idx) => {
              const category = deduceCategory(dom);
              const da = 85;

              return {
                id: `live-dom-${idx}`,
                domain: dom,
                url: data.url,
                category,
                domainAuthority: da,
                totalCitations: data.count,
                momChange: 0,
                enginesFeeding: Array.from(data.engines),
                firstSeen: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
                lastCited: 'Recently',
                isBrandDomain: false,
              };
            }
          );

          setDomains(liveDomains.sort((a, b) => b.totalCitations - a.totalCitations));
        } else {
          setDomains([]);
        }
      } else {
        setDomains([]);
      }
    } catch (err) {
      console.warn('Error loading live citation sources:', err);
      setDomains([]);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived computations
  const breakdowns = React.useMemo(() => calculateCategoryBreakdowns(domains), [domains]);
  const kpis = React.useMemo(() => calculateKpiMetrics(domains), [domains]);

  const handleManualSync = () => {
    setIsSyncing(true);
    setSyncFeedback('Syncing with database...');
    loadData(false);
    setTimeout(() => setSyncFeedback(null), 3000);
  };

  const handleExportCsv = () => {
    if (domains.length === 0) return;
    const headers = 'Domain,URL,Category,Domain Authority,Total Citations,Feeding Engines\n';
    const rows = domains
      .map(
        (d) =>
          `"${d.domain}","${d.url}","${d.category}",${d.domainAuthority},${d.totalCitations},"${d.enginesFeeding.join(', ')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `beacon-source-intelligence-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Source & Citation Intelligence
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Sources</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Monitor all external web domains, editorial media, and platforms referenced across AI answer engines
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-9 gap-1.5 text-xs font-medium rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RotateCw className={cn('w-3.5 h-3.5 text-gray-500', isSyncing && 'animate-spin')} />
            <span>Sync Sources</span>
          </Button>

          {domains.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleExportCsv}
              className="h-9 gap-1.5 text-xs font-semibold rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sources CSV</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <RotateCw className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs font-medium text-gray-500">
            Indexing citation sources from live database...
          </span>
        </div>
      ) : domains.length === 0 ? (
        /* Empty State with Table Skeleton preview and frosted glass overlay */
        <div className="relative rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 shadow-2xs overflow-hidden min-h-[460px]">
          {/* Wireframe Data Table Background with Light Shading and Subtle Blur */}
          <div className="p-4 sm:p-5 opacity-40 dark:opacity-20 filter blur-[0.6px] pointer-events-none select-none" aria-hidden="true">
            {/* Wireframe Table Header / Toolbar */}
            <div className="p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="space-y-1.5">
                <div className="h-4 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse" />
                <div className="h-3 w-72 bg-gray-150 dark:bg-zinc-800/60 rounded-md" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-44 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
                <div className="h-8 w-24 bg-gray-100 dark:bg-zinc-800 rounded-xl" />
              </div>
            </div>

            {/* Wireframe Category Filter Bar */}
            <div className="flex items-center gap-2 pb-4 overflow-hidden">
              <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded mr-1" />
              <div className="h-7 w-20 bg-gray-900/20 dark:bg-zinc-700 rounded-xl" />
              <div className="h-7 w-24 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200/60 dark:border-blue-800/60" />
              <div className="h-7 w-28 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200/60 dark:border-amber-800/60" />
              <div className="h-7 w-28 bg-orange-50 dark:bg-orange-950/60 rounded-xl border border-orange-200/60 dark:border-orange-800/60" />
              <div className="h-7 w-28 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-200/60 dark:border-purple-800/60" />
            </div>

            {/* Wireframe Table Structure */}
            <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/40 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-[34%] min-w-[220px]">Domain / URL</th>
                    <th className="py-3.5 px-6 w-[18%] min-w-[130px]">Category</th>
                    <th className="py-3.5 px-6 w-[20%] min-w-[140px]">Domain Authority</th>
                    <th className="py-3.5 px-6 w-[12%] min-w-[100px] text-right">Citation Count</th>
                    <th className="py-3.5 px-6 w-[16%] min-w-[130px] text-right">Feeding Engines</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                  {[
                    {
                      domain: 'docs.github.com',
                      url: 'https://docs.github.com/en/actions',
                      category: 'Official Documentation',
                      categoryBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
                      da: 96,
                      citations: 184,
                      engines: ['ChatGPT', 'Perplexity', 'Gemini', 'Claude'],
                    },
                    {
                      domain: 'reddit.com/r/technology',
                      url: 'https://reddit.com/r/technology/comments/...',
                      category: 'Community & Forum',
                      categoryBg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60',
                      da: 91,
                      citations: 142,
                      engines: ['ChatGPT', 'Perplexity', 'Copilot'],
                    },
                    {
                      domain: 'g2.com/categories/analytics',
                      url: 'https://www.g2.com/categories/seo-analytics',
                      category: 'Review & Aggregator',
                      categoryBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
                      da: 89,
                      citations: 118,
                      engines: ['Claude', 'Gemini', 'ChatGPT'],
                    },
                    {
                      domain: 'techcrunch.com/enterprise',
                      url: 'https://techcrunch.com/2026/02/ai-search-engines',
                      category: 'Tech Media',
                      categoryBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
                      da: 94,
                      citations: 95,
                      engines: ['Perplexity', 'Copilot', 'ChatGPT'],
                    },
                    {
                      domain: 'gartner.com/reviews',
                      url: 'https://www.gartner.com/reviews/market',
                      category: 'Analyst & Research',
                      categoryBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
                      da: 92,
                      citations: 67,
                      engines: ['ChatGPT', 'Claude', 'Copilot', 'Gemini'],
                    },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                            {row.domain[0].toUpperCase()}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-semibold text-gray-800 dark:text-zinc-200">{row.domain}</div>
                            <div className="text-[10px] text-gray-400 font-mono truncate max-w-xs">{row.url}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border', row.categoryBg)}>
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold font-mono text-gray-800 dark:text-zinc-200">DA {row.da}</span>
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.da}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <span className="font-mono font-bold text-gray-800 dark:text-zinc-200">{row.citations}</span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {row.engines.map((eng) => (
                            <span key={eng} className="p-1 rounded-md bg-gray-100 dark:bg-zinc-800 inline-flex items-center" title={eng}>
                              <EngineIcon engine={eng} size={13} />
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Centered Empty State Overlay Card */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="max-w-lg w-full p-6 sm:p-8 text-center rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200/90 dark:border-zinc-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-700 dark:text-zinc-300 border border-gray-200/70 dark:border-zinc-700/70 shadow-2xs">
                <Globe className="w-6 h-6 text-gray-700 dark:text-zinc-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  No Cited Sources Recorded Yet
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  When you run audit queries across AI engines like ChatGPT, Claude, Perplexity, Gemini, and Microsoft Copilot, any URLs and domains cited in answers will be automatically indexed here.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/prompts">
                  <Button
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm cursor-pointer gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add & Audit Prompts</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <DomainKpis metrics={kpis} />

          {/* Interactive Chart Analytics */}
          <DomainCharts topDomains={domains} categoryBreakdown={breakdowns} />

          {/* Full Searchable Domain Inventory Table */}
          <DomainTable domains={domains} />
        </>
      )}
    </div>
  );
}
