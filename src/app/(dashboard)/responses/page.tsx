'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  History,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  FileQuestion,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getResponseHistory, DbResponseLog } from '@/lib/actions/responses';

export default function ResponseHistoryPage() {
  const [responses, setResponses] = React.useState<DbResponseLog[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEngine, setSelectedEngine] = React.useState<string>('ALL');
  const [selectedPillar, setSelectedPillar] = React.useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = React.useState<string>('ALL');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = React.useState<DbResponseLog | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    getResponseHistory().then((res) => {
      if (res.success) {
        setResponses(res.data);
        if (res.data.length > 0) {
          setExpandedId(res.data[0].id);
        }
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  // Copy raw response
  const handleCopyTranscript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredResponses = responses.filter((item) => {
    const matchesSearch =
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rawResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.citations.some((c) => c.domain.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEngine = selectedEngine === 'ALL' || item.engine.toLowerCase().includes(selectedEngine.toLowerCase());
    const matchesPillar = selectedPillar === 'ALL' || item.pillar === selectedPillar;
    const matchesSentiment = selectedSentiment === 'ALL' || item.sentiment.toLowerCase() === selectedSentiment.toLowerCase();

    return matchesSearch && matchesEngine && matchesPillar && matchesSentiment;
  });

  const citedResponsesCount = responses.filter((r) => r.citations.length > 0).length;
  const citationRate = responses.length > 0 ? Math.round((citedResponsesCount / responses.length) * 100) : 0;
  const rank1Count = responses.filter((r) => r.mentionRank === 1).length;
  const rank1Rate = responses.length > 0 ? Math.round((rank1Count / responses.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Response History
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              Live AI Logs
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Inspect exact generated transcripts and citation footprints across ChatGPT, Perplexity, Gemini, Claude, and Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled={responses.length === 0}
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(responses, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `beacon-response-history-${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-2 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            Total Responses Audited
          </span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {responses.length} Runs
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            Across connected models
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            Citation Capture Rate
          </span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {citationRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            {citedResponsesCount} of {responses.length} cited target sources
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            #1 Rank Placement
          </span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {rank1Rate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            Top recommended provider
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, responses, or citations..."
              className="w-full h-8.5 pl-8.5 pr-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Engine Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Copilot'].map((eng) => (
              <button
                key={eng}
                onClick={() => setSelectedEngine(eng)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0',
                  selectedEngine === eng
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-zinc-700 font-semibold'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                {eng === 'ALL' ? 'All Models' : eng}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Pillar Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs"
              >
                <span>{selectedPillar === 'ALL' ? 'All Pillars' : selectedPillar}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => setSelectedPillar('ALL')}>All Pillars</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('GEO')}>GEO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('AEO')}>AEO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('AIO')}>AIO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sentiment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs"
              >
                <span>{selectedSentiment === 'ALL' ? 'All Sentiments' : selectedSentiment}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => setSelectedSentiment('ALL')}>All Sentiments</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Positive')}>Positive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Neutral')}>Neutral</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Negative')}>Negative</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 4. Responses List / Feed */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200/80 bg-white dark:bg-zinc-900 shadow-2xs">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Loading response transcripts from Supabase...</span>
        </div>
      ) : responses.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-xl border border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-3">
          <FileQuestion className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No AI Responses Logged Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Run an AI audit from the Dashboard or Prompts page to trigger LLM answer generation and inspect exact responses.
          </p>
          <Link href="/prompts">
            <Button size="sm" className="h-8.5 text-xs rounded-xl bg-gray-900 hover:bg-black text-white mt-2">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Go to Prompts & Run Audit
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden transition-all"
              >
                {/* Item Summary Header */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/30 dark:bg-zinc-900/30">
                  <div className="flex items-start md:items-center gap-3">
                    {/* Engine Badge */}
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 shrink-0',
                        item.engineBg
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                      {item.engine}
                    </span>

                    <div className="space-y-0.5">
                      <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        &ldquo;{item.prompt}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                        <span>{item.timeAgo}</span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                        <span>•</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          Pillar: {item.pillar}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Badges */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto">
                    {/* Visibility Score */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200/60 dark:border-zinc-700/60 text-xs font-bold text-gray-900 dark:text-zinc-100">
                      <span>Score:</span>
                      <span
                        className={cn(
                          item.visibilityScore >= 90
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.visibilityScore >= 70
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {item.visibilityScore}
                      </span>
                    </div>

                    {/* Mention Rank */}
                    <span
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                        item.mentionRank === 1
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      )}
                    >
                      Rank #{item.mentionRank}
                    </span>

                    {/* Expand Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Deep-Dive Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-100 dark:border-zinc-800 space-y-5 bg-white dark:bg-zinc-900">
                    {/* Raw AI Model Transcript */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          Exact AI Response Transcript
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyTranscript(item.id, item.rawResponse)}
                            className="text-[11px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-800"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveModalItem(item)}
                            className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/40"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Full View</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-zinc-950/60 border border-gray-200/60 dark:border-zinc-800 text-xs text-gray-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                        {item.rawResponse}
                      </div>
                    </div>

                    {/* Detected Citations */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Citations Detected ({item.citations.length})
                      </span>
                      {item.citations.length === 0 ? (
                        <div className="text-xs text-gray-400 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50">
                          No direct citations found in this response.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {item.citations.map((cite, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-2.5 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/40 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {cite.position}
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                                  {cite.domain}
                                </span>
                              </div>
                              <a
                                href={cite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                              >
                                <span>View Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* Deep-Dive Inspection Modal */}
      {/* ===================================================================== */}
      {activeModalItem && (
        <Dialog open={Boolean(activeModalItem)} onOpenChange={(open) => !open && setActiveModalItem(null)}>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-0.5 rounded text-xs font-semibold border', activeModalItem.engineBg)}>
                  {activeModalItem.engine}
                </span>
                <span className="text-xs text-gray-400">• {activeModalItem.timestamp}</span>
              </div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white pt-1">
                &ldquo;{activeModalItem.prompt}&rdquo;
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                Detailed evaluation, full token stream, and source citation map.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Raw AI Model Response
                </span>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeModalItem.rawResponse}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Verified Citations
                </span>
                <div className="space-y-1.5">
                  {activeModalItem.citations.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-700 dark:text-zinc-300 truncate max-w-md">
                        {c.url}
                      </span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 text-[11px]"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveModalItem(null)}
                className="text-xs h-9 rounded-xl border-gray-200 dark:border-zinc-800"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
