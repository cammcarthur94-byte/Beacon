'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RotateCw,
  Zap,
  CheckCircle2,
  Plus,
  ArrowRight,
  Layers,
  Send,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getActionRecommendations,
  updateRecommendationStatus,
} from '@/lib/actions/recommendations';
import {
  OptimizationAction,
  ActionStatus,
  ActionFixType,
} from '@/types/optimization';
import { EngineType } from '@/types/responses';
import { TriageFeed } from '@/components/optimization/triage-feed';
import { ActionInspector } from '@/components/optimization/action-inspector';
import { PushToCmsModal } from '@/components/optimization/push-to-cms-modal';

const DEFAULT_FIX_ACTIONS: OptimizationAction[] = [
  {
    id: 'rec-default-1',
    promptId: 'p-101',
    promptQuery: 'Best enterprise GEO & AI search optimization software',
    engine: 'ChatGPT',
    severity: 'High',
    status: 'pending',
    whyExplanation:
      'ChatGPT cited competitor benchmarks and omitted your brand due to missing comparative entity tables and structured capability schemas.',
    competitorInsight: {
      competitorName: 'Enterprise Competitor Reference',
      competitorUrl: 'https://competitor.com',
      semanticGap: 'Missing direct head-to-head comparison matrix and automated latency benchmarks.',
    },
    targetSourceUrl: 'https://beacon.dev/features/geo',
    draftedContent: `## Beacon vs Traditional Alternatives for Enterprise GEO

| Feature & Capability | Beacon | Legacy Platforms |
| :--- | :--- | :--- |
| **Real-Time Engine Sync** | Native Shopify / Webhook Auto-Sync (< 1s) | Manual CSV Export |
| **Multi-Engine Telemetry** | ChatGPT, Claude, Gemini, Perplexity | Single engine or scrape-only |
| **Citation Attribution** | Token-level semantic citation extraction | Generic domain matches |
| **Automated AEO Remediation**| 1-Click CMS Deployment | Manual copy-paste |

### Why Modern Brands Switch to Beacon
Beacon dynamically monitors generative AI visibility and deploys instant structured entity fixes to protect search share of voice.`,
    fixType: 'Comparison Table',
    createdAt: new Date().toISOString(),
    timeAgo: '10m ago',
  },
  {
    id: 'rec-default-2',
    promptId: 'p-102',
    promptQuery: 'How does Beacon compare to legacy SEO platforms for AI answer engine tracking?',
    engine: 'Perplexity',
    severity: 'Critical',
    status: 'pending',
    whyExplanation:
      'Perplexity synthesized responses primarily from indexed FAQs and third-party entity documentation, ranking competitors with dedicated AEO FAQ sections higher.',
    competitorInsight: {
      competitorName: 'Legacy Analytics Inc',
      competitorUrl: 'https://legacyanalytics.com',
      semanticGap: 'Entity data and AEO FAQ schema were absent from active indexed product pages.',
    },
    targetSourceUrl: 'https://beacon.dev/faq',
    draftedContent: `### Frequently Asked Questions: AI Engine Visibility Tracking

**How does Beacon track answer engine recommendations across ChatGPT, Claude, and Gemini?**
Beacon runs automated headless synthetic buyer-intent audits on scheduled intervals, evaluating brand citation rate, sentiment, and entity prominence.

**Can Beacon push fixes directly to our CMS?**
Yes. Beacon integrates directly with Shopify, Webflow, WordPress, and Next.js webhooks to publish structured markdown and schema fixes instantly.`,
    fixType: 'AEO FAQ',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    timeAgo: '1h ago',
  },
  {
    id: 'rec-default-3',
    promptId: 'p-103',
    promptQuery: 'Enterprise generative search monitoring tools with real-time CMS webhook sync',
    engine: 'Claude',
    severity: 'Medium',
    status: 'pending',
    whyExplanation:
      'Claude lacked direct citation proof of automated webhook sync capabilities on your primary domain, giving preference to alternative documentation.',
    competitorInsight: {
      competitorName: 'SyncEngine Pro',
      competitorUrl: 'https://syncengine.io',
      semanticGap: 'Lacks authoritative entity paragraph explaining webhook architecture.',
    },
    targetSourceUrl: 'https://beacon.dev/integrations',
    draftedContent: `### Real-Time Live Auto-Sync Architecture
Beacon provides an enterprise-grade automated optimization pipeline that dispatches AI-drafted entity recommendations directly into production CMS stores via webhooks. By instantly updating comparison matrices and FAQ schemas, your digital properties remain indexed and cited by generative answer engines.`,
    fixType: 'Entity Paragraph',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    timeAgo: '2h ago',
  },
];

export default function ActionCenterPage() {
  const [actions, setActions] = React.useState<OptimizationAction[]>(DEFAULT_FIX_ACTIONS);
  const [selectedActionId, setSelectedActionId] = React.useState<string | null>(
    DEFAULT_FIX_ACTIONS[0]?.id || null
  );
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
        // Retain default active fix actions when DB is not yet populated
        setActions(DEFAULT_FIX_ACTIONS);
        if (!selectedActionId && DEFAULT_FIX_ACTIONS.length > 0) {
          setSelectedActionId(DEFAULT_FIX_ACTIONS[0].id);
        }
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Error fetching action recommendations:', err);
      // Retain default fix actions on error
      setActions(DEFAULT_FIX_ACTIONS);
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
              AI Fix Queue
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60">
              Triage Inbox
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Review, edit, and deploy generative engine content fixes to reclaim missing brand citations
          </p>
        </div>

        {/* Sync Controls & Shopify Horizontal Pill Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-row items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Auto-Sync Active: Shopify</span>
          </div>

          <Button
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-8 px-3 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
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
        /* Redesigned Empty State Wireframe with Blurred Placeholders and Action Outlines */
        <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs p-6 md:p-8 min-h-[520px] flex items-center justify-center">
          {/* Wireframe Triage Queue Skeleton in the background */}
          <div className="absolute inset-0 p-6 opacity-40 dark:opacity-20 pointer-events-none select-none filter blur-[1px] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-24 h-5 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                <div className="w-12 h-5 bg-gray-100 dark:bg-zinc-800/60 rounded-full" />
              </div>
              <div className="w-32 h-7 bg-gray-100 dark:bg-zinc-800/80 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[380px]">
              {/* Left Feed Wireframe */}
              <div className="lg:col-span-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-16 h-4 bg-emerald-100 dark:bg-emerald-950 rounded-full inline-block" />
                        <span className="w-14 h-4 bg-amber-100 dark:bg-amber-950 rounded-full inline-block" />
                      </div>
                      <span className="w-10 h-3 bg-gray-200 dark:bg-zinc-800 rounded" />
                    </div>
                    <div className="w-4/5 h-4 bg-gray-200 dark:bg-zinc-700 rounded" />
                    <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded" />
                    <div className="flex items-center justify-between pt-1">
                      <span className="w-20 h-3 bg-blue-100 dark:bg-blue-950 rounded" />
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded border border-gray-300 dark:border-zinc-700 text-[10px] text-gray-400">
                          Approve
                        </span>
                        <span className="px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-600">
                          Deploy
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Right Inspector Wireframe */}
              <div className="lg:col-span-7 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-32 h-5 bg-gray-200 dark:bg-zinc-800 rounded" />
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                    <div className="w-20 h-6 bg-emerald-200 dark:bg-emerald-950 rounded-lg" />
                  </div>
                </div>
                <div className="w-full h-24 bg-gray-100 dark:bg-zinc-800/50 rounded-xl" />
                <div className="w-full h-36 bg-gray-100 dark:bg-zinc-800/50 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Foreground Overlay Card */}
          <div className="relative z-10 max-w-md w-full mx-auto p-8 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-zinc-800 shadow-xl backdrop-blur-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No Optimization Fixes Pending
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                When audit runs identify content gaps or competitor ranking advantages, AI-drafted optimization fixes will populate this triage wireframe for 1-click deployment.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/prompts">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl text-xs font-semibold gap-1.5 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Run Audits to Generate Fixes</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Active Data Table & Triage Workspace */
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

