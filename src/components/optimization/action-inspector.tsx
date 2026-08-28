'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Send,
  Trash2,
  ExternalLink,
  Code2,
  Eye,
  AlertTriangle,
  Flame,
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  FileEdit,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { OptimizationAction } from '@/types/optimization';
import { EngineIcon } from '@/components/ui/engine-icon';
import { DomainFavicon } from '@/components/ui/domain-favicon';

interface ActionInspectorProps {
  action: OptimizationAction | null;
  onUpdateDraftContent: (newContent: string) => void;
  onStatusChange: (actionId: string, status: 'approved' | 'dismissed') => void;
  onOpenPushModal: (action: OptimizationAction) => void;
}

export function ActionInspector({
  action,
  onUpdateDraftContent,
  onStatusChange,
  onOpenPushModal,
}: ActionInspectorProps) {
  const [viewMode, setViewMode] = React.useState<'preview' | 'raw'>('preview');
  const [isCopied, setIsCopied] = React.useState(false);

  if (!action) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs text-center space-y-3">
        <Sparkles className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          No Action Selected
        </h3>
        <p className="text-xs text-gray-500 max-w-sm">
          Select an action card from the Triage Feed on the left to inspect the diagnostic report and edit the AI-generated optimization fix.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(action.draftedContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs overflow-hidden">
      
      {/* 1. Header Toolbar with Diagnostic Overview */}
      <div className="p-5 border-b border-gray-100 dark:border-zinc-800/80 space-y-3 bg-gray-50/50 dark:bg-zinc-900/50 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border',
                action.severity === 'Critical' &&
                  'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
                action.severity === 'High' &&
                  'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
                action.severity === 'Medium' &&
                  'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
                action.severity === 'Low' &&
                  'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200'
              )}
            >
              {action.severity} Severity
            </span>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1.5">
              <EngineIcon engine={action.engine} size={12} />
              <span>{action.engine} Model Gap</span>
            </span>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              {action.fixType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md uppercase tracking-wider text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
              Status: {action.status}
            </span>
          </div>
        </div>

        {/* Prompt Title */}
        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
          &ldquo;{action.promptQuery}&rdquo;
        </h2>

        {/* Diagnostic 'Why' Box */}
        <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Diagnostic Root Cause
            </span>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              {action.whyExplanation}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Body: Competitor Edge + Target Source + Markdown Editor */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Module 1: Competitor Edge Module & Target Source Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Competitor Favored Card */}
          <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Favored Competitor Source
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <DomainFavicon
                  domainOrUrl={action.competitorInsight.competitorUrl}
                  size={18}
                  className="rounded shrink-0"
                  fallbackInitial
                />
                <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate">
                  {action.competitorInsight.competitorName}
                </span>
              </div>
              <a
                href={action.competitorInsight.competitorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline shrink-0"
              >
                <span>View Source</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">
              <span className="font-semibold text-gray-700 dark:text-zinc-300">Identified Gap: </span>
              {action.competitorInsight.semanticGap}
            </p>
          </div>

          {/* Target Source Card */}
          <div className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Target Source Page to Update
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <DomainFavicon
                  domainOrUrl={action.targetSourceUrl}
                  size={18}
                  className="rounded shrink-0"
                  fallbackInitial
                />
                <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 truncate font-mono">
                  {action.targetSourceUrl}
                </span>
              </div>
              <a
                href={action.targetSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Live Page</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-snug">
              Injecting this {action.fixType} directly onto this URL will establish entity parity for subsequent AI audit sweeps.
            </p>
          </div>
        </div>

        {/* Module 2: Markdown Editor Block */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Generated Optimization Fix
              </h3>
            </div>

            {/* Raw Markdown vs Preview Toggle */}
            <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-800 p-0.5 bg-gray-50 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer select-none',
                  viewMode === 'preview'
                    ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Eye className="w-3 h-3" />
                <span>Rich Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer select-none',
                  viewMode === 'raw'
                    ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Code2 className="w-3 h-3" />
                <span>Raw Markdown</span>
              </button>
            </div>
          </div>

          {/* Editor Canvas */}
          {viewMode === 'raw' ? (
            <textarea
              value={action.draftedContent}
              onChange={(e) => onUpdateDraftContent(e.target.value)}
              rows={14}
              placeholder="Enter markdown content..."
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-950 text-gray-100 font-mono text-sm leading-relaxed whitespace-pre-wrap focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-inner resize-y"
            />
          ) : (
            <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-2xs overflow-x-auto min-h-[260px]">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {action.draftedContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Action Bar Footer */}
      <div className="p-4 border-t border-gray-200/80 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Side: Dismiss */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onStatusChange(action.id, 'dismissed')}
          className="h-8.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl border-gray-200 dark:border-zinc-800 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          <span>Dismiss Action</span>
        </Button>

        {/* Right Side: Copy Markdown + Push to CMS + Approve Fix */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Markdown Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8.5 text-xs rounded-xl border-gray-200 dark:border-zinc-800 gap-1.5 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-500" />
                <span>Copy Markdown</span>
              </>
            )}
          </Button>

          {/* Push to CMS Button */}
          <Button
            size="sm"
            onClick={() => onOpenPushModal(action)}
            className="h-8.5 px-3.5 text-xs rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-2xs font-semibold gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Push to CMS</span>
          </Button>

          {/* Approve / Mark Executed Button */}
          {action.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(action.id, 'approved')}
              className="h-8.5 px-3.5 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Executed</span>
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
