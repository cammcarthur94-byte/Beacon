'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Globe,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Search,
  Plus,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MonitoredSite {
  id: string;
  domain: string;
  url: string;
  faviconText: string;
  faviconBg: string;
  auditsCount: number;
  lastAudited: string;
  score: number;
  seoStatus: 'good' | 'warning' | 'critical';
  aeoStatus: 'good' | 'warning' | 'critical';
  geoStatus: 'good' | 'warning' | 'critical';
  issues: {
    critical?: number;
    medium?: number;
    low?: number;
  };
}

const INITIAL_SITES: MonitoredSite[] = [
  {
    id: 'site-1',
    domain: 'stripe.com',
    url: 'https://stripe.com',
    faviconText: 'S',
    faviconBg: 'bg-indigo-600 text-white',
    auditsCount: 14,
    lastAudited: '2h ago',
    score: 91,
    seoStatus: 'good',
    aeoStatus: 'good',
    geoStatus: 'good',
    issues: { low: 3, medium: 2 },
  },
  {
    id: 'site-2',
    domain: 'linear.app',
    url: 'https://linear.app',
    faviconText: 'L',
    faviconBg: 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900',
    auditsCount: 8,
    lastAudited: '5h ago',
    score: 88,
    seoStatus: 'good',
    aeoStatus: 'good',
    geoStatus: 'warning',
    issues: { medium: 5, low: 1 },
  },
  {
    id: 'site-3',
    domain: 'supabase.com',
    url: 'https://supabase.com',
    faviconText: 'S',
    faviconBg: 'bg-emerald-600 text-white',
    auditsCount: 12,
    lastAudited: '1d ago',
    score: 95,
    seoStatus: 'good',
    aeoStatus: 'good',
    geoStatus: 'good',
    issues: { low: 2 },
  },
  {
    id: 'site-4',
    domain: 'openai.com',
    url: 'https://openai.com',
    faviconText: 'O',
    faviconBg: 'bg-zinc-800 text-white',
    auditsCount: 19,
    lastAudited: '1d ago',
    score: 79,
    seoStatus: 'good',
    aeoStatus: 'warning',
    geoStatus: 'warning',
    issues: { critical: 1, medium: 8, low: 4 },
  },
  {
    id: 'site-5',
    domain: 'vercel.com',
    url: 'https://vercel.com',
    faviconText: 'V',
    faviconBg: 'bg-black text-white dark:bg-white dark:text-black',
    auditsCount: 6,
    lastAudited: '3d ago',
    score: 84,
    seoStatus: 'good',
    aeoStatus: 'warning',
    geoStatus: 'good',
    issues: { medium: 6, low: 2 },
  },
  {
    id: 'site-6',
    domain: 'figma.com',
    url: 'https://figma.com',
    faviconText: 'F',
    faviconBg: 'bg-purple-600 text-white',
    auditsCount: 4,
    lastAudited: '4d ago',
    score: 73,
    seoStatus: 'warning',
    aeoStatus: 'warning',
    geoStatus: 'critical',
    issues: { critical: 2, medium: 12, low: 5 },
  },
  {
    id: 'site-7',
    domain: 'notion.so',
    url: 'https://notion.so',
    faviconText: 'N',
    faviconBg: 'bg-zinc-700 text-white',
    auditsCount: 11,
    lastAudited: '1w ago',
    score: 82,
    seoStatus: 'good',
    aeoStatus: 'warning',
    geoStatus: 'good',
    issues: { medium: 7, low: 3 },
  },
  {
    id: 'site-8',
    domain: 'resend.com',
    url: 'https://resend.com',
    faviconText: 'R',
    faviconBg: 'bg-blue-600 text-white',
    auditsCount: 3,
    lastAudited: '1w ago',
    score: 68,
    seoStatus: 'warning',
    aeoStatus: 'critical',
    geoStatus: 'critical',
    issues: { critical: 3, medium: 18, low: 6 },
  },
];

// Mini Bar Sparkline Component
function MiniBarChart({ values, color = 'blue' }: { values: number[]; color?: 'blue' | 'emerald' | 'amber' }) {
  const max = Math.max(...values, 100);
  const colorMap = {
    blue: 'bg-blue-500/30 group-hover:bg-blue-500/50',
    emerald: 'bg-emerald-500/30 group-hover:bg-emerald-500/50',
    amber: 'bg-amber-500/30 group-hover:bg-amber-500/50',
  };

  return (
    <div className="flex items-end gap-1 h-9 w-16 group">
      {values.map((v, i) => {
        const heightPct = Math.max(15, Math.round((v / max) * 100));
        const isLast = i === values.length - 1;
        return (
          <div
            key={i}
            style={{ height: `${heightPct}%` }}
            className={cn(
              'w-1.5 rounded-xs transition-all duration-300',
              isLast ? (color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500') : colorMap[color]
            )}
          />
        );
      })}
    </div>
  );
}

// Indicator status dot/bar
function StatusIndicator({ status }: { status: 'good' | 'warning' | 'critical' }) {
  const bgColors = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('w-2 h-2 rounded-full inline-block', bgColors[status])} />
      <span className="text-xs font-medium capitalize text-gray-700 dark:text-zinc-300">
        {status === 'good' ? 'Healthy' : status === 'warning' ? 'Needs Work' : 'Issues'}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [sites, setSites] = React.useState<MonitoredSite[]>(INITIAL_SITES);
  const [inputUrl, setInputUrl] = React.useState('');
  const [isAuditing, setIsAuditing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setIsAuditing(true);
    let cleanDomain = inputUrl.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    try {
      // Trigger background audit if endpoint is available
      await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});

      // Add newly audited site to the top of the monitored list
      const newSite: MonitoredSite = {
        id: `site-${Date.now()}`,
        domain: cleanDomain || 'mysite.com',
        url: inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`,
        faviconText: (cleanDomain.charAt(0) || 'W').toUpperCase(),
        faviconBg: 'bg-blue-600 text-white',
        auditsCount: 1,
        lastAudited: 'Just now',
        score: Math.floor(Math.random() * 15) + 80,
        seoStatus: 'good',
        aeoStatus: 'good',
        geoStatus: 'good',
        issues: { medium: 2, low: 1 },
      };

      setSites((prev) => [newSite, ...prev]);
      setInputUrl('');
    } catch (err) {
      console.error('Audit submit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredSites = sites.filter(
    (s) =>
      s.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
          Agentic SEO • AEO • GEO audit platform
        </p>
      </div>

      {/* 2. Top Metric Cards (3-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Sites Monitored */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Sites Monitored
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
              8
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>4 active monitoring</span>
          </div>
        </div>

        {/* Card 2: Avg. Score with Mini Chart */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Avg. Score
              </span>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
                83
              </div>
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5% from last week</span>
            </div>
          </div>
          <div className="pl-4">
            <MiniBarChart values={[55, 62, 58, 70, 75, 80, 83]} color="emerald" />
          </div>
        </div>

        {/* Card 3: Active Issues with Mini Chart */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col justify-between h-full">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                Active Issues
              </span>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1">
                79
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium">
              Across all sites
            </div>
          </div>
          <div className="pl-4">
            <MiniBarChart values={[90, 88, 85, 82, 80, 81, 79]} color="blue" />
          </div>
        </div>
      </div>

      {/* 3. Audit Input Section */}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/60 p-5 md:p-6 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs md:text-sm font-semibold text-gray-900 dark:text-zinc-100">
            Get started auditing SEO for your site now with AI help
          </span>
        </div>

        <form onSubmit={handleAuditSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Enter a URL to audit - https://yoursite.com"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs md:text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
          <Button
            type="submit"
            disabled={isAuditing || !inputUrl.trim()}
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs md:text-sm flex items-center justify-center gap-2 shrink-0 transition-all shadow-2xs"
          >
            {isAuditing ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing AI Engines...</span>
              </>
            ) : (
              <>
                <span>Run Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>

      {/* 4. Monitored Websites Table */}
      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
        {/* Table Header / Action Bar */}
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Monitored Websites
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Live multi-engine visibility across generative answer engines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter sites..."
              className="h-8 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/40">
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  Website
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-center">
                  Score
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  SEO
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  AEO
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  GEO
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
              {filteredSites.map((site) => {
                const isExcellent = site.score >= 90;
                const isGood = site.score >= 75 && site.score < 90;

                return (
                  <tr
                    key={site.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                  >
                    {/* Website Column */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs',
                            site.faviconBg
                          )}
                        >
                          {site.faviconText}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <span>{site.domain}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                            {site.auditsCount} audits • last {site.lastAudited}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Circular Score Badge */}
                    <td className="py-4 px-5 text-center">
                      <div className="inline-flex items-center justify-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-105',
                            isExcellent
                              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40'
                              : isGood
                              ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                              : 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40'
                          )}
                        >
                          {site.score}
                        </div>
                      </div>
                    </td>

                    {/* SEO Status */}
                    <td className="py-4 px-5">
                      <StatusIndicator status={site.seoStatus} />
                    </td>

                    {/* AEO Status */}
                    <td className="py-4 px-5">
                      <StatusIndicator status={site.aeoStatus} />
                    </td>

                    {/* GEO Status */}
                    <td className="py-4 px-5">
                      <StatusIndicator status={site.geoStatus} />
                    </td>

                    {/* Issues Pills */}
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {site.issues.critical && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                            {site.issues.critical} Critical
                          </span>
                        )}
                        {site.issues.medium && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200/60 dark:border-zinc-700/60">
                            {site.issues.medium} medium
                          </span>
                        )}
                        {site.issues.low && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                            {site.issues.low} low
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
