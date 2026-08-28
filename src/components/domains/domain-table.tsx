'use client';

import * as React from 'react';
import {
  Search,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Globe,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SourceDomain, DomainCategoryType } from '@/types/domains';
import { DomainFavicon } from '@/components/ui/domain-favicon';

interface DomainTableProps {
  domains: SourceDomain[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  selectedDomain?: string;
  onSelectDomain?: (domain: string) => void;
}

type SortField = 'domain' | 'category' | 'domainAuthority' | 'totalCitations' | 'momChange';
type SortDirection = 'asc' | 'desc';

const CATEGORY_BADGES: Record<
  DomainCategoryType,
  { bg: string; text: string; border: string }
> = {
  'Tech Media': {
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200/80 dark:border-blue-800/60',
  },
  'Review & Aggregator': {
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200/80 dark:border-amber-800/60',
  },
  'Community & Forum': {
    bg: 'bg-orange-50 dark:bg-orange-950/60',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200/80 dark:border-orange-800/60',
  },
  'Analyst & Research': {
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200/80 dark:border-purple-800/60',
  },
  'Official Documentation': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
};

export function DomainTable({
  domains,
  selectedCategory: controlledCategory,
  onSelectCategory,
  selectedDomain: controlledDomain,
  onSelectDomain,
}: DomainTableProps) {
  const [internalCategory, setInternalCategory] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('totalCitations');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');

  const selectedCategory = controlledCategory !== undefined ? controlledCategory : internalCategory;
  const handleCategoryChange = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalCategory(cat);
    }
  };

  const selectedDomain = controlledDomain || '';

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter & Sort Pipeline
  const processedDomains = React.useMemo(() => {
    return domains
      .filter((d) => {
        const matchesSearch =
          d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.url.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === 'ALL' || d.category === selectedCategory;
        const matchesDomain =
          !selectedDomain || d.domain.toLowerCase().includes(selectedDomain.toLowerCase());

        return matchesSearch && matchesCategory && matchesDomain;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [domains, searchQuery, selectedCategory, selectedDomain, sortField, sortDirection]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['Domain', 'Category', 'Domain Authority', 'Total Citations', 'MoM Change %', 'URL'];
    const rows = processedDomains.map((d) => [
      d.domain,
      d.category,
      d.domainAuthority,
      d.totalCitations,
      d.momChange,
      d.url,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `beacon-source-domains-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const categories: DomainCategoryType[] = [
    'Tech Media',
    'Review & Aggregator',
    'Community & Forum',
    'Analyst & Research',
    'Official Documentation',
  ];

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
      
      {/* 1. Header Toolbar with Search, Category Pills, and CSV Export */}
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50 dark:bg-zinc-900/50">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            All Tracked Source Domains ({processedDomains.length})
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            External publisher domains and authority ratings driving generative citations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search domains by name..."
              className="w-full h-8.5 pl-8.5 pr-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => handleCategoryChange('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                selectedCategory === 'ALL'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              )}
            >
              All Types
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8.5 text-xs rounded-xl border-gray-200 dark:border-zinc-800 gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Bar (shown if filtered by Category or Domain from charts) */}
      {(selectedCategory !== 'ALL' || selectedDomain) && (
        <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Active Filters:</span>
            </span>
            {selectedCategory !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 font-semibold border border-blue-200 dark:border-blue-800">
                <span>Category: {selectedCategory}</span>
                <button
                  onClick={() => handleCategoryChange('ALL')}
                  className="hover:text-blue-950 dark:hover:text-white cursor-pointer ml-1"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedDomain && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/80 text-cyan-800 dark:text-cyan-200 font-semibold border border-cyan-200 dark:border-cyan-800">
                <span>Domain: {selectedDomain}</span>
                <button
                  onClick={() => onSelectDomain && onSelectDomain('')}
                  className="hover:text-cyan-950 dark:hover:text-white cursor-pointer ml-1"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              handleCategoryChange('ALL');
              if (onSelectDomain) onSelectDomain('');
            }}
            className="text-xs font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* 2. Responsive Sortable Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/40 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider select-none">
              
              {/* Domain Header */}
              <th
                onClick={() => handleSort('domain')}
                className="py-3 px-5 min-w-[240px] cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Domain</span>
                  {sortField === 'domain' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              {/* Category Header */}
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  {sortField === 'category' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              {/* Domain Authority Header */}
              <th
                onClick={() => handleSort('domainAuthority')}
                className="py-3 px-4 min-w-[170px] cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Domain Authority</span>
                  {sortField === 'domainAuthority' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              {/* Citations Header */}
              <th
                onClick={() => handleSort('totalCitations')}
                className="py-3 px-4 text-right cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Citations</span>
                  {sortField === 'totalCitations' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>

              {/* MoM Change Header */}
              <th
                onClick={() => handleSort('momChange')}
                className="py-3 px-5 text-right cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>MoM Change</span>
                  {sortField === 'momChange' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
            {processedDomains.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No matching source domains found.
                </td>
              </tr>
            ) : (
              processedDomains.map((domain) => {
                const badge = CATEGORY_BADGES[domain.category] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                  border: 'border-gray-200',
                };
                const isPositiveMoM = domain.momChange >= 0;

                return (
                  <tr
                    key={domain.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Domain Name + External Link */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <DomainFavicon
                          domainOrUrl={domain.domain}
                          size={28}
                          className="rounded-lg shadow-2xs shrink-0"
                          fallbackInitial
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900 dark:text-zinc-100">
                              {domain.domain}
                            </span>
                            <a
                              href={domain.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                            </a>
                          </div>
                          <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono truncate block max-w-xs">
                            {domain.url}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category Pill Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(domain.category)}
                        title={`Filter by ${domain.category}`}
                        className={cn(
                          'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity',
                          badge.bg,
                          badge.text,
                          badge.border
                        )}
                      >
                        {domain.category}
                      </button>
                    </td>

                    {/* Domain Authority Number + Horizontal Visual Bar */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-gray-900 dark:text-zinc-100 w-10">
                          DA {domain.domainAuthority}
                        </span>
                        <div className="w-20 h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden shrink-0">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              domain.domainAuthority >= 85
                                ? 'bg-emerald-500'
                                : domain.domainAuthority >= 65
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            )}
                            style={{ width: `${domain.domainAuthority}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Citations Count */}
                    <td className="py-4 px-4 text-right font-bold font-mono text-gray-900 dark:text-white whitespace-nowrap">
                      {domain.totalCitations.toLocaleString()}
                    </td>

                    {/* MoM Percentage Change */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border',
                          isPositiveMoM
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'
                        )}
                      >
                        {isPositiveMoM ? (
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span>
                          {isPositiveMoM ? `+${domain.momChange}%` : `${domain.momChange}%`}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
