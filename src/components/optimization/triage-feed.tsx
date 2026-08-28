'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  Flame,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizationAction, ActionStatus, ActionSeverity } from '@/types/optimization';
import { EngineType } from '@/types/responses';
import { EngineIcon } from '@/components/ui/engine-icon';

interface TriageFeedProps {
  actions: OptimizationAction[];
  selectedActionId: string | null;
  onSelectAction: (action: OptimizationAction) => void;
  activeStatusTab: ActionStatus;
  onStatusTabChange: (status: ActionStatus) => void;
  pendingCount: number;
  approvedCount: number;
  dismissedCount: number;
}

const ENGINE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  ChatGPT: {
    label: 'ChatGPT',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  Perplexity: {
    label: 'Perplexity',
    bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60',
    text: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  Gemini: {
    label: 'Gemini',
    bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  Claude: {
    label: 'Claude',
    bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  Copilot: {
    label: 'Copilot',
    bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
};

export function TriageFeed({
  actions,
  selectedActionId,
  onSelectAction,
  activeStatusTab,
  onStatusTabChange,
  pendingCount,
  approvedCount,
  dismissedCount,
}: TriageFeedProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('ALL');

  // Filter actions for current tab and search query
  const filteredActions = React.useMemo(() => {
    return actions.filter((act) => {
      // Tab status match
      const matchesTab = act.status === activeStatusTab;

      // Search match (prompt, engine, why reason, competitor)
      const matchesSearch =
        act.promptQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.engine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.whyExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.competitorInsight.competitorName.toLowerCase().includes(searchQuery.toLowerCase());

      // Severity match
      const matchesSeverity =
        severityFilter === 'ALL' || act.severity.toLowerCase() === severityFilter.toLowerCase();

      return matchesTab && matchesSearch && matchesSeverity;
    });
  }, [actions, activeStatusTab, searchQuery, severityFilter]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs overflow-hidden">
      
      {/* 1. Header with Status Tabs */}
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800/80 space-y-3 shrink-0 bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Triage Feed
            </h2>
          </div>

          <span className="text-[11px] font-semibold text-gray-500">
            {filteredActions.length} Actions
          </span>
        </div>

        {/* Status Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-200/60 dark:bg-zinc-800/60 rounded-xl">
          <button
            type="button"
            onClick={() => onStatusTabChange('pending')}
            className={cn(
              'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none',
              activeStatusTab === 'pending'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            )}
          >
            <span>Pending</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                activeStatusTab === 'pending'
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-300/60 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              )}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusTabChange('approved')}
            className={cn(
              'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none',
              activeStatusTab === 'approved'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            )}
          >
            <span>Executed</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                activeStatusTab === 'approved'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-gray-300/60 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              )}
            >
              {approvedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusTabChange('dismissed')}
            className={cn(
              'py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none',
              activeStatusTab === 'dismissed'
                ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900'
            )}
          >
            <span>Dismissed</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                activeStatusTab === 'dismissed'
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                  : 'bg-gray-300/60 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              )}
            >
              {dismissedCount}
            </span>
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action fixes..."
            className="w-full h-8.5 pl-8.5 pr-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* 2. Vertically Scrollable Action Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y-0">
        {filteredActions.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-gray-300 dark:text-zinc-700 mx-auto" />
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              No actions in {activeStatusTab}
            </p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
              New optimization fixes are generated whenever visibility gaps are detected in audit cycles.
            </p>
          </div>
        ) : (
          filteredActions.map((action) => {
            const isSelected = selectedActionId === action.id;
            const engMeta = ENGINE_CONFIG[action.engine] || {
              label: action.engine,
              bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200',
              text: 'text-blue-700 dark:text-blue-300',
              dot: 'bg-blue-500',
            };

            return (
              <div
                key={action.id}
                onClick={() => onSelectAction(action)}
                className={cn(
                  'p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-2.5 group',
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-2xs'
                )}
              >
                {/* Top Row: Engine Badge + Severity Badge + Relative Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Engine Badge */}
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        engMeta.bg,
                        engMeta.text
                      )}
                    >
                      <EngineIcon engine={action.engine} size={11} />
                      <span>{action.engine}</span>
                    </span>

                    {/* Severity Badge */}
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        action.severity === 'Critical' &&
                          'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
                        action.severity === 'High' &&
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
                        action.severity === 'Medium' &&
                          'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
                        action.severity === 'Low' &&
                          'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700'
                      )}
                    >
                      {action.severity} Priority
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{action.timeAgo}</span>
                  </span>
                </div>

                {/* Target Prompt Title */}
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    &ldquo;{action.promptQuery}&rdquo;
                  </h3>
                </div>

                {/* Diagnostic Excerpt */}
                <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {action.whyExplanation}
                </p>

                {/* Bottom Row: Fix Type Tag + Arrow */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-zinc-800/60 text-[10px]">
                  <span className="font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-600" />
                    <span>{action.fixType}</span>
                  </span>

                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
