'use client';

import * as React from 'react';
import {
  Building2,
  Globe,
  Briefcase,
  FileText,
  Plus,
  Shield,
  Save,
  RotateCw,
  AlertCircle,
  ExternalLink,
  X,
  CheckCircle2,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { getBrandKitData, saveBrandProfile } from '@/lib/actions/brand-kit';
import { EngineIcon } from '@/components/ui/engine-icon';
import { DomainFavicon } from '@/components/ui/domain-favicon';

import { ENGINE_AUDITORS_LIST } from '@/config/ai-models';

interface CompetitorChip {
  id: string;
  name: string;
  domain: string;
}

const ENGINE_AUDITORS = ENGINE_AUDITORS_LIST;

export default function BrandKitPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Initial reference states for change detection
  const [initialData, setInitialData] = React.useState<{
    brandName: string;
    brandDomain: string;
    industry: string;
    description: string;
    competitors: CompetitorChip[];
  }>({
    brandName: '',
    brandDomain: '',
    industry: '',
    description: '',
    competitors: [],
  });

  // Brand Profile State
  const [brandName, setBrandName] = React.useState('');
  const [brandDomain, setBrandDomain] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Competitors State
  const [competitors, setCompetitors] = React.useState<CompetitorChip[]>([]);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');

  // Active AI Engine Auditors State
  const [enabledEngines, setEnabledEngines] = React.useState<Record<string, boolean>>({
    chatgpt: true,
    perplexity: true,
    gemini: true,
    claude: true,
    copilot: true,
  });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBrandKitData();
      if (data.brand) {
        const loadedName = data.brand.name || '';
        const loadedDomain = data.brand.domain || '';
        const loadedIndustry = data.brand.industry || '';
        const loadedDesc = data.brand.description || '';
        const loadedComps = data.brand.competitors || [];

        setBrandName(loadedName);
        setBrandDomain(loadedDomain);
        setIndustry(loadedIndustry);
        setDescription(loadedDesc);
        setCompetitors(loadedComps);

        setInitialData({
          brandName: loadedName,
          brandDomain: loadedDomain,
          industry: loadedIndustry,
          description: loadedDesc,
          competitors: loadedComps,
        });
      }
    } catch (err) {
      console.error('Failed to load brand data:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to load brand configuration from Supabase.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Track unsaved modifications
  React.useEffect(() => {
    const isNameChanged = brandName !== initialData.brandName;
    const isDomainChanged = brandDomain !== initialData.brandDomain;
    const isIndustryChanged = industry !== initialData.industry;
    const isDescChanged = description !== initialData.description;
    const isCompsChanged =
      JSON.stringify(competitors) !== JSON.stringify(initialData.competitors);

    setHasUnsavedChanges(
      isNameChanged || isDomainChanged || isIndustryChanged || isDescChanged || isCompsChanged
    );
  }, [brandName, brandDomain, industry, description, competitors, initialData]);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    const domain =
      newCompDomain.trim() ||
      `${newCompName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

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

  const handleResetChanges = () => {
    setBrandName(initialData.brandName);
    setBrandDomain(initialData.brandDomain);
    setIndustry(initialData.industry);
    setDescription(initialData.description);
    setCompetitors(initialData.competitors);
    setStatusMessage(null);
  };

  const handleSaveBrandKit = async () => {
    if (!brandName.trim()) {
      setStatusMessage({ type: 'error', text: 'Brand Name is required.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const compStrings = competitors.map((c) =>
        c.domain ? `${c.name} (${c.domain})` : c.name
      );

      await saveBrandProfile({
        name: brandName.trim(),
        domain: brandDomain.trim(),
        industry: industry.trim(),
        description: description.trim(),
        competitors: compStrings,
      });

      setInitialData({
        brandName: brandName.trim(),
        brandDomain: brandDomain.trim(),
        industry: industry.trim(),
        description: description.trim(),
        competitors,
      });

      setSavedSuccess(true);
      setHasUnsavedChanges(false);
      setStatusMessage({
        type: 'success',
        text: 'Brand configuration successfully saved to Supabase.',
      });

      setTimeout(() => {
        setSavedSuccess(false);
        setStatusMessage(null);
      }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save configuration';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
        <RotateCw className="w-7 h-7 text-gray-900 dark:text-white animate-spin" />
        <span className="text-xs text-gray-500 font-medium">
          Loading brand configuration from Supabase...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
      
      {/* ========================================================================= */}
      {/* 1. Clean Header (Title & Breadcrumbs) */}
      {/* ========================================================================= */}
      <div className="space-y-1 pb-6 border-b border-gray-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Configuration
          </span>
          <span className="text-gray-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
            Entity Grounding
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Brand Kit & Entity Configuration
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          Configure your primary brand identity, benchmark competitors, and active AI engine auditors.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. Split-Row Section 1: Brand Identity */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0 md:pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Brand Identity
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            Define your primary brand name, canonical domain URL, industry niche, and core capability. AI search models use this context to ground citation queries and evaluate entity relevance.
          </p>
        </div>

        {/* Right Column (2/3 width): Input Fields Card */}
        <div className="md:w-2/3 w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
          {/* Brand Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Brand Name *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none">
                <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </div>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Nike, Acme Labs, Apex Coffee"
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              The primary trademark or brand name evaluated by LLMs.
            </p>
          </div>

          {/* Primary Domain */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Primary Domain URL
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none">
                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </div>
              <input
                type="text"
                value={brandDomain}
                onChange={(e) => setBrandDomain(e.target.value)}
                placeholder="e.g. nike.com, acmelabs.com"
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              Main canonical domain used for citation attribution and authority scoring.
            </p>
          </div>

          {/* Industry / Market Niche */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Industry / Market Niche
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center pointer-events-none">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </div>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Athletic Apparel & Footwear, Specialty Coffee, Developer Tools"
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              Vertical or category used for market taxonomy and competitor classification.
            </p>
          </div>

          {/* Core Value Proposition & Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Core Value Proposition & Description
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 flex items-center pointer-events-none">
                <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Summarize what your brand does so AI auditors evaluate entity contextual relevance..."
                className="w-full pl-9 pr-3 pt-2 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs leading-relaxed"
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500">
              Provides grounding summary context for LLM generative queries.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. Split-Row Section 2: Benchmark Competitors */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-gray-200/80 dark:border-zinc-800">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0 md:pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Benchmark Competitors
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            Specify rival brand entities and competitor domains. Beacon measures your generative Share of Voice (SOV) and tracks displacement rates against these targets.
          </p>
          <div className="pt-2">
            <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 font-mono">
              {competitors.length} Rivals Monitored
            </span>
          </div>
        </div>

        {/* Right Column (2/3 width): Competitors Manager Card */}
        <div className="md:w-2/3 w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-5">
          {/* Single-Row Add Competitor Form */}
          <form
            onSubmit={handleAddCompetitor}
            className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/40"
          >
            <input
              type="text"
              placeholder="Competitor brand (e.g. Fivetran)"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="w-full sm:flex-1 h-8.5 px-3 text-xs rounded-lg border-0 bg-transparent text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="h-4 w-px bg-gray-200 dark:bg-zinc-700 hidden sm:block" />
            <input
              type="text"
              placeholder="Domain (e.g. fivetran.com)"
              value={newCompDomain}
              onChange={(e) => setNewCompDomain(e.target.value)}
              className="w-full sm:flex-1 h-8.5 px-3 text-xs rounded-lg border-0 bg-transparent text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={!newCompName.trim()}
              className="w-full sm:w-auto h-8.5 px-3.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span>Add Competitor</span>
            </Button>
          </form>

          {/* Competitor Badges Grid */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Active Benchmark Targets ({competitors.length})
            </div>

            {competitors.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/40 text-xs text-gray-400">
                No competitors configured. Add rival brand names and domains above to benchmark market share.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {competitors.map((comp) => (
                  <div
                    key={comp.id}
                    className="flex items-center justify-between gap-3 pl-3 pr-2 py-2 rounded-xl border border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs shadow-2xs hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
                  >
                    {/* Left: Favicon + Name + Domain */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <DomainFavicon
                        domainOrUrl={comp.domain || comp.name}
                        size={18}
                        className="rounded-md shadow-2xs shrink-0"
                        fallbackInitial
                      />
                      <div className="flex items-baseline gap-1.5 min-w-0 truncate">
                        <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                          {comp.name}
                        </span>
                        {comp.domain && (
                          <span className="font-mono text-[10px] text-gray-400 dark:text-zinc-500 truncate">
                            ({comp.domain})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions pushed cleanly to the right edge */}
                    <div className="flex items-center gap-1 shrink-0">
                      {comp.domain && (
                        <a
                          href={comp.domain.startsWith('http') ? comp.domain : `https://${comp.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Visit domain"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove competitor"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. Split-Row Section 3: Active AI Engine Auditors */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-gray-200/80 dark:border-zinc-800">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0 md:pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Active AI Engine Auditors
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
            Choose which generative search models evaluate your brand during live and scheduled audits. Toggle models on or off based on your target audience channels.
          </p>
        </div>

        {/* Right Column (2/3 width): Engine Toggles Card */}
        <div className="md:w-2/3 w-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-2.5">
          {ENGINE_AUDITORS.map((engine) => {
            const isChecked = enabledEngines[engine.key] ?? true;

            return (
              <div
                key={engine.key}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-800/30 hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <EngineIcon engine={engine.name} size={18} />
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                      {engine.name}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {engine.model} • {engine.provider}
                    </div>
                  </div>
                </div>

                <Switch
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    setEnabledEngines((prev) => ({
                      ...prev,
                      [engine.key]: checked,
                    }))
                  }
                  className="data-[state=checked]:bg-gray-900 dark:data-[state=checked]:bg-white"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. Sticky Bottom Action Bar (Unsaved Changes & Save Trigger) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-t border-gray-200/90 dark:border-zinc-800 py-3.5 px-4 sm:px-8 shadow-lg">
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
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-zinc-500">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>All brand settings up to date</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {hasUnsavedChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetChanges}
                disabled={isSaving}
                className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 cursor-pointer"
              >
                Discard
              </Button>
            )}

            <Button
              onClick={handleSaveBrandKit}
              disabled={!hasUnsavedChanges || isSaving}
              className="h-9 px-5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
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

