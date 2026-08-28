'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  Maximize2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuditRunItem, EngineType, SentimentType } from '@/types/responses';
import { EngineIcon } from '@/components/ui/engine-icon';

interface ResponseFeedProps {
  items: AuditRunItem[];
  onSelectAudit: (item: AuditRunItem) => void;
  selectedAuditId?: string | null;
}

const ENGINE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  ChatGPT: {
    label: 'ChatGPT',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dot: 'bg-emerald-500',
  },
  Perplexity: {
    label: 'Perplexity',
    bg: 'bg-cyan-50 dark:bg-cyan-950/60',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-800/60',
    dot: 'bg-cyan-500',
  },
  Gemini: {
    label: 'Gemini',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800/60',
    dot: 'bg-blue-500',
  },
  Claude: {
    label: 'Claude',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dot: 'bg-amber-500',
  },
  Copilot: {
    label: 'Copilot',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800/60',
    dot: 'bg-purple-500',
  },
};

const ALL_ENGINES: EngineType[] = [
  'ChatGPT',
  'Perplexity',
  'Gemini',
  'Claude',
  'Copilot',
];

export function ResponseFeed({
  items,
  onSelectAudit,
  selectedAuditId,
}: ResponseFeedProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEngine, setSelectedEngine] = React.useState<'ALL' | EngineType>('ALL');
  const [selectedSentiment, setSelectedSentiment] = React.useState<'ALL' | SentimentType>('ALL');
  const [citationFilter, setCitationFilter] = React.useState<'ALL' | 'CITED' | 'NOT_CITED'>('ALL');

  // Filtered dataset
  const filteredItems = React.useMemo(() => {
    return items.filter((item) => {
      // Search matches prompt, response snippet, or cited domains
      const matchesSearch =
        item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rawResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citations.some((c) =>
          c.domain.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Engine match
      const matchesEngine =
        selectedEngine === 'ALL' || item.engine === selectedEngine;

      // Sentiment match
      const matchesSentiment =
        selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;

      // Citation match
      const matchesCitation =
        citationFilter === 'ALL' ||
        (citationFilter === 'CITED' && item.isBrandCited) ||
        (citationFilter === 'NOT_CITED' && !item.isBrandCited);

      return matchesSearch && matchesEngine && matchesSentiment && matchesCitation;
    });
  }, [items, searchQuery, selectedEngine, selectedSentiment, citationFilter]);

  return (
    <div className="space-y-4">
      {/* 1. Feed Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search responses, prompts, or cited domains..."
            className="w-full h-9 pl-9.5 pr-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Engine Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedEngine('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                selectedEngine === 'ALL'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              )}
            >
              All Engines ({items.length})
            </button>
            {ALL_ENGINES.map((eng) => (
              <button
                key={eng}
                type="button"
                onClick={() => setSelectedEngine(eng)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                  selectedEngine === eng
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                {eng}
              </button>
            ))}
          </div>

          {/* Citation Status Filter */}
          <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-800 p-0.5 bg-gray-50/50 dark:bg-zinc-800/30">
            <button
              type="button"
              onClick={() => setCitationFilter('ALL')}
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                citationFilter === 'ALL'
                  ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setCitationFilter('CITED')}
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                citationFilter === 'CITED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              Cited Only
            </button>
            <button
              type="button"
              onClick={() => setCitationFilter('NOT_CITED')}
              className={cn(
                'px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer',
                citationFilter === 'NOT_CITED'
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              Not Cited
            </button>
          </div>

          {/* Expand Feed Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            title="Expand feed"
            className="h-8.5 px-2.5 text-xs rounded-xl border-gray-200 dark:border-zinc-800 gap-1.5 cursor-pointer text-gray-700 dark:text-zinc-300 shrink-0"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </Button>
        </div>
      </div>

      {/* 2. Master List Feed Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-2">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            No matching response logs found
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search terms or filter selections to view audit runs.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const engConfig = ENGINE_CONFIG[item.engine] || {
              label: item.engine,
              bg: 'bg-blue-50 dark:bg-blue-950/60',
              text: 'text-blue-700 dark:text-blue-300',
              border: 'border-blue-200 dark:border-blue-800/60',
              dot: 'bg-blue-500',
            };

            const isSelected = selectedAuditId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectAudit(item)}
                className={cn(
                  'p-4 rounded-xl border transition-all cursor-pointer group select-none flex flex-col sm:flex-row sm:items-center justify-between gap-4',
                  isSelected
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-400 dark:border-blue-700 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 hover:shadow-2xs'
                )}
              >
                {/* Left Area: Engine Badge + Timestamp + Truncated Prompt Snippet */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Engine Badge */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0',
                      engConfig.bg,
                      engConfig.text,
                      engConfig.border
                    )}
                  >
                    <EngineIcon engine={item.engine} size={13} />
                    <span>{item.engine}</span>
                  </span>

                  {/* Relative Timestamp */}
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeAgo}</span>
                  </span>

                  <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">•</span>

                  {/* Truncated Single-Line Prompt Snippet */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      &ldquo;{item.prompt}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right Area: Citation Indicator + Sentiment Badge + Rank Placement */}
                <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                  
                  {/* 1. Visual Citation Indicator (Green Checkmark or Red 'X') */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.isBrandCited ? (
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

                  {/* 2. Tailwind Styled Sentiment Badge */}
                  <div className="shrink-0">
                    <span
                      className={cn(
                        'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold',
                        item.sentiment === 'Positive' &&
                          'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
                        item.sentiment === 'Neutral' &&
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300',
                        (item.sentiment === 'Negative' || item.sentiment === 'Omitted') &&
                          'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                      )}
                    >
                      {item.sentiment}
                    </span>
                  </div>

                  {/* 3. Rank Placement Indicator */}
                  <div className="w-16 text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100">
                      {item.mentionRank !== null ? `#${item.mentionRank}` : 'Unranked'}
                    </span>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Expanded Master Feed Dialog Modal */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-6xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent AI Audit Runs (Expanded Feed)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    Comprehensive audit log — {filteredItems.length} runs matching criteria
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Search and Filters inside Dialog */}
          <div className="py-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 shrink-0">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt, response, or domain..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedEngine('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                  selectedEngine === 'ALL'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xs'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                All Engines
              </button>
              {ALL_ENGINES.map((eng) => (
                <button
                  key={eng}
                  type="button"
                  onClick={() => setSelectedEngine(eng)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer select-none',
                    selectedEngine === eng
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {eng}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Expanded Feed List */}
          <div className="overflow-auto flex-1 min-h-0 pt-2 space-y-2.5">
            {filteredItems.map((item) => {
              const engConfig = ENGINE_CONFIG[item.engine] || {
                label: item.engine,
                bg: 'bg-blue-50 dark:bg-blue-950/60',
                text: 'text-blue-700 dark:text-blue-300',
                border: 'border-blue-200 dark:border-blue-800/60',
                dot: 'bg-blue-500',
              };

              return (
                <div
                  key={`modal-feed-${item.id}`}
                  onClick={() => {
                    onSelectAudit(item);
                    setIsExpanded(false);
                  }}
                  className="p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0', engConfig.bg, engConfig.text, engConfig.border)}>
                      <EngineIcon engine={item.engine} size={14} />
                      <span>{item.engine}</span>
                    </span>
                    <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.timeAgo}</span>
                    </span>
                    <span className="text-gray-300 dark:text-zinc-700 hidden md:inline">•</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        &ldquo;{item.prompt}&rdquo;
                      </p>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {item.rawResponse}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {item.isBrandCited ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Cited</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Not Cited</span>
                      </span>
                    )}

                    <span className={cn('inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold', item.sentiment === 'Positive' && 'bg-green-100 text-green-800', item.sentiment === 'Neutral' && 'bg-yellow-100 text-yellow-800', (item.sentiment === 'Negative' || item.sentiment === 'Omitted') && 'bg-red-100 text-red-800')}>
                      {item.sentiment}
                    </span>

                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-zinc-100 w-16 text-right">
                      {item.mentionRank !== null ? `#${item.mentionRank}` : 'Unranked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
