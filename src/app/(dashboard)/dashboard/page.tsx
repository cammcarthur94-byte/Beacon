'use client';

import * as React from 'react';
import Link from 'next/link';
import { getDashboardMetrics, DashboardMetrics } from '@/lib/actions/dashboard';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { VisibilityTrendChart } from '@/components/dashboard/visibility-trend-chart';
import { EngineBreakdownChart } from '@/components/dashboard/engine-breakdown-chart';
import { TopCitationsTable } from '@/components/dashboard/top-citations-table';
import { EngineBadge } from '@/components/engine-badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  PieChart,
  Link2,
  Trophy,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Play,
  RotateCw,
  PlusCircle,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRunningAudit, setIsRunningAudit] = React.useState(false);

  const fetchMetrics = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics();

    // Listen for manual audit completions from Header trigger
    const handleAuditCompleted = () => {
      fetchMetrics();
    };

    window.addEventListener('beacon:auditCompleted', handleAuditCompleted);
    return () => {
      window.removeEventListener('beacon:auditCompleted', handleAuditCompleted);
    };
  }, [fetchMetrics]);

  const handleRunFirstAudit = async () => {
    setIsRunningAudit(true);
    try {
      const response = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        await fetchMetrics();
      }
    } catch (err) {
      console.error('Error running test audit:', err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  if (isLoading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <RotateCw className="w-7 h-7 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground">Hydrating dashboard metrics from Supabase...</span>
      </div>
    );
  }

  // Tier 1 Empty State: No Brand Profile Configured
  if (!metrics?.hasBrand) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-blue-950/30 via-card to-indigo-950/20 p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary shadow-inner">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Beacon GEO</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track and optimize your brand’s visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot.
              To get started, configure your primary brand identity and search queries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="glow" size="sm" className="gap-2 text-xs font-semibold">
              <Link href="/dashboard/brand-kit">
                <PlusCircle className="w-4 h-4" />
                <span>Configure Your Brand Kit</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="pb-2">
              <Eye className="w-5 h-5 text-blue-400 mb-1" />
              <CardTitle className="text-sm font-semibold">AI Share of Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Benchmark your brand’s ranking against top competitors across real LLM responses.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="pb-2">
              <Link2 className="w-5 h-5 text-teal-400 mb-1" />
              <CardTitle className="text-sm font-semibold">Live Citation Index</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Discover which URLs, docs, and third-party review sites AI engines cite when answering commercial queries.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-muted/20">
            <CardHeader className="pb-2">
              <Layers className="w-5 h-5 text-amber-400 mb-1" />
              <CardTitle className="text-sm font-semibold">Multi-Engine Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Analyze detailed engine-by-engine performance across ChatGPT, Claude, Perplexity, and Gemini.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tier 2 Empty State: Brand exists but no runs yet
  if (metrics.hasBrand && !metrics.hasRuns) {
    return (
      <div className="space-y-6">
        {/* Brand Banner */}
        <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card/80 to-indigo-950/30 p-6 relative overflow-hidden shadow-sm backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">Onboarding</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Tracking: <strong className="text-foreground">{metrics.brand?.name}</strong> ({metrics.brand?.domain})
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Brand Configured — Ready for First Audit
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl mt-1 leading-relaxed">
                You have {metrics.promptCount} search queries configured. Run your first multi-engine audit to start collecting AI visibility metrics and citation indices.
              </p>
            </div>

            <Button
              onClick={handleRunFirstAudit}
              disabled={isRunningAudit}
              variant="glow"
              className="gap-2 text-xs font-semibold shrink-0"
            >
              {isRunningAudit ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing AI Engines...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run First Test Audit</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Placeholder KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-75">
          <KpiCard
            title="Overall Visibility Score"
            value="Pending"
            change="0%"
            isPositive={true}
            period="Awaiting first audit"
            icon={Eye}
            iconColor="text-blue-400"
            accentGlow="from-blue-500/20 to-indigo-500/0"
            subtext="Baseline benchmark"
          />

          <KpiCard
            title="Share of Voice (SOV)"
            value="Pending"
            change="0%"
            isPositive={true}
            period="vs Competitors"
            icon={PieChart}
            iconColor="text-indigo-400"
            accentGlow="from-indigo-500/20 to-purple-500/0"
            subtext={`${metrics.brand?.competitors.length || 0} competitors tracked`}
          />

          <KpiCard
            title="Total AI Citations"
            value="0"
            change="0%"
            isPositive={true}
            period="Indexed URLs"
            icon={Link2}
            iconColor="text-teal-400"
            accentGlow="from-teal-500/20 to-emerald-500/0"
            subtext="Indexed on audit"
          />

          <KpiCard
            title="Top Performing Engine"
            value="Pending"
            change="All 5 Engines"
            isPositive={true}
            period="ChatGPT, Claude, Perplexity..."
            icon={Trophy}
            iconColor="text-amber-400"
            accentGlow="from-amber-500/20 to-yellow-500/0"
            subtext="Awaiting run"
          />
        </div>

        <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/10">
          <Layers className="w-8 h-8 text-muted-foreground mx-auto opacity-60" />
          <h3 className="text-sm font-semibold text-foreground">No Audit Runs Recorded Yet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Click &quot;Run First Test Audit&quot; above or &quot;Run Audit Now&quot; in the header navigation to test your tracked search prompts across all generative search models.
          </p>
          <Button asChild variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
            <Link href="/dashboard/brand-kit">
              Manage Prompts & Brand Kit <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Live Data Hydrated State
  return (
    <div className="space-y-6">
      {/* Brand Hero Banner */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-blue-950/40 via-card/80 to-indigo-950/30 p-6 relative overflow-hidden shadow-sm backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Live GEO Pulse</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                Tracking brand: <strong className="text-foreground">{metrics.brand?.name}</strong> ({metrics.brand?.domain})
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Generative Engine Visibility Overview
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl mt-1 leading-relaxed">
              Your overall 30-day AI visibility score is{' '}
              <strong className="text-emerald-400">{metrics.overallScore}%</strong> across{' '}
              {metrics.promptCount} active prompts.{' '}
              {metrics.topEngineName} is currently your strongest source, scoring {metrics.topEngineScore}%.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-background/60 border border-border/80 backdrop-blur-sm text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Health Status</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />{' '}
                {metrics.overallScore >= 75 ? 'High Visibility' : metrics.overallScore >= 50 ? 'Moderate Visibility' : 'Low Visibility'}
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-background/60 border border-border/80 backdrop-blur-sm text-center">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Competitors</div>
              <div className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> {metrics.brand?.competitors.length || 0} Tracked
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Engine Intelligence Callout */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-indigo-950/30 via-card to-blue-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Action Engine Playbook Active</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                New Fixes Available
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Review AI-drafted Markdown content fixes for search queries scoring under 50% visibility.
            </p>
          </div>
        </div>

        <Button asChild variant="glow" size="sm" className="text-xs font-semibold gap-1.5 shrink-0 self-start sm:self-auto">
          <Link href="/dashboard/actions">
            <span>Open Action Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Overall Visibility Score"
          value={`${metrics.overallScore}%`}
          change={metrics.scoreChange}
          isPositive={true}
          period="Last 30 days avg"
          icon={Eye}
          iconColor="text-blue-400"
          accentGlow="from-blue-500/20 to-indigo-500/0"
          subtext="Target: 85.0%"
        />

        <KpiCard
          title="Share of Voice (SOV)"
          value={`${metrics.shareOfVoice}%`}
          change={metrics.sovChange}
          isPositive={true}
          period={`vs ${metrics.brand?.competitors.length || 0} competitors`}
          icon={PieChart}
          iconColor="text-indigo-400"
          accentGlow="from-indigo-500/20 to-purple-500/0"
          subtext="Benchmark estimated"
        />

        <KpiCard
          title="Total AI Citations"
          value={metrics.totalCitations.toLocaleString()}
          change={metrics.citationsChange}
          isPositive={true}
          period="Indexed URLs & references"
          icon={Link2}
          iconColor="text-teal-400"
          accentGlow="from-teal-500/20 to-emerald-500/0"
          subtext="From completed runs"
        />

        <KpiCard
          title="Top Performing Engine"
          value={`${metrics.topEngineScore}%`}
          change={metrics.topEngineName}
          isPositive={true}
          period="Highest visibility"
          icon={Trophy}
          iconColor="text-amber-400"
          accentGlow="from-amber-500/20 to-yellow-500/0"
          subtext={`${metrics.engineComparisons.length} engines audited`}
        />
      </div>

      {/* Main Charts Grid: 30-Day Trend Area Chart & 5-Engine Comparison Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VisibilityTrendChart data={metrics.timeSeriesData} />
        <EngineBreakdownChart data={metrics.engineComparisons} />
      </div>

      {/* Top Cited URLs Table */}
      <TopCitationsTable citations={metrics.topCitations} />

      {/* Live Audit Activity Stream & Recent Engine Runs */}
      {metrics.recentRuns.length > 0 && (
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Recent Multi-Engine Audit Runs</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono flex items-center gap-1">
                  <Activity className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> Live Stream
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time audit log executing prompt checks against LLM search models
              </CardDescription>
            </div>
            <Link
              href="/dashboard/visibility-matrix"
              className="text-xs text-primary font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              View Matrix <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <EngineBadge engine={run.engine} size="sm" />
                      <span className="text-[11px] text-muted-foreground font-mono">{run.timestamp}</span>
                    </div>
                    <div className="text-xs font-medium text-foreground truncate max-w-sm">
                      &quot;{run.prompt}&quot;
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-emerald-400">{run.visibilityImpact}</div>
                    <div className="text-[10px] text-muted-foreground">{run.citationsFound} citations found</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
