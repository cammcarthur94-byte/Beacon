'use client';

import * as React from 'react';
import {
  Building2,
  Globe,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Check,
  Shield,
  Save,
  RotateCw,
  AlertCircle,
  ExternalLink,
  X,
  FileSearch,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  getBrandKitData,
  saveBrandProfile,
  addPrompt,
  deletePrompt,
} from '@/lib/actions/brand-kit';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EngineIcon } from '@/components/ui/engine-icon';
import { DomainFavicon } from '@/components/ui/domain-favicon';
import { PromptQuery } from '@/types/geo';

interface CompetitorChip {
  id: string;
  name: string;
  domain: string;
}

const ENGINE_AUDITORS = [
  { key: 'chatgpt', name: 'ChatGPT', model: 'GPT-4o (Omni)', color: 'bg-emerald-500' },
  { key: 'perplexity', name: 'Perplexity', model: 'Sonar Pro Online', color: 'bg-cyan-500' },
  { key: 'gemini', name: 'Gemini', model: 'Gemini 1.5 Pro', color: 'bg-blue-500' },
  { key: 'claude', name: 'Claude', model: 'Claude Haiku 4.5', color: 'bg-amber-500' },
  { key: 'copilot', name: 'Copilot', model: 'Bing GPT-4 Turbo', color: 'bg-purple-500' },
];

export default function BrandKitPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = React.useState(false);
  const [deletingPromptId, setDeletingPromptId] = React.useState<string | null>(null);

  // Brand Profile State
  const [brandName, setBrandName] = React.useState('Acme Sync');
  const [brandDomain, setBrandDomain] = React.useState('acmelabs.com');
  const [industry, setIndustry] = React.useState('Technology & B2B SaaS');
  const [description, setDescription] = React.useState(
    'Unified enterprise cloud synchronization and real-time data streaming platform.'
  );
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Competitors State
  const [competitors, setCompetitors] = React.useState<CompetitorChip[]>([
    { id: 'c-1', name: 'OmniSync', domain: 'omnisync.com' },
    { id: 'c-2', name: 'Nexus AI', domain: 'nexusai.io' },
    { id: 'c-3', name: 'Apex Platform', domain: 'apexplatform.com' },
  ]);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');

  // Tracked Prompts State
  const [prompts, setPrompts] = React.useState<PromptQuery[]>([]);
  const [newPromptText, setNewPromptText] = React.useState('');
  const [newPromptCategory, setNewPromptCategory] = React.useState('High-Intent Commercial');
  const [isAddPromptOpen, setIsAddPromptOpen] = React.useState(false);

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
        if (data.brand.name) setBrandName(data.brand.name);
        if (data.brand.domain) setBrandDomain(data.brand.domain);
        if (data.brand.industry) setIndustry(data.brand.industry);
        if (data.brand.description) setDescription(data.brand.description);
        if (data.brand.competitors && data.brand.competitors.length > 0) {
          setCompetitors(data.brand.competitors);
        }
      }
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Failed to load brand kit data:', err);
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

  const handleAddPrompt = async () => {
    if (!newPromptText.trim()) return;
    setIsAddingPrompt(true);

    try {
      await addPrompt({
        query: newPromptText.trim(),
        category: newPromptCategory,
      });

      setNewPromptText('');
      setIsAddPromptOpen(false);
      await loadData();
      setStatusMessage({ type: 'success', text: 'Search prompt tracked successfully.' });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add prompt';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    setDeletingPromptId(id);
    try {
      await deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      setStatusMessage({ type: 'success', text: 'Prompt removed.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete prompt';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setDeletingPromptId(null);
    }
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

      setSavedSuccess(true);
      setStatusMessage({
        type: 'success',
        text: 'Brand kit configuration saved successfully.',
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
        <RotateCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Loading brand configuration from Supabase...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================================= */}
      {/* 1. Sticky Action Bar Header */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-slate-200/80 dark:border-zinc-800/80 py-4 px-4 sm:px-6 -mx-4 sm:-mx-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Configuration
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Entity Mapping & Benchmarks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Brand Kit & Entity Grounding
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {statusMessage && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold animate-in fade-in',
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
              )}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <Button
            onClick={handleSaveBrandKit}
            disabled={isSaving}
            className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
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

      {/* ========================================================================= */}
      {/* 2. Responsive 12-Column Grid Layout */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================================= */}
        {/* LEFT COLUMN: Sticky Sidebar (4 Columns on Desktop) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          
          {/* Card 1: Brand Identity */}
          <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Brand Identity
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Primary entity indexed by AI search models
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Brand Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Sync"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  The primary trademark or brand name evaluated by LLMs.
                </p>
              </div>

              {/* Primary Domain */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Primary Domain URL
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    placeholder="acmelabs.com"
                    className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Main canonical domain used for citation attribution.
                </p>
              </div>

              {/* Industry / Niche */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Industry / Market Niche
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Technology & B2B SaaS"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Contextual category for industry entity relevance.
                </p>
              </div>

              {/* Core Value Proposition / Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Core Value Proposition & Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Summarize what your brand does so AI auditors evaluate entity contextual relevance..."
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                />
                <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                  Provides grounding context for LLM generative queries.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Active AI Engine Auditors */}
          <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active AI Engine Auditors
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Toggle models included in live and scheduled audits
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {ENGINE_AUDITORS.map((engine) => {
                const isChecked = enabledEngines[engine.key] ?? true;

                return (
                  <div
                    key={engine.key}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <EngineIcon engine={engine.name} size={16} />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {engine.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {engine.model}
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
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: Benchmark Competitors & Search Prompts (8 Columns) */}
        {/* ======================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 3: Benchmark Competitors */}
          <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Benchmark Competitors
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    AI engines measure your citation share of voice against these rival domains
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 font-mono">
                {competitors.length} Monitored
              </span>
            </div>

            {/* Unified Single-Row Add Competitor Form */}
            <form
              onSubmit={handleAddCompetitor}
              className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40"
            >
              <input
                type="text"
                placeholder="Competitor brand (e.g. Fivetran)"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                className="w-full sm:flex-1 h-8.5 px-3 text-xs rounded-lg border-0 bg-transparent text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 hidden sm:block" />
              <input
                type="text"
                placeholder="Domain (e.g. fivetran.com)"
                value={newCompDomain}
                onChange={(e) => setNewCompDomain(e.target.value)}
                className="w-full sm:flex-1 h-8.5 px-3 text-xs rounded-lg border-0 bg-transparent text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <Button
                type="submit"
                disabled={!newCompName.trim()}
                className="w-full sm:w-auto h-8.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Competitor</span>
              </Button>
            </form>

            {/* Redesigned Compact Competitor Badges with Ghost X */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Tracked Rival Entities ({competitors.length})
              </div>

              {competitors.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 text-xs text-slate-400">
                  No competitors added yet. Add rival brands above to monitor head-to-head share of voice.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                    >
                      <DomainFavicon
                        domainOrUrl={comp.domain || comp.name}
                        size={18}
                        className="rounded-md shadow-2xs shrink-0"
                        fallbackInitial
                      />
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">
                        {comp.name}
                      </span>
                      {comp.domain && (
                        <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                          ({comp.domain})
                        </span>
                      )}

                      {/* Outbound link */}
                      {comp.domain && (
                        <a
                          href={`https://${comp.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Visit domain"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* Ghost Style 'X' Close / Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove competitor"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Tracked Search Prompts */}
          <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <FileSearch className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Tracked Search Prompts
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Natural language queries evaluated across generative AI engines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 font-mono">
                  {prompts.length} Prompts
                </span>
                <Button
                  size="sm"
                  onClick={() => setIsAddPromptOpen(true)}
                  className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prompt</span>
                </Button>
              </div>
            </div>

            {/* Prompts Table */}
            {prompts.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/40 text-xs text-slate-400 space-y-2">
                <FileSearch className="w-6 h-6 text-slate-300 mx-auto" />
                <div>No custom search prompts tracked yet.</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddPromptOpen(true)}
                  className="text-xs h-8 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Prompt
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      <th className="py-3 px-4 min-w-[280px]">Query / Prompt</th>
                      <th className="py-3 px-3">Intent Category</th>
                      <th className="py-3 px-3 text-center">Score</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
                    {prompts.map((prompt) => (
                      <tr
                        key={prompt.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                          &ldquo;{prompt.query}&rdquo;
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                            {prompt.category || 'High-Intent Commercial'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {prompt.visibilityScore ? `${prompt.visibilityScore}%` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(prompt.id)}
                            disabled={deletingPromptId === prompt.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete prompt"
                          >
                            {deletingPromptId === prompt.id ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* Modal: Add Search Prompt */}
      {/* ========================================================================= */}
      <Dialog open={isAddPromptOpen} onOpenChange={setIsAddPromptOpen}>
        <DialogContent className="max-w-md p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Add Search Query to Evaluate
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
              Enter a natural language search query that buyers ask AI answer engines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Search Prompt / Query *
              </label>
              <textarea
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder="e.g., What are the best alternatives to OmniSync for real-time cloud data?"
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Intent Category
              </label>
              <select
                value={newPromptCategory}
                onChange={(e) => setNewPromptCategory(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="High-Intent Commercial">High-Intent Commercial</option>
                <option value="Direct Competitor Comparison">Direct Competitor Comparison</option>
                <option value="Informational / How-To">Informational / How-To</option>
                <option value="Transactional / Pricing">Transactional / Pricing</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2 flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddPromptOpen(false)}
              className="text-xs h-9 rounded-xl border-slate-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddPrompt}
              disabled={isAddingPrompt || !newPromptText.trim()}
              className="text-xs h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {isAddingPrompt ? 'Adding...' : 'Add Search Query'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
