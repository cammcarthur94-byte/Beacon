'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import {
  getActionRecommendations,
  updateRecommendationStatus,
  seedSampleRecommendations,
  ActionCenterState,
} from '@/lib/actions/recommendations';
import { ActionRecommendation, ActionRecommendationIssueType, ActionRecommendationStatus, AIEngine } from '@/types/geo';
import { EngineBadge } from '@/components/engine-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  Zap,
  TrendingUp,
  RotateCw,
  AlertTriangle,
  Layers,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionCenterPage() {
  const [data, setData] = React.useState<ActionCenterState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<ActionRecommendationStatus>('pending');
  const [selectedIssueType, setSelectedIssueType] = React.useState<string>('all');
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [actionInProgressId, setActionInProgressId] = React.useState<string | null>(null);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const fetchData = React.useCallback(async (status: ActionRecommendationStatus = activeTab) => {
    try {
      setIsLoading(true);
      const res = await getActionRecommendations(status);
      setData(res);
      // Automatically expand the first card for immediate visibility
      if (res.recommendations.length > 0 && Object.keys(expandedCards).length === 0) {
        setExpandedCards({ [res.recommendations[0].id]: true });
      }
    } catch (err) {
      console.error('Failed to load action recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  React.useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'dismissed') => {
    setActionInProgressId(id);

    // Optimistic UI update
    if (data) {
      const updatedRecs = data.recommendations.filter((r) => r.id !== id);
      setData({
        ...data,
        recommendations: updatedRecs,
        pendingCount:
          activeTab === 'pending' ? Math.max(0, data.pendingCount - 1) : data.pendingCount,
        approvedCount: newStatus === 'approved' ? data.approvedCount + 1 : data.approvedCount,
        dismissedCount: newStatus === 'dismissed' ? data.dismissedCount + 1 : data.dismissedCount,
      });
    }

    try {
      await updateRecommendationStatus(id, newStatus);
    } catch (err) {
      console.error('Error updating recommendation status:', err);
      // Refetch if error occurs
      await fetchData(activeTab);
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSeedSamples = async () => {
    setIsSeeding(true);
    try {
      await seedSampleRecommendations();
      await fetchData('pending');
    } catch (err) {
      console.error('Failed to seed recommendations:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredRecommendations = (data?.recommendations || []).filter((rec) => {
    if (selectedIssueType === 'all') return true;
    return rec.issue_type === selectedIssueType;
  });

  const getIssueTypeBadge = (type: ActionRecommendationIssueType) => {
    switch (type) {
      case 'Content Gap':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Zap className="w-3 h-3 text-amber-400" />
            Content Gap
          </span>
        );
      case 'Competitor Edge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Flame className="w-3 h-3 text-indigo-400" />
            Competitor Edge
          </span>
        );
      case 'Sentiment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            Sentiment Fix
          </span>
        );
    }
  };

  const mapEngineNameToKey = (name: string): AIEngine => {
    const lower = name.toLowerCase();
    if (lower.includes('perplexity')) return 'perplexity';
    if (lower.includes('claude')) return 'claude';
    if (lower.includes('chatgpt') || lower.includes('gpt')) return 'chatgpt';
    if (lower.includes('gemini')) return 'gemini';
    if (lower.includes('copilot') || lower.includes('bing')) return 'copilot';
    if (lower.includes('overview') || lower.includes('aio') || lower.includes('google')) return 'google_aio';
    return 'chatgpt';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card to-indigo-950/30 p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <Sparkles className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Action Engine & Optimization Playbook
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Active GEO Agent
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When your brand drops below 50% visibility on target prompts, the Action Engine dissects competitor citations and drafts high-authority markdown fixes to publish directly on your domain.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchData(activeTab)}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              <span>Refresh Feed</span>
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handleSeedSamples}
              disabled={isSeeding}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSeeding ? 'Generating...' : 'Seed Sample Fixes'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/70 border-border/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Action Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {data?.pendingCount ?? 0}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">Ready for review</span>
          </div>
        </Card>

        <Card className="bg-card/70 border-border/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Actions Executed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {data?.approvedCount ?? 0}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Content fixes published</span>
          </div>
        </Card>

        <Card className="bg-card/70 border-border/80 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Dismissed Recommendations</span>
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground tracking-tight">
              {data?.dismissedCount ?? 0}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">Archived suggestions</span>
          </div>
        </Card>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card/60 border border-border/80 w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2',
              activeTab === 'pending'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            )}
          >
            <span>Pending Feed</span>
            {data?.pendingCount ? (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  activeTab === 'pending' ? 'bg-primary-foreground/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {data.pendingCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2',
              activeTab === 'approved'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            )}
          >
            <span>Approved / Done</span>
            {data?.approvedCount ? (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                  activeTab === 'approved' ? 'bg-primary-foreground/20 text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {data.approvedCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('dismissed')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2',
              activeTab === 'dismissed'
                ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
            )}
          >
            <span>Dismissed</span>
          </button>
        </div>

        {/* Issue Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <SlidersHorizontal className="w-3 h-3" />
            Filter:
          </span>
          {['all', 'Content Gap', 'Competitor Edge', 'Sentiment'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedIssueType(type)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap',
                selectedIssueType === type
                  ? 'bg-primary/20 text-primary border border-primary/30 font-semibold'
                  : 'bg-card/40 text-muted-foreground hover:text-foreground border border-border/60'
              )}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RotateCw className="w-6 h-6 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground">Analyzing engine responses and ranking gaps...</span>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border/90 bg-card/30 p-12 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            {activeTab === 'pending' ? <CheckCircle2 className="w-7 h-7" /> : <Layers className="w-7 h-7" />}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {activeTab === 'pending'
                ? 'No Pending Actions Found!'
                : `No ${activeTab} recommendations found`}
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              {activeTab === 'pending'
                ? 'Your brand is either dominating all tracked queries with >=50 visibility, or audits have not yet triggered recommendations.'
                : `There are currently no recommendations with status "${activeTab}".`}
            </p>
          </div>
          {activeTab === 'pending' && (
            <div className="pt-2">
              <Button
                variant="glow"
                size="sm"
                onClick={handleSeedSamples}
                disabled={isSeeding}
                className="gap-2 text-xs font-semibold"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSeeding ? 'Generating Fixes...' : 'Generate Demo Recommendations'}</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Action Cards Feed */
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => {
            const isExpanded = Boolean(expandedCards[rec.id]);
            const isCopied = copiedId === rec.id;
            const isBusy = actionInProgressId === rec.id;
            const engineKey = mapEngineNameToKey(rec.engine_name);
            const promptQuery = rec.prompts?.query || 'Target Commercial Query';

            return (
              <Card
                key={rec.id}
                className={cn(
                  'border border-border/80 bg-card/80 backdrop-blur-sm transition-all duration-200 overflow-hidden shadow-sm hover:border-border',
                  isBusy && 'opacity-60 pointer-events-none'
                )}
              >
                {/* Card Top Header */}
                <div className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {/* Target Query & Engine Context */}
                    <div className="flex flex-wrap items-center gap-2">
                      <EngineBadge engine={engineKey} size="sm" />
                      <span className="text-xs text-muted-foreground">for query</span>
                      <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded bg-muted/60 border border-border/80">
                        &quot;{promptQuery}&quot;
                      </span>
                    </div>

                    {/* Issue Type & Timestamp */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {getIssueTypeBadge(rec.issue_type)}
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {new Date(rec.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Title & Explanation */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-snug">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Collapsible Content Trigger Bar */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => toggleExpand(rec.id)}
                      className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors group"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Drafted Fix' : 'View Ready-to-Publish Markdown Snippet'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 transition-transform" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(rec.id, rec.drafted_content)}
                        className="h-7 px-2.5 text-xs gap-1.5 bg-background border border-border"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-muted-foreground" />
                            <span>Copy Snippet</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Collapsible Markdown Content Preview */}
                {isExpanded && (
                  <div className="border-t border-border/80 bg-background/50 p-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                      <span>READY-TO-PUBLISH MARKDOWN FIX</span>
                      <span>Paste into your docs, CMS, or blog</span>
                    </div>

                    <div className="p-4 rounded-xl bg-card border border-border text-foreground font-sans text-xs prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-table:my-3 prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-table:border prose-th:border prose-td:border prose-th:border-border prose-td:border-border/60 prose-th:bg-muted/40 prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-background prose-pre:p-3 prose-pre:rounded-lg overflow-x-auto">
                      <ReactMarkdown>{rec.drafted_content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Card Action Controls Footer */}
                {activeTab === 'pending' && (
                  <div className="border-t border-border/80 bg-muted/20 px-5 py-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                      Applying this change will optimize future audit visibility on {rec.engine_name}.
                    </span>

                    <div className="flex items-center gap-2.5 ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleStatusUpdate(rec.id, 'dismissed')}
                        className="h-8 text-xs text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Dismiss</span>
                      </Button>

                      <Button
                        variant="glow"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleStatusUpdate(rec.id, 'approved')}
                        className="h-8 text-xs font-semibold gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Mark as Done</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
