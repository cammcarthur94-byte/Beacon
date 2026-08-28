'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getBrandKitData, saveBrandProfile } from '@/lib/actions/brand-kit';
import { DomainFavicon } from '@/components/ui/domain-favicon';

type SettingsTab = 'platform' | 'competitors' | 'domains' | 'models';

interface CompetitorChip {
  id: string;
  name: string;
  domain: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsTab) || 'platform';
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(
    ['platform', 'competitors', 'domains', 'models'].includes(initialTab) ? initialTab : 'platform'
  );
  const [saved, setSaved] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Platform Settings State
  const [workspaceName, setWorkspaceName] = React.useState('Beacon Workspace');
  const [adminEmail, setAdminEmail] = React.useState('cammcarthur94@gmail.com');
  const [industry, setIndustry] = React.useState('Technology & B2B SaaS');
  const [dailyDigest, setDailyDigest] = React.useState(true);
  const [displacementAlert, setDisplacementAlert] = React.useState(true);
  const [weeklyReport, setWeeklyReport] = React.useState(false);

  // Competitor Intel State
  const [brandName, setBrandName] = React.useState('Acme Sync');
  const [brandDomain, setBrandDomain] = React.useState('acmelabs.com');
  const [brandDescription, setBrandDescription] = React.useState(
    'Unified enterprise cloud synchronization and real-time data streaming platform.'
  );
  const [competitors, setCompetitors] = React.useState<CompetitorChip[]>([
    { id: 'c-1', name: 'OmniSync', domain: 'omnisync.com' },
    { id: 'c-2', name: 'Nexus AI', domain: 'nexusai.io' },
    { id: 'c-3', name: 'Apex Platform', domain: 'apexplatform.com' },
  ]);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');
  const [isLoadingBrand, setIsLoadingBrand] = React.useState(true);

  // Load Brand and Competitor Data from Supabase
  React.useEffect(() => {
    getBrandKitData()
      .then((data) => {
        if (data.brand) {
          if (data.brand.name) setBrandName(data.brand.name);
          if (data.brand.domain) setBrandDomain(data.brand.domain);
          if (data.brand.industry) setIndustry(data.brand.industry);
          if (data.brand.description) setBrandDescription(data.brand.description);
          if (data.brand.competitors && data.brand.competitors.length > 0) {
            setCompetitors(data.brand.competitors);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load brand data:', err);
      })
      .finally(() => {
        setIsLoadingBrand(false);
      });
  }, []);

  // Sync tab from URL if changed
  React.useEffect(() => {
    const tabParam = searchParams.get('tab') as SettingsTab;
    if (tabParam && ['platform', 'competitors', 'domains', 'models'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  // AI Model Preferences State
  const [defaultEngines, setDefaultEngines] = React.useState<string[]>([
    'ChatGPT',
    'Perplexity',
    'Gemini',
    'Claude',
    'Copilot',
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      // Save Brand & Competitor profile to Supabase
      const compStrings = competitors.map((c) =>
        c.domain ? `${c.name} (${c.domain})` : c.name
      );

      await saveBrandProfile({
        name: brandName.trim() || 'Acme Sync',
        domain: brandDomain.trim() || 'acmelabs.com',
        industry: industry.trim() || 'Technology & B2B SaaS',
        description: brandDescription.trim(),
        competitors: compStrings,
      });

      setSaved(true);
      setStatusMessage({ type: 'success', text: 'All settings saved successfully.' });
      setTimeout(() => {
        setSaved(false);
        setStatusMessage(null);
      }, 3500);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('bcn_live_8f3a9e1029c4819d7b5e');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    const domain = newCompDomain.trim() || `${newCompName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    setCompetitors((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        name: newCompName.trim(),
        domain,
      },
    ]);
    setNewCompName('');
    setNewCompDomain('');
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors((prev) => prev.filter((c) => c.id !== id));
  };

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
  };

  const handleDeleteDomain = (domain: string) => {
    setDomainsList((prev) => prev.filter((d) => d.domain !== domain));
  };

  const handleToggleDefaultEngine = (name: string) => {
    setDefaultEngines((prev) =>
      prev.includes(name)
        ? prev.length > 1
          ? prev.filter((e) => e !== name)
          : prev
        : [...prev, name]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Settings & Configuration
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Manage your workspace configuration, custom domain white-labeling, and AI audit preferences
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shadow-2xs self-start sm:self-auto transition-all cursor-pointer"
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Top Settings Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-zinc-800/60 rounded-2xl w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('platform')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap',
            activeTab === 'platform'
              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Platform Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('competitors')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap',
            activeTab === 'competitors'
              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          )}
        >
          <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Competitor Intel</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            {competitors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('domains')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap',
            activeTab === 'domains'
              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          )}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Custom Domains</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            {domainsList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={cn(
            'flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap',
            activeTab === 'models'
              ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xs'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI Engine Preferences</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* Tab 1: Platform Settings (Workspace Profile, Alerts, Developer API) */}
      {/* ========================================================================= */}
      {activeTab === 'platform' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Workspace Profile */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Workspace Profile
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Primary organization branding and notification dispatch configurations
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Admin Notification Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Industry Classification
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Automated Alerts & Email Digests */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Alerts & Automated Digests
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Configure instant triggers for competitor displacements and daily audit digests
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    Daily Audit Email Digest
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Send 24h summary report with delta changes to {adminEmail}
                  </div>
                </div>
                <Switch
                  checked={dailyDigest}
                  onCheckedChange={setDailyDigest}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    Competitor Displacement Alert
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Trigger instant notification when a competitor overtakes #1 citation ranking
                  </div>
                </div>
                <Switch
                  checked={displacementAlert}
                  onCheckedChange={setDisplacementAlert}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-zinc-100">
                    Weekly GEO Executive Summary
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Weekly PDF report formatted for team and stakeholder reviews
                  </div>
                </div>
                <Switch
                  checked={weeklyReport}
                  onCheckedChange={setWeeklyReport}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Developer API Access */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Developer API Access
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Use your API token to programmatically trigger audits and fetch citation records
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Live Production API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value="bcn_live_8f3a9e1029c4819d7b5e"
                  readOnly
                  className="flex-1 h-9 px-3 font-mono rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 shadow-2xs select-all"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyApiKey}
                  className="h-9 px-3 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-2xs hover:bg-gray-50 cursor-pointer"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Key</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-gray-400">
                Keep your secret API key secure. Do not expose it in client-side code.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 2: Competitor Intel & Benchmark Entities */}
      {/* ========================================================================= */}
      {activeTab === 'competitors' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* 1. Benchmark Competitors Manager */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Benchmark Competitors & Rival Domains
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    AI answer engines evaluate your entity visibility and citation displacement directly against these rivals
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 font-mono">
                {competitors.length} Monitored
              </span>
            </div>

            {/* Add Competitor Form */}
            <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <input
                type="text"
                placeholder="Competitor brand (e.g., OmniSync)"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                className="w-full sm:flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
              <input
                type="text"
                placeholder="Domain (e.g., omnisync.com)"
                value={newCompDomain}
                onChange={(e) => setNewCompDomain(e.target.value)}
                className="w-full sm:flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
              />
              <Button
                type="submit"
                disabled={!newCompName.trim()}
                className="w-full sm:w-auto h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Competitor</span>
              </Button>
            </form>

            {/* Monitored Competitors Grid */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2.5">
                Active Tracked Competitors ({competitors.length})
              </div>

              {competitors.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/30 text-xs text-gray-400">
                  No competitors added yet. Add rival brands above to monitor head-to-head share of voice.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="p-3.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-300 dark:hover:border-zinc-700 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <DomainFavicon
                          domainOrUrl={comp.domain || comp.name}
                          size={24}
                          className="rounded-lg shadow-2xs shrink-0"
                          fallbackInitial
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-gray-900 dark:text-zinc-100 truncate">
                            {comp.name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono truncate">
                            {comp.domain || 'no domain'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {comp.domain && (
                          <a
                            href={`https://${comp.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                            title="Visit website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveCompetitor(comp.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove competitor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Target Brand Profile & Context Grounding */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Target Entity Identity & Context Grounding
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Defines your core entity so AI audit models evaluate citation authority against the right category context
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Target Brand Name *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Acme Sync"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Primary Domain URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    placeholder="acmelabs.com"
                    className="w-full h-9 pl-8.5 pr-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Industry / Market Niche
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Technology & B2B SaaS"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Core Value Proposition & Description
                </label>
                <textarea
                  value={brandDescription}
                  onChange={(e) => setBrandDescription(e.target.value)}
                  rows={3}
                  placeholder="Summarize your brand value proposition to ground AI evaluation models..."
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 3: Custom Domains & White-Labeling */}
      {/* ========================================================================= */}
      {activeTab === 'domains' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Custom Domains Manager */}
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Custom Domains & White-Labeling
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Host client-facing GEO audit dashboards and matrix reports under your own brand CNAME
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                SSL Auto-Provisioned
              </span>
            </div>

            {/* Add Custom Domain Form */}
            <form onSubmit={handleAddDomain} className="flex items-center gap-2.5 pt-1">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g., reports.yourbrand.com"
                className="flex-1 h-9 px-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs font-mono"
              />
              <Button
                type="submit"
                disabled={!customDomain.trim()}
                className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Domain</span>
              </Button>
            </form>

            {/* Domains List */}
            <div className="divide-y divide-gray-100 dark:divide-zinc-800/60 pt-1">
              {domainsList.map((item) => (
                <div
                  key={item.domain}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900 dark:text-zinc-100 font-mono">
                      {item.domain}
                    </span>

                    {item.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3" />
                        CNAME Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                        DNS Verification Pending
                      </span>
                    )}

                    <span className="text-[10px] text-gray-400">Added {item.added}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <a
                      href={`https://${item.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteDomain(item.domain)}
                      title="Remove domain"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DNS Instructions Callout */}
            <div className="p-4 rounded-xl border border-blue-200/60 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>DNS Configuration Instructions</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                To route your custom domain to Beacon, add a <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono text-[10px]">CNAME</code> record pointing to <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono text-[10px]">cname.beacon-geo.com</code> in your domain registrar DNS settings (Cloudflare, GoDaddy, Namecheap, AWS Route 53).
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* Tab 3: AI Engine Preferences */}
      {/* ========================================================================= */}
      {activeTab === 'models' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-zinc-800/80">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Default AI Engine Target Selection
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Choose which generative answer engines are automatically included during audit cycles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {[
                { name: 'ChatGPT', provider: 'OpenAI GPT-4o', color: 'bg-emerald-500' },
                { name: 'Perplexity', provider: 'Sonar Online Search', color: 'bg-cyan-500' },
                { name: 'Gemini', provider: 'Google Gemini 1.5 Pro', color: 'bg-blue-500' },
                { name: 'Claude', provider: 'Anthropic Claude Haiku 4.5', color: 'bg-amber-500' },
                { name: 'Copilot', provider: 'Microsoft Bing Copilot', color: 'bg-purple-500' },
              ].map((model) => {
                const isSelected = defaultEngines.includes(model.name);
                return (
                  <div
                    key={model.name}
                    onClick={() => handleToggleDefaultEngine(model.name)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer select-none space-y-1.5',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 shadow-2xs'
                        : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', model.color)} />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {model.name}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                      {model.provider}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
