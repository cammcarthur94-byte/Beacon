'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  RotateCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Send,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getActionRecommendations,
  updateRecommendationStatus,
  ActionCenterState,
} from '@/lib/actions/recommendations';
import { getUserBrands } from '@/lib/actions/brands';
import {
  OptimizationAction,
  ActionStatus,
  ActionSeverity,
  ActionFixType,
} from '@/types/optimization';
import { EngineType } from '@/types/responses';
import { TriageFeed } from '@/components/optimization/triage-feed';
import { ActionInspector } from '@/components/optimization/action-inspector';
import { PushToCmsModal } from '@/components/optimization/push-to-cms-modal';

export default function ActionCenterPage() {
  const [actions, setActions] = React.useState<OptimizationAction[]>([]);
  const [selectedActionId, setSelectedActionId] = React.useState<string | null>(null);
  const [activeStatusTab, setActiveStatusTab] = React.useState<ActionStatus>('pending');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [feedbackToast, setFeedbackToast] = React.useState<string | null>(null);
  const [pushModalAction, setPushModalAction] = React.useState<OptimizationAction | null>(null);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date>(new Date());

  // 1. Fetch live recommendations from Supabase
  const loadRecommendations = React.useCallback(async (quiet: boolean = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const state = await getActionRecommendations('pending');
      const approvedState = await getActionRecommendations('approved');
      const dismissedState = await getActionRecommendations('dismissed');

      const allSupabaseRecs = [
        ...state.recommendations,
        ...approvedState.recommendations,
        ...dismissedState.recommendations,
      ];

      if (allSupabaseRecs.length > 0) {
        const transformed: OptimizationAction[] = allSupabaseRecs.map((r) => {
          const rawEng = (r.engine_name || 'chatgpt').toLowerCase();
          let eng: EngineType = 'ChatGPT';
          if (rawEng.includes('perplexity') || rawEng.includes('sonar')) eng = 'Perplexity';
          else if (rawEng.includes('gemini')) eng = 'Gemini';
          else if (rawEng.includes('claude')) eng = 'Claude';
          else if (rawEng.includes('copilot') || rawEng.includes('bing')) eng = 'Copilot';
          else if (rawEng.includes('google') || rawEng.includes('aio')) eng = 'Google AIO';

          const issueType = r.issue_type;
          let fixType: ActionFixType = 'Comparison Table';
          if (issueType === 'Content Gap') fixType = 'AEO FAQ';
          else if (issueType === 'Competitor Edge') fixType = 'Comparison Table';
          else if (issueType === 'Sentiment') fixType = 'Entity Paragraph';

          return {
            id: r.id,
            promptId: r.prompt_id || `p-${r.id.substring(0, 4)}`,
            promptQuery: r.prompts?.query || r.title || 'Optimization Target Query',
            engine: eng,
            severity: 'High',
            status: r.status as ActionStatus,
            whyExplanation: r.explanation || 'AI visibility dropped due to competitor citation disparity.',
            competitorInsight: {
              competitorName: 'Top Competitor Reference',
              competitorUrl: r.brands?.domain ? `https://${r.brands.domain}` : '',
              semanticGap: 'Entity data and benchmarks were missing from your active indexed pages.',
            },
            targetSourceUrl: r.brands?.domain ? `https://${r.brands.domain}` : '',
            draftedContent: r.drafted_content || 'Generated optimization fix is available.',
            fixType,
            createdAt: r.created_at || new Date().toISOString(),
            timeAgo: 'Recently',
          };
        });

        setActions(transformed);
        if (!selectedActionId && transformed.length > 0) {
          setSelectedActionId(transformed[0].id);
        }
      } else {
        setActions([]);
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Error fetching action recommendations:', err);
      setActions([]);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [selectedActionId]);

  React.useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // 2. Real-time SWR-Style Background Polling (Every 15 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      loadRecommendations(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadRecommendations]);

  // Selected Action Model
  const currentAction = React.useMemo(() => {
    return actions.find((a) => a.id === selectedActionId) || actions[0] || null;
  }, [actions, selectedActionId]);

  // Counts
  const pendingCount = actions.filter((a) => a.status === 'pending').length;
  const approvedCount = actions.filter((a) => a.status === 'approved').length;
  const dismissedCount = actions.filter((a) => a.status === 'dismissed').length;

  // Handlers
  const handleUpdateDraftContent = (newContent: string) => {
    if (!selectedActionId) return;
    setActions((prev) =>
      prev.map((a) => (a.id === selectedActionId ? { ...a, draftedContent: newContent } : a))
    );
  };

  const handleStatusChange = async (actionId: string, newStatus: 'approved' | 'dismissed') => {
    // Optimistic UI Update
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
    );

    const toastMsg = newStatus === 'approved' ? 'Action marked as executed!' : 'Action dismissed.';
    setFeedbackToast(toastMsg);
    setTimeout(() => setFeedbackToast(null), 3500);

    try {
      await updateRecommendationStatus(actionId, newStatus);
    } catch (err) {
      console.error('Error updating recommendation status in Supabase:', err);
    }
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setFeedbackToast('Syncing with database...');
    loadRecommendations(false);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleCmsPushSuccess = (destinationName: string) => {
    if (selectedActionId) {
      handleStatusChange(selectedActionId, 'approved');
    }
    setFeedbackToast(`Successfully deployed fix to ${destinationName}!`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Action Engine & Optimization Playbook
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60">
              Triage Inbox
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Review, edit, and deploy generative engine content fixes to reclaim missing brand citations
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-600 dark:text-zinc-400 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Auto-Sync Active</span>
          </div>

          <Button
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <RotateCw className={cn('w-3.5 h-3.5 text-gray-500', isSyncing && 'animate-spin')} />
            <span>Sync Fixes</span>
          </Button>
        </div>
      </div>

      {/* Live Feedback Toast Banner */}
      {feedbackToast && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <RotateCw className="w-7 h-7 text-blue-600 animate-spin" />
          <span className="text-xs font-medium text-gray-500">
            Loading optimization actions from database...
          </span>
        </div>
      ) : actions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
          <Zap className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            No Optimization Fixes Pending
          </h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
            When audit runs identify content gaps or competitor ranking advantages, AI-drafted optimization fixes will appear here for triage and deployment.
          </p>
          <div className="pt-2">
            <Link href="/prompts">
              <Button size="sm" className="rounded-xl text-xs gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Run Audits to Generate Fixes
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-13.5rem)] min-h-[600px] flex flex-col lg:flex-row gap-4">
          {/* Left Pane - Triage Feed */}
          <div className="w-full lg:w-[40%] h-[380px] lg:h-full shrink-0">
            <TriageFeed
              actions={actions}
              selectedActionId={currentAction?.id || null}
              onSelectAction={(action) => setSelectedActionId(action.id)}
              activeStatusTab={activeStatusTab}
              onStatusTabChange={(tab) => {
                setActiveStatusTab(tab);
                const first = actions.find((a) => a.status === tab);
                if (first) setSelectedActionId(first.id);
              }}
              pendingCount={pendingCount}
              approvedCount={approvedCount}
              dismissedCount={dismissedCount}
            />
          </div>

          {/* Right Pane - Action Inspector */}
          <div className="w-full lg:w-[60%] h-full flex-1">
            <ActionInspector
              action={currentAction}
              onUpdateDraftContent={handleUpdateDraftContent}
              onStatusChange={handleStatusChange}
              onOpenPushModal={(action) => setPushModalAction(action)}
            />
          </div>
        </div>
      )}

      {/* Push to CMS Interactive Modal */}
      <PushToCmsModal
        isOpen={Boolean(pushModalAction)}
        onClose={() => setPushModalAction(null)}
        actionItem={pushModalAction}
        onSuccess={handleCmsPushSuccess}
      />
    </div>
  );
}
