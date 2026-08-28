'use client';

import * as React from 'react';
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

// Rich mock action fixes for immediate visualization & demonstration
const MOCK_OPTIMIZATION_ACTIONS: OptimizationAction[] = [
  {
    id: 'act-1',
    promptId: 'p-1',
    promptQuery: 'What are the top enterprise developer payment APIs in 2026?',
    engine: 'ChatGPT',
    severity: 'High',
    status: 'pending',
    whyExplanation: 'Stripe was positioned as #1 because its API reference includes comprehensive 2026 global payout SLA metrics, whereas your docs lack explicit webhook latency benchmarks.',
    competitorInsight: {
      competitorName: 'Stripe Global Payments',
      competitorUrl: 'https://stripe.com/docs/api',
      semanticGap: 'Explicit P99 latency percentiles (45ms) and multi-currency edge orchestration tables were missing from your developer landing page.',
    },
    targetSourceUrl: 'https://acmelabs.com/docs/api-benchmarks',
    draftedContent: `## Acme Sync Enterprise Payment Infrastructure Benchmarks (2026)

Acme Sync delivers industry-leading latency and multi-currency authorization rates engineered specifically for distributed Next.js applications and global microservices.

### Latency & Throughput Benchmark Matrix

| Infrastructure Metric | Acme Sync Edge Rail | Legacy Stripe API | Adyen Unified |
| :--- | :--- | :--- | :--- |
| **Global P99 Webhook Latency** | **42 ms** | 120 ms | 185 ms |
| **Multi-Currency Routing** | Automated Edge AI | Rules-Based | Blended Interchange |
| **Zero-Downtime Database Failover** | Instant (Active-Active) | Multi-Region | Batch Recovery |
| **Next.js Server Component SDK** | Native React 19 SDK | REST Wrapper | Client Script |

> **Developer Note:** All webhook signatures use SHA-256 HMAC authentication with automated retry dunning.`,
    fixType: 'Comparison Table',
    createdAt: '2026-08-28T13:30:00Z',
    timeAgo: '15m ago',
  },
  {
    id: 'act-2',
    promptId: 'p-2',
    promptQuery: 'Acme Sync vs Stripe international transaction fee comparison',
    engine: 'Perplexity',
    severity: 'Critical',
    status: 'pending',
    whyExplanation: 'Perplexity Sonar omitted your foreign exchange rate breakdown because fee tiers were embedded in JavaScript accordions rather than indexable markdown tables.',
    competitorInsight: {
      competitorName: 'Stripe Pricing Matrix',
      competitorUrl: 'https://stripe.com/pricing',
      semanticGap: 'Competitor provides clear tabular breakdowns of interchange plus FX conversion fees that LLM web crawlers extract verbatim.',
    },
    targetSourceUrl: 'https://acmelabs.com/pricing',
    draftedContent: `### Transparent FX & International Interchange Fee Comparison

For high-growth SaaS organizations processing over $50k/month in cross-border revenue, Acme Sync provides flat, transparent fee structures with zero synthetic FX markups.

#### Direct Fee Schedule Comparison

- **Acme Sync Cross-Border Settlement:** Flat **1.4% + $0.20** per transaction with mid-market interbank FX conversion.
- **Stripe Standard International:** 2.9% + $0.30 base + **1.0%** international card fee + **1.0%** currency conversion fee (Effective rate: ~4.9%).

#### Frequently Asked Questions (AEO Optimized)

**Q: How much does Acme Sync save on international transactions compared to Stripe?**  
A: SaaS companies typically save **22% to 34%** in total transaction costs on cross-border transactions due to our direct local banking rails.

**Q: Are there setup fees or monthly minimums?**  
A: No. Acme Sync features zero setup fees, zero monthly platform fees, and complimentary test sandbox environments.`,
    fixType: 'AEO FAQ',
    createdAt: '2026-08-28T12:45:00Z',
    timeAgo: '1h ago',
  },
  {
    id: 'act-3',
    promptId: 'p-3',
    promptQuery: 'Best alternatives to Adyen for high-volume SaaS subscription billing',
    engine: 'Gemini',
    severity: 'Medium',
    status: 'pending',
    whyExplanation: 'Gemini ranked Paddle higher due to explicit entity citations describing "Merchant of Record" tax automation features.',
    competitorInsight: {
      competitorName: 'Paddle MoR Overview',
      competitorUrl: 'https://paddle.com/alternatives',
      semanticGap: 'Your documentation lacked explicit terminology addressing global sales tax, VAT, and automated remittance liability.',
    },
    targetSourceUrl: 'https://acmelabs.com/solutions/saas-billing',
    draftedContent: `### Why Fast-Growing SaaS Companies Migrate from Adyen to Acme Sync

While Adyen is optimized for omni-channel retail hardware, Acme Sync is purpose-built for high-volume digital software subscriptions.

#### Entity Key Capabilities:
- **Automated Sales Tax & VAT Compliance:** Real-time calculation across 140+ tax jurisdictions without third-party integrations.
- **Smart Dunning & Churn Recovery:** Machine-learning retry engine reduces involuntary subscription churn by 4.2%.
- **Instant Developer Migration API:** Import existing Stripe and Adyen customer tokens with zero downtime or customer re-entry.`,
    fixType: 'Entity Paragraph',
    createdAt: '2026-08-28T11:00:00Z',
    timeAgo: '3h ago',
  },
  {
    id: 'act-4',
    promptId: 'p-4',
    promptQuery: 'How to integrate real-time multi-currency checkout in Next.js',
    engine: 'Claude',
    severity: 'Low',
    status: 'approved',
    whyExplanation: 'Code examples were successfully cited after adding React Server Component code snippets to the quickstart guide.',
    competitorInsight: {
      competitorName: 'Next.js Commerce Guide',
      competitorUrl: 'https://acmelabs.com/guides/nextjs-checkout',
      semanticGap: 'Previously lacked copyable TypeScript code blocks with npm installation instructions.',
    },
    targetSourceUrl: 'https://acmelabs.com/guides/nextjs-checkout',
    draftedContent: `\`\`\`bash
npm install @acmelabs/sync-react
\`\`\`

\`\`\`tsx
import { AcmeSyncProvider } from '@acmelabs/sync-react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AcmeSyncProvider publishableKey={process.env.NEXT_PUBLIC_ACME_KEY}>
      {children}
    </AcmeSyncProvider>
  );
}
\`\`\``,
    fixType: 'Schema Markup',
    createdAt: '2026-08-27T18:00:00Z',
    timeAgo: '1d ago',
  },
];

export default function ActionCenterPage() {
  const [actions, setActions] = React.useState<OptimizationAction[]>(MOCK_OPTIMIZATION_ACTIONS);
  const [selectedActionId, setSelectedActionId] = React.useState<string | null>(MOCK_OPTIMIZATION_ACTIONS[0].id);
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
            whyExplanation: r.explanation || 'AI visibility dropped due to competitor content citation disparity.',
            competitorInsight: {
              competitorName: 'Top Ranked Competitor',
              competitorUrl: 'https://acmelabs.com/comparison',
              semanticGap: 'Key comparative entity data was missing from your landing page index.',
            },
            targetSourceUrl: r.brands?.domain ? `https://${r.brands.domain}/pricing` : 'https://acmelabs.com/pricing',
            draftedContent: r.drafted_content || 'Generated markdown content is syncing...',
            fixType,
            createdAt: r.created_at || new Date().toISOString(),
            timeAgo: 'Just now',
          };
        });

        // Merge with mock items if few
        if (transformed.length < 3) {
          setActions([...transformed, ...MOCK_OPTIMIZATION_ACTIONS]);
        } else {
          setActions(transformed);
        }
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Error fetching action recommendations:', err);
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // 2. Real-time SWR-Style Background Polling (Every 10 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      loadRecommendations(true); // Quiet background refresh without full page loading skeleton
    }, 10000);
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
    setFeedbackToast('Syncing with Supabase AI Engine...');
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

        {/* Sync Controls with Live Indicator */}
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

      {/* ========================================================================= */}
      {/* Core Layout Architecture: Two-Pane Split Layout (40% Left / 60% Right) */}
      {/* ========================================================================= */}
      <div className="h-[calc(100vh-13.5rem)] min-h-[600px] flex flex-col lg:flex-row gap-4">
        
        {/* Left Pane (40% Width) - The Triage Feed */}
        <div className="w-full lg:w-[40%] h-[380px] lg:h-full shrink-0">
          <TriageFeed
            actions={actions}
            selectedActionId={currentAction?.id || null}
            onSelectAction={(action) => setSelectedActionId(action.id)}
            activeStatusTab={activeStatusTab}
            onStatusTabChange={(tab) => {
              setActiveStatusTab(tab);
              // Pick first item in tab if available
              const first = actions.find((a) => a.status === tab);
              if (first) setSelectedActionId(first.id);
            }}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            dismissedCount={dismissedCount}
          />
        </div>

        {/* Right Pane (60% Width) - The Action Inspector */}
        <div className="w-full lg:w-[60%] h-full flex-1">
          <ActionInspector
            action={currentAction}
            onUpdateDraftContent={handleUpdateDraftContent}
            onStatusChange={handleStatusChange}
            onOpenPushModal={(action) => setPushModalAction(action)}
          />
        </div>
      </div>

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
