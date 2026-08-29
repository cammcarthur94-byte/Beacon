'use client';

import * as React from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ExternalLink,
  Clock,
  Zap,
  Globe,
  Award,
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuditRunItem } from '@/types/responses';
import { HighlightText } from '@/components/responses/highlight-text';
import { EngineIcon } from '@/components/ui/engine-icon';
import { DomainFavicon } from '@/components/ui/domain-favicon';

import { AI_ENGINE_CONFIGS } from '@/config/ai-models';

interface InspectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  auditItem: AuditRunItem | null;
  targetBrandName: string;
  brandAliases?: string[];
}

const ENGINE_BADGES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  ChatGPT: { label: `${AI_ENGINE_CONFIGS.chatgpt.provider} ${AI_ENGINE_CONFIGS.chatgpt.displayModel}`, ...AI_ENGINE_CONFIGS.chatgpt.badgeStyle },
  Perplexity: { label: AI_ENGINE_CONFIGS.perplexity.displayModel, ...AI_ENGINE_CONFIGS.perplexity.badgeStyle },
  Gemini: { label: AI_ENGINE_CONFIGS.gemini.displayModel, ...AI_ENGINE_CONFIGS.gemini.badgeStyle },
  Claude: { label: AI_ENGINE_CONFIGS.claude.displayModel, ...AI_ENGINE_CONFIGS.claude.badgeStyle },
  Copilot: { label: AI_ENGINE_CONFIGS.copilot.displayModel, ...AI_ENGINE_CONFIGS.copilot.badgeStyle },
  'Google AIO': { label: AI_ENGINE_CONFIGS.google_aio.displayModel, ...AI_ENGINE_CONFIGS.google_aio.badgeStyle },
};

export function InspectionDrawer({
  isOpen,
  onClose,
  auditItem,
  targetBrandName,
  brandAliases = [],
}: InspectionDrawerProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const [isJsonCopied, setIsJsonCopied] = React.useState(false);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !auditItem) return null;

  const engineMeta = ENGINE_BADGES[auditItem.engine] || {
    label: auditItem.engine,
    bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(auditItem.rawResponse);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(auditItem, null, 2));
    setIsJsonCopied(true);
    setTimeout(() => setIsJsonCopied(false), 2000);
  };

  const handleExportJson = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(auditItem, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `beacon-audit-${auditItem.engine.toLowerCase()}-${auditItem.id}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop blur overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl lg:max-w-3xl bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-200 dark:border-zinc-800 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
          
          {/* 1. Header Toolbar */}
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                  engineMeta.bg,
                  engineMeta.text
                )}
              >
                <EngineIcon engine={auditItem.engine} size={14} />
                <span>{auditItem.engine}</span>
              </span>

              <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">
                {engineMeta.label}
              </span>

              <span className="text-gray-300 dark:text-zinc-700">•</span>

              <span className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{auditItem.timeAgo}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyResponse}
                className="h-8 text-xs gap-1.5 border-gray-200 dark:border-zinc-800 rounded-xl"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Scrollable Body (Split View) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Prompt Container (Subtle Gray Container) */}
            <div className="p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-800/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
                <span className="uppercase tracking-wider">Executed Prompt / Query</span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono">
                    {auditItem.pillar}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                    {auditItem.intent}
                  </span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 leading-relaxed">
                &ldquo;{auditItem.prompt}&rdquo;
              </p>
            </div>

            {/* Middle: KPI Evaluation Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Citation Status */}
              <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Citation Status
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                  {auditItem.isBrandCited ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Brand Cited
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Not Cited
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Sentiment */}
              <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Sentiment
                </span>
                <div className="mt-1">
                  <span
                    className={cn(
                      'inline-block px-2 py-0.5 rounded-md text-xs font-bold',
                      auditItem.sentiment === 'Positive' &&
                        'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300',
                      auditItem.sentiment === 'Neutral' &&
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300',
                      (auditItem.sentiment === 'Negative' || auditItem.sentiment === 'Omitted') &&
                        'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    )}
                  >
                    {auditItem.sentiment}
                  </span>
                </div>
              </div>

              {/* Mention Rank */}
              <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Placement Rank
                </span>
                <div className="mt-1 font-bold font-mono text-sm text-gray-900 dark:text-white">
                  {auditItem.mentionRank !== null ? `#${auditItem.mentionRank}` : 'Unranked'}
                </div>
              </div>

              {/* Visibility Score */}
              <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Visibility Score
                </span>
                <div className="mt-1 font-bold font-mono text-sm text-blue-600 dark:text-blue-400">
                  {auditItem.visibilityScore}%
                </div>
              </div>
            </div>

            {/* Bottom: Full LLM Response with Auto-Highlighting */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Full LLM Response Transcript</span>
                </h3>
                <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                  Target brand occurrences highlighted in yellow
                </span>
              </div>

              <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs text-xs sm:text-sm text-gray-800 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-100">
                <HighlightText
                  text={auditItem.rawResponse}
                  brandName={targetBrandName}
                  aliases={brandAliases}
                />
              </div>
            </div>

            {/* Outbound Citations List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cited Outbound Sources ({auditItem.citations.length})</span>
                </h3>
              </div>

              {auditItem.citations.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
                  {auditItem.citations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <DomainFavicon
                          domainOrUrl={cite.domain || cite.url}
                          size={24}
                          className="rounded-md shadow-2xs shrink-0"
                          fallbackInitial
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate">
                            {cite.title || cite.domain}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-mono truncate">
                            {cite.url}
                          </p>
                        </div>
                      </div>

                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors shrink-0 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center text-xs text-gray-400">
                  No outbound URL sources were directly extracted in this engine response.
                </div>
              )}
            </div>

            {/* Competitors Mentioned (if any) */}
            {auditItem.competitorsMentioned && auditItem.competitorsMentioned.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Competitors Mentioned in Response
                </h3>
                <div className="flex flex-wrap gap-2">
                  {auditItem.competitorsMentioned.map((comp, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      <span>{comp.name}</span>
                      <span className="text-[10px] opacity-70">Rank #{comp.rank}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Footer Metadata & Export Action Bar */}
          <div className="p-4 border-t border-gray-200/80 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-zinc-400">
                <span className="font-semibold text-gray-900 dark:text-zinc-200">
                  Run ID: {auditItem.runId || auditItem.id}
                </span>
                <span>•</span>
                <span>Trigger: {auditItem.executionType === 'scheduled_cron' ? 'Vercel Cron (Automated)' : 'Manual Dispatch'}</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Exact Timestamp: {auditItem.timestamp}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-8 text-xs gap-1.5 rounded-xl border-gray-200 dark:border-zinc-800"
              >
                {isJsonCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>JSON Copied</span>
                  </>
                ) : (
                  <>
                    <FileCode className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy JSON</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handleExportJson}
                className="h-8 text-xs gap-1.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-2xs font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
