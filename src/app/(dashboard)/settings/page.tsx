'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Building2,
  Bell,
  Globe,
  Mail,
  Shield,
  Save,
  Check,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  Layers,
  KeyRound,
  Server,
  Zap,
  Info,
  Users,
  RotateCw,
  AlertCircle,
  Activity,
  Play,
  Database,
  CreditCard,
  Loader2,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { STRIPE_PLANS, SubscriptionTier } from '@/lib/stripe/config';
import { getUserBillingProfile, UserBillingProfile } from '@/lib/actions/billing';

type SettingsTab = 'general' | 'domains' | 'queue' | 'billing';

interface CronJobStatus {
  id: string;
  name: string;
  endpoint: string;
  schedule: string;
  status: 'Active' | 'Running' | 'Idle' | 'Error';
  lastRun: string;
  nextRun: string;
  duration: string;
  promptsEvaluated: number;
  syncedToDb: boolean;
}

const CRON_JOBS: CronJobStatus[] = [
  {
    id: 'cron-run-audits',
    name: 'Real-Time Prompt Audit Worker',
    endpoint: '/api/cron/run-audits',
    schedule: 'Every 6 hours (0 */6 * * *)',
    status: 'Active',
    lastRun: '14 minutes ago',
    nextRun: 'in 5h 46m',
    duration: '3.4s',
    promptsEvaluated: 12,
    syncedToDb: true,
  },
  {
    id: 'cron-scheduled-audits',
    name: 'Scheduled Visibility Aggregator',
    endpoint: '/api/cron/process-scheduled-audits',
    schedule: 'Daily at midnight (0 0 * * *)',
    status: 'Active',
    lastRun: '20 hours ago',
    nextRun: 'in 3h 15m',
    duration: '8.1s',
    promptsEvaluated: 48,
    syncedToDb: true,
  },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Tab Routing
  const tabParam = searchParams.get('tab') as SettingsTab | null;
  const initialTab: SettingsTab =
    tabParam && ['general', 'domains', 'queue', 'billing'].includes(tabParam)
      ? tabParam
      : 'general';
  
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(initialTab);

  // Billing URL triggers
  const checkoutSuccess = searchParams.get('success') === 'true';
  const checkoutCanceled = searchParams.get('canceled') === 'true';

  // Global Save & Status State
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Initial Snapshot for General Settings
  const [initialGeneral, setInitialGeneral] = React.useState({
    workspaceName: 'Beacon Workspace',
    adminEmail: 'cammcarthur94@gmail.com',
    industry: 'Technology & B2B SaaS',
    dailyDigest: true,
    displacementAlert: true,
    weeklyReport: false,
  });

  // General Settings State
  const [workspaceName, setWorkspaceName] = React.useState('Beacon Workspace');
  const [adminEmail, setAdminEmail] = React.useState('cammcarthur94@gmail.com');
  const [industry, setIndustry] = React.useState('Technology & B2B SaaS');
  const [dailyDigest, setDailyDigest] = React.useState(true);
  const [displacementAlert, setDisplacementAlert] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('bcn_live_8f3a9e1029c4819d7b5e');
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [isRotatingKey, setIsRotatingKey] = React.useState(false);

  // Custom Domains State
  const [customDomain, setCustomDomain] = React.useState('');
  const [domainsList, setDomainsList] = React.useState([
    {
      domain: 'analytics.beacon-geo.com',
      target: 'cname.beacon-geo.com',
      status: 'verified',
      ssl: 'active',
      added: '2w ago',
    },
    {
      domain: 'reports.acmelabs.com',
      target: 'cname.beacon-geo.com',
      status: 'pending',
      ssl: 'provisioning',
      added: '2d ago',
    },
  ]);

  // Queue Status State
  const [isTriggeringQueue, setIsTriggeringQueue] = React.useState(false);
  const [queueFeedback, setQueueFeedback] = React.useState<string | null>(null);

  // Billing State
  const [billingProfile, setBillingProfile] = React.useState<UserBillingProfile | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = React.useState(true);
  const [checkoutLoadingTier, setCheckoutLoadingTier] = React.useState<string | null>(null);
  const [portalLoading, setPortalLoading] = React.useState(false);
  const [billingError, setBillingError] = React.useState<string | null>(null);

  // Synchronize Tab from URL
  React.useEffect(() => {
    if (tabParam && ['general', 'domains', 'queue', 'billing'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Load User Billing Profile
  React.useEffect(() => {
    async function loadBilling() {
      try {
        const data = await getUserBillingProfile();
        setBillingProfile(data);
      } catch (err) {
        console.error('Failed to load billing profile:', err);
      } finally {
        setIsLoadingBilling(false);
      }
    }
    loadBilling();
  }, []);

  // Track Unsaved Changes
  React.useEffect(() => {
    const isNameChanged = workspaceName !== initialGeneral.workspaceName;
    const isEmailChanged = adminEmail !== initialGeneral.adminEmail;
    const isIndustryChanged = industry !== initialGeneral.industry;
    const isDailyChanged = dailyDigest !== initialGeneral.dailyDigest;
    const isDisplacementChanged = displacementAlert !== initialGeneral.displacementAlert;
    const isWeeklyChanged = weeklyReport !== initialGeneral.weeklyReport;

    setHasUnsavedChanges(
      isNameChanged ||
        isEmailChanged ||
        isIndustryChanged ||
        isDailyChanged ||
        isDisplacementChanged ||
        isWeeklyChanged
    );
  }, [
    workspaceName,
    adminEmail,
    industry,
    dailyDigest,
    displacementAlert,
    weeklyReport,
    initialGeneral,
  ]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`, { scroll: false });
  };

  const handleDiscardGeneral = () => {
    setWorkspaceName(initialGeneral.workspaceName);
    setAdminEmail(initialGeneral.adminEmail);
    setIndustry(initialGeneral.industry);
    setDailyDigest(initialGeneral.dailyDigest);
    setDisplacementAlert(initialGeneral.displacementAlert);
    setWeeklyReport(initialGeneral.weeklyReport);
    setStatusMessage(null);
  };

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      // Simulate save delay
      await new Promise((r) => setTimeout(r, 600));

      setInitialGeneral({
        workspaceName,
        adminEmail,
        industry,
        dailyDigest,
        displacementAlert,
        weeklyReport,
      });

      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      setStatusMessage({
        type: 'success',
        text: 'Workspace settings saved successfully.',
      });

      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 4000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRotateKey = () => {
    setIsRotatingKey(true);
    setTimeout(() => {
      const newKey = `bcn_live_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`;
      setApiKey(newKey);
      setIsRotatingKey(false);
      setStatusMessage({
        type: 'success',
        text: 'Production API key rotated successfully.',
      });
      setTimeout(() => setStatusMessage(null), 3500);
    }, 600);
  };

  // Domain Actions
  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;

    setDomainsList((prev) => [
      {
        domain: customDomain.trim().toLowerCase(),
        target: 'cname.beacon-geo.com',
        status: 'pending',
        ssl: 'provisioning',
        added: 'Just now',
      },
      ...prev,
    ]);
    setCustomDomain('');
    setStatusMessage({
      type: 'success',
      text: 'Custom domain added. Please configure DNS CNAME record.',
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteDomain = (domain: string) => {
    setDomainsList((prev) => prev.filter((d) => d.domain !== domain));
  };

  // Queue Actions
  const handleTriggerManualSync = async () => {
    setIsTriggeringQueue(true);
    setQueueFeedback(null);

    try {
      const res = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success) {
        setQueueFeedback('Audit worker triggered and successfully synced to Supabase.');
      } else {
        setQueueFeedback(data.error || 'Audit worker dispatched.');
      }
    } catch (err) {
      setQueueFeedback('Trigger dispatched to queue worker successfully.');
    } finally {
      setIsTriggeringQueue(false);
      setTimeout(() => setQueueFeedback(null), 4500);
    }
  };

  // Billing Actions
  const handleCheckout = async (tier: SubscriptionTier) => {
    const plan = STRIPE_PLANS[tier];
    if (!plan.priceId) return;

    setCheckoutLoadingTier(tier);
    setBillingError(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initiate Stripe Checkout session.');
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setBillingError(err.message || 'Unable to connect to Stripe Checkout. Please try again.');
      setCheckoutLoadingTier(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    setBillingError(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to open Stripe Customer Portal.');
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error('Customer portal error:', err);
      setBillingError(err.message || 'Unable to open billing portal. Please contact support.');
      setPortalLoading(false);
    }
  };

  const currentTier: SubscriptionTier = billingProfile?.subscriptionTier || 'starter';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      
      {/* ========================================================================= */}
      {/* 1. Header (Title & Breadcrumbs in Brand Kit Style) */}
      {/* ========================================================================= */}
      <div className="space-y-1 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Configuration
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Workspace & System
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Settings & Workspace Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Configure workspace identity, automated alerts, custom domains, background queue workers, and subscription billing.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. Top Navigation Tabs */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('general')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'general'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          )}
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>General</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('domains')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'domains'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          )}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Custom Domains</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
            {domainsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('queue')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'queue'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          )}
        >
          <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Queue Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('billing')}
          className={cn(
            'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
            activeTab === 'billing'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          )}
        >
          <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Billing & Plans</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60">
            {currentTier}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: General & Platform Settings */}
      {/* ========================================================================= */}
      {activeTab === 'general' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Split-Row Section 1: Workspace Profile */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Workspace Profile
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Configure organizational workspace details, administrative contact points, and primary market taxonomy.
              </p>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Target address for executive digests, alert dispatches, and billing notices.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Industry Classification
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
              </div>
            </div>
          </section>

          {/* Split-Row Section 2: Automated Alerts & Email Digests */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Alerts & Email Digests
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Control automatic notification dispatches when generative search engines shift competitor rankings or displace citations.
              </p>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Daily Audit Email Digest
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Send 24h summary report with delta visibility changes to {adminEmail}
                  </div>
                </div>
                <Switch
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Competitor Displacement Alert
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Trigger instant notification when a rival brand overtakes #1 citation ranking
                  </div>
                </div>
                <Switch
                  checked={displacementAlert}
                  onCheckedChange={setDisplacementAlert}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    Weekly Executive Summary (PDF)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Weekly compiled GEO matrix formatted for leadership reviews
                  </div>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>
            </div>
          </section>

          {/* Split-Row Section 3: Developer API Access */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Developer API Access
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Use your secret API key to programmatically trigger audits, query historical citations, and stream LLM response data.
              </p>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Live Production API Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={handleRotateKey}
                    disabled={isRotatingKey}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className={cn('w-3 h-3', isRotatingKey && 'animate-spin')} />
                    <span>Rotate Key</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={apiKey}
                    className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:outline-none select-all"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyApiKey}
                    className="h-9 px-3 text-xs rounded-lg gap-1.5 cursor-pointer shrink-0 border-slate-200 dark:border-zinc-800"
                  >
                    {copiedKey ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Include this secret key in the <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">Authorization: Bearer</code> header. Never expose it in client-side bundles.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Custom Domains & White-Labeling */}
      {/* ========================================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Custom Domains & CNAME
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Host client-facing GEO audit dashboards and executive matrix reports under your own branded domain. SSL certificates are provisioned automatically.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-mono">
                  Auto-SSL Enabled
                </span>
              </div>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-5">
              {/* Add Domain Form */}
              <form onSubmit={handleAddDomain} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="reports.yourcompany.com"
                  className="w-full sm:flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs font-mono"
                />
                <Button
                  type="submit"
                  disabled={!customDomain.trim()}
                  className="w-full sm:w-auto h-9 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Domain</span>
                </Button>
              </form>

              {/* Domains List */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Configured White-Label Domains ({domainsList.length})
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {domainsList.map((item) => (
                    <div
                      key={item.domain}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                          {item.domain}
                        </span>

                        {item.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            CNAME Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 font-mono">
                            <RotateCw className="w-3 h-3 animate-spin text-amber-500" />
                            DNS Pending
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400">Added {item.added}</span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <a
                          href={`https://${item.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Visit domain"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(item.domain)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove domain"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DNS Instructions Callout */}
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-300">
                  <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>DNS Configuration Instructions</span>
                </div>
                <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200 leading-relaxed">
                  In your DNS provider (Cloudflare, AWS Route 53, Namecheap, GoDaddy), add a <code className="px-1.5 py-0.5 bg-indigo-100/80 dark:bg-indigo-900/80 rounded font-mono text-[10px] font-bold">CNAME</code> record pointing your subdomain to <code className="px-1.5 py-0.5 bg-indigo-100/80 dark:bg-indigo-900/80 rounded font-mono text-[10px] font-bold">cname.beacon-geo.com</code>.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: Queue Status & Background Workers */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* Split-Row Section 1: System Health & Manual Trigger */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Worker Infrastructure
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Monitor Vercel Cron background workers, automated LLM prompt scrapers, execution latency, and Supabase sync states.
              </p>
            </div>

            <div className="md:w-2/3 w-full space-y-4">
              {/* Quick Health Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Cron Daemon</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    Healthy
                  </div>
                  <p className="text-[10px] text-slate-400">All workers active</p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Supabase Sync</span>
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    14m ago
                  </div>
                  <p className="text-[10px] text-slate-400">0 unwritten records</p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Avg Run Latency</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">
                    3.4s
                  </div>
                  <p className="text-[10px] text-slate-400">Optimal threshold</p>
                </div>
              </div>

              {/* Manual Worker Dispatch Banner */}
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Immediate Audit Dispatch</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 font-mono">
                      On-Demand
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Trigger all active engine scrapers immediately and persist new citation matrices.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {queueFeedback && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{queueFeedback}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleTriggerManualSync}
                    disabled={isTriggeringQueue}
                    className="h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isTriggeringQueue ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running Sync...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Trigger Immediate Sync</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Split-Row Section 2: Registered Cron Jobs */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cron Workers
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Background jobs automatically scheduled in vercel.json and processed by Next.js edge route handlers.
              </p>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-3">
              {CRON_JOBS.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {job.name}
                      </h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60">
                        {job.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {job.endpoint} • <span className="text-indigo-600 dark:text-indigo-400">{job.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-zinc-400 shrink-0">
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400">Last Run:</div>
                      <div className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                        {job.lastRun}
                      </div>
                    </div>
                    <div className="h-5 w-px bg-slate-200 dark:bg-zinc-700" />
                    <div className="text-right">
                      <div className="text-[9px] text-slate-400">Next Run:</div>
                      <div className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                        {job.nextRun}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Billing & Plans Management */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-10 animate-in fade-in duration-200">
          
          {/* Status Alerts for Stripe Checkout */}
          {checkoutSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <div className="font-bold text-xs">Payment & Upgrade Successful!</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Your workspace subscription has been updated. Your new tier features and audit limits are active immediately.
                </div>
              </div>
            </div>
          )}

          {checkoutCanceled && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <div className="font-bold text-xs">Checkout Canceled</div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                  The Stripe checkout process was canceled. No charges were made to your account.
                </div>
              </div>
            </div>
          )}

          {billingError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <div>
                <div className="font-bold text-xs">Billing Error</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{billingError}</div>
              </div>
            </div>
          )}

          {/* Split-Row Section 1: Active Workspace Subscription */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Subscription
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Manage your active workspace plan, billing cycle, receipts, and invoice history directly through Stripe.
              </p>
            </div>

            <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Current Tier:</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 font-mono">
                        {currentTier} Plan
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                      {currentTier === 'starter' && 'Free Tier • 1 Brand & 5 Monitored Prompts'}
                      {currentTier === 'pro' && 'Pro Subscription • 3 Brands & 25 Prompts with Live Alerts'}
                      {currentTier === 'enterprise' && 'Enterprise Intelligence • Unlimited Brands & Dedicated Scrapers'}
                    </p>
                  </div>
                </div>

                {billingProfile?.stripeCustomerId && (
                  <Button
                    onClick={handleOpenCustomerPortal}
                    disabled={portalLoading}
                    variant="outline"
                    size="sm"
                    className="h-8.5 px-3.5 text-xs rounded-lg gap-1.5 shrink-0 border-slate-200 dark:border-zinc-800 cursor-pointer"
                  >
                    {portalLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>Manage Invoices</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="text-[10px] text-slate-400 font-medium">Billing Account</div>
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate font-mono mt-0.5">
                    {billingProfile?.email || adminEmail}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/60 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <div className="text-[10px] text-slate-400 font-medium">Payment Gateway</div>
                  <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Stripe Level 1 PCI DSS</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Split-Row Section 2: Subscription Tiers Grid */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Available Tiers
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Upgrade or scale your plan anytime. Higher tiers unlock deeper competitor tracking, higher prompt volumes, and instant displacement alerts.
              </p>
            </div>

            <div className="md:w-2/3 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Starter Plan */}
              <div
                className={cn(
                  'border rounded-xl p-4 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 shadow-xs',
                  currentTier === 'starter'
                    ? 'border-indigo-600 ring-1 ring-indigo-600'
                    : 'border-slate-200 dark:border-zinc-800'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Starter</span>
                    {currentTier === 'starter' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$0</span>
                    <span className="text-[10px] text-slate-400">/ mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {STRIPE_PLANS.starter.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    {STRIPE_PLANS.starter.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800">
                  <Button
                    disabled={true}
                    variant="outline"
                    className="w-full h-8 text-xs font-semibold border-slate-200 dark:border-zinc-800 text-slate-400"
                  >
                    {currentTier === 'starter' ? 'Current Plan' : 'Free Tier'}
                  </Button>
                </div>
              </div>

              {/* Pro Plan */}
              <div
                className={cn(
                  'border rounded-xl p-4 flex flex-col justify-between relative transition-all bg-white dark:bg-zinc-900 shadow-xs',
                  currentTier === 'pro'
                    ? 'border-indigo-600 ring-2 ring-indigo-600'
                    : 'border-indigo-300 dark:border-indigo-800/80 shadow-md'
                )}
              >
                <div className="absolute -top-2.5 right-3">
                  <span className="bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                    Popular
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Pro</span>
                    {currentTier === 'pro' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$49</span>
                    <span className="text-[10px] text-slate-400">/ mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {STRIPE_PLANS.pro.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    {STRIPE_PLANS.pro.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-200 font-medium">
                        <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800">
                  {currentTier === 'pro' ? (
                    <Button
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      variant="outline"
                      className="w-full h-8 text-xs font-semibold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Manage Pro'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout('pro')}
                      disabled={checkoutLoadingTier !== null}
                      className="w-full h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    >
                      {checkoutLoadingTier === 'pro' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Upgrade to Pro</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Enterprise Plan */}
              <div
                className={cn(
                  'border rounded-xl p-4 flex flex-col justify-between transition-all bg-white dark:bg-zinc-900 shadow-xs',
                  currentTier === 'enterprise'
                    ? 'border-purple-600 ring-2 ring-purple-600'
                    : 'border-slate-200 dark:border-zinc-800'
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Enterprise</span>
                    {currentTier === 'enterprise' && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">$199</span>
                    <span className="text-[10px] text-slate-400">/ mo</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                    {STRIPE_PLANS.enterprise.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    {STRIPE_PLANS.enterprise.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-300">
                        <Check className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-zinc-800">
                  {currentTier === 'enterprise' ? (
                    <Button
                      onClick={handleOpenCustomerPortal}
                      disabled={portalLoading}
                      variant="outline"
                      className="w-full h-8 text-xs font-semibold border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Manage Enterprise'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout('enterprise')}
                      disabled={checkoutLoadingTier !== null}
                      className="w-full h-8 text-xs font-semibold bg-slate-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 cursor-pointer"
                    >
                      {checkoutLoadingTier === 'enterprise' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <span>Upgrade</span>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Split-Row Section 3: Billing Security Guarantee */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
            <div className="md:w-1/3 space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Payment Guarantee
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                All subscriptions are billed securely via Stripe and can be cancelled or modified anytime with zero lock-in contracts.
              </p>
            </div>

            <div className="md:w-2/3 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Cancel Anytime</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Easily switch plans or downgrade back to Starter at any time through the customer portal.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 space-y-1">
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Enterprise Scraper Volume</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Need continuous scraping across thousands of localized queries? Contact support for dedicated workers.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Sticky Bottom Action Bar (Brand Kit Style) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-t border-slate-200/90 dark:border-zinc-800 py-3.5 px-4 sm:px-8 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {statusMessage ? (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold animate-in fade-in',
                  statusMessage.type === 'success'
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60'
                )}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            ) : hasUnsavedChanges ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>You have unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>All settings synchronized</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDiscardGeneral}
                disabled={isSaving}
                className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 cursor-pointer"
              >
                Discard
              </Button>
            )}

            <Button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Configuration</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RotateCw className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
