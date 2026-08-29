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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Source & Citation Intelligence
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              Live Sources
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
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
          <Globe className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            No Cited Sources Recorded Yet
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
            When you run audit queries across AI engines like ChatGPT, Claude, Perplexity, and Gemini, any URLs and domains cited in answers will be automatically indexed here.
          </p>
          <div className="pt-2">
            <Link href="/prompts">
              <Button size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Add & Audit Prompts
              </Button>
            </Link>
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
