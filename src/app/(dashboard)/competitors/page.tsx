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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DomainFavicon } from '@/components/ui/domain-favicon';
import { getBrandKitData, saveBrandProfile } from '@/lib/actions/brand-kit';

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

export default function CompetitorsPage() {
  const [brandName, setBrandName] = React.useState('Acme Sync');
  const [brandDomain, setBrandDomain] = React.useState('acmelabs.com');
  const [competitorsList, setCompetitorsList] = React.useState<{ id: string; name: string; domain: string }[]>([
    { id: 'c-1', name: 'OmniSync', domain: 'omnisync.com' },
    { id: 'c-2', name: 'Nexus AI', domain: 'nexusai.io' },
    { id: 'c-3', name: 'Apex Platform', domain: 'apexplatform.com' },
  ]);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBrandKitData();
      if (data.brand) {
        if (data.brand.name) setBrandName(data.brand.name);
        if (data.brand.domain) setBrandDomain(data.brand.domain);
        if (data.brand.competitors && data.brand.competitors.length > 0) {
          setCompetitorsList(data.brand.competitors);
        }
      }
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

    const domain =
      newCompDomain.trim() ||
      `${newCompName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    const updated = [
      ...competitorsList,
      {
        id: `c-${Date.now()}`,
        name: newCompName.trim(),
        domain,
      },
    ];

    setCompetitorsList(updated);
    setNewCompName('');
    setNewCompDomain('');

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
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    const updated = competitorsList.filter((c) => c.id !== id);
    setCompetitorsList(updated);

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
    }
  };

  const competitorRows: CompetitorRow[] = [
    {
      id: 'brand-main',
      name: brandName,
      domain: brandDomain,
      sov: 44,
      citations: 1428,
      topEngine: 'ChatGPT (88%)',
      weakestEngine: 'Claude (69%)',
      displacementScore: 82,
      status: 'Leading',
    },
    ...competitorsList.map((comp, idx) => {
      const mockSovs = [28, 18, 10, 8, 5];
      const mockCitations = [890, 540, 310, 240, 150];
      const mockDisplacement = [64, 48, 32, 25, 18];
      const sov = mockSovs[idx % mockSovs.length];

      return {
        id: comp.id,
        name: comp.name,
        domain: comp.domain,
        sov,
        citations: mockCitations[idx % mockCitations.length],
        topEngine: 'Perplexity (74%)',
        weakestEngine: 'Gemini (41%)',
        displacementScore: mockDisplacement[idx % mockDisplacement.length],
        status: (sov >= 30 ? 'Leading' : sov >= 15 ? 'Contested' : 'Trailing') as any,
      };
    }),
  ];

  const filteredRows = competitorRows.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Research & Intelligence
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Market Share of Voice
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Competitor Intelligence & Share of Voice
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Benchmark your generative search visibility against rival domains across LLM answer engines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 font-mono">
            {competitorsList.length} Tracked Rivals
          </span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold text-slate-500">Your Share of Voice</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">44.0%</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">+4.2% MoM</span>
          </div>
          <p className="text-[11px] text-slate-400">Leading position across commercial prompts</p>
        </div>

        <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold text-slate-500">Primary Rival ({competitorsList[0]?.name || 'OmniSync'})</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">28.0%</span>
            <span className="text-xs font-bold text-rose-600 font-mono">-1.8% MoM</span>
          </div>
          <p className="text-[11px] text-slate-400">Contested on technical and API queries</p>
        </div>

        <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-2">
          <div className="text-xs font-semibold text-slate-500">Brand Displacement Margin</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">+16.0%</span>
            <span className="text-xs font-bold text-emerald-600 font-mono">Net Advantage</span>
          </div>
          <p className="text-[11px] text-slate-400">Spread over closest competitor entity</p>
        </div>
      </div>

      {/* Add Competitor Bar */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Add Benchmark Competitor
        </h2>
        <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Competitor brand name (e.g. Fivetran)"
            value={newCompName}
            onChange={(e) => setNewCompName(e.target.value)}
            className="w-full sm:flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <input
            type="text"
            placeholder="Domain URL (e.g. fivetran.com)"
            value={newCompDomain}
            onChange={(e) => setNewCompDomain(e.target.value)}
            className="w-full sm:flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
          />
          <Button
            type="submit"
            disabled={!newCompName.trim() || isSaving}
            className="w-full sm:w-auto h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Competitor</span>
          </Button>
        </form>
      </div>

      {/* Competitors Head-to-Head Table */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Head-to-Head Entity Performance
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Live generative search mention rates and displacement ratings
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entities..."
              className="w-full h-8.5 pl-8.5 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/40 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-3 px-6 w-[34%] min-w-[240px]">Entity / Domain</th>
                <th className="py-3 px-6 w-[16%] text-center min-w-[120px]">Share of Voice</th>
                <th className="py-3 px-6 w-[18%] min-w-[140px]">Top Engine</th>
                <th className="py-3 px-6 w-[18%] min-w-[140px]">Weakest Engine</th>
                <th className="py-3 px-6 w-[14%] text-right min-w-[110px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {filteredRows.map((row) => {
                const isUserBrand = row.id === 'brand-main';

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors',
                      isUserBrand
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/20 font-semibold'
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                    )}
                  >
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
                            <span className="font-bold text-slate-900 dark:text-white">
                              {row.name}
                            </span>
                            {isUserBrand && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                                YOU
                              </span>
                            )}
                            {row.domain && (
                              <a
                                href={`https://${row.domain}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-indigo-600"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {row.domain}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {row.sov}%
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {row.topEngine}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs text-slate-500">
                        {row.weakestEngine}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span
                          className={cn(
                            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                            row.status === 'Leading' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
                            row.status === 'Contested' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
                            row.status === 'Trailing' && 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                          )}
                        >
                          {row.status}
                        </span>

                        {!isUserBrand && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(row.id)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                            title="Remove rival"
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
    </div>
  );
}
