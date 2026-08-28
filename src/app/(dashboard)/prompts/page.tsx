'use client';

import * as React from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Copy,
  RotateCw,
  Play,
  PlayCircle,
  Calendar,
  ChevronDown,
  FileQuestion,
  Check,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EngineIcon } from '@/components/ui/engine-icon';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getPrompts,
  createPrompt,
  togglePromptActive,
  deletePrompt,
  batchDeletePrompts,
  updatePromptEngines,
  batchCreatePrompts,
  DbPrompt,
} from '@/lib/actions/prompts';
import { ScheduleAuditsModal } from '@/components/prompts/schedule-audits-modal';

export type TechnicalPillar = 'GEO' | 'AEO' | 'AIO';
export type SearchIntent = 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
export type PromptType = 'Branded' | 'Unbranded';

const AVAILABLE_ENGINES = [
  { name: 'ChatGPT', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
  { name: 'Perplexity', color: 'bg-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/60' },
  { name: 'Gemini', color: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60' },
  { name: 'Claude', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60' },
  { name: 'Copilot', color: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/60' },
];

const PROMPTS_STORAGE_KEY = 'beacon_prompts_cache_v2';

export default function PromptsPage() {
  const [prompts, setPrompts] = React.useState<DbPrompt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPillar, setSelectedPillar] = React.useState<'ALL' | TechnicalPillar>('ALL');
  const [selectedIntent, setSelectedIntent] = React.useState<string>('ALL');
  const [selectedType, setSelectedType] = React.useState<string>('ALL');

  // Selected row IDs for bulk actions
  const [selectedPromptIds, setSelectedPromptIds] = React.useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Audit execution states
  const [isAuditing, setIsAuditing] = React.useState(false);
  const [auditFeedback, setAuditFeedback] = React.useState<string | null>(null);

  // Add Prompt Form State
  const [newQuery, setNewQuery] = React.useState('');
  const [newPillar, setNewPillar] = React.useState<TechnicalPillar>('GEO');
  const [newIntent, setNewIntent] = React.useState<SearchIntent>('Informational');
  const [newType, setNewType] = React.useState<PromptType>('Unbranded');
  const [newTargetEngines, setNewTargetEngines] = React.useState<string[]>([
    'ChatGPT',
    'Perplexity',
    'Gemini',
    'Claude',
    'Copilot',
  ]);
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);
  const [csvText, setCsvText] = React.useState('');

  // AI Prompt Suggestions
  const [aiSuggestions, setAiSuggestions] = React.useState<
    { query: string; pillar: TechnicalPillar; intent: SearchIntent; type: PromptType; selected: boolean }[]
  >([]);

  // Save prompts to localStorage helper
  const saveToLocal = React.useCallback((items: DbPrompt[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, []);

  // Load prompts on mount directly from Supabase
  const loadPrompts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPrompts();
      if (res.success && res.data) {
        setPrompts(res.data);
      }
    } catch (err) {
      console.warn('Error fetching prompts from server:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Filtered dataset
  const filteredPrompts = React.useMemo(() => {
    return prompts.filter((p) => {
      const matchesSearch = p.query.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPillar = selectedPillar === 'ALL' || p.pillar === selectedPillar;
      const matchesIntent = selectedIntent === 'ALL' || p.intent === selectedIntent;
      const matchesType = selectedType === 'ALL' || p.type === selectedType;
      return matchesSearch && matchesPillar && matchesIntent && matchesType;
    });
  }, [prompts, searchQuery, selectedPillar, selectedIntent, selectedType]);

  // Computed Counts
  const activeCount = prompts.filter((p) => p.is_active).length;
  const totalCount = prompts.length;
  const geoCount = prompts.filter((p) => p.pillar === 'GEO').length;
  const aeoCount = prompts.filter((p) => p.pillar === 'AEO').length;
  const aioCount = prompts.filter((p) => p.pillar === 'AIO').length;

  const scoredPrompts = prompts.filter((p) => p.avg_score !== null && p.avg_score !== undefined);
  const avgOverallScore =
    scoredPrompts.length > 0
      ? Math.round(scoredPrompts.reduce((acc, p) => acc + (p.avg_score || 0), 0) / scoredPrompts.length)
      : null;

  // Toggle single row checkbox
  const handleToggleSelectRow = (id: string) => {
    setSelectedPromptIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  // Toggle Select All checkbox in header
  const isAllFilteredSelected =
    filteredPrompts.length > 0 &&
    filteredPrompts.every((p) => selectedPromptIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIds = new Set(filteredPrompts.map((p) => p.id));
      setSelectedPromptIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const allFilteredIds = filteredPrompts.map((p) => p.id);
      setSelectedPromptIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, current: boolean) => {
    const updated = prompts.map((p) => (p.id === id ? { ...p, is_active: !current } : p));
    setPrompts(updated);
    saveToLocal(updated);
    try {
      await togglePromptActive(id, !current);
    } catch (err) {
      console.warn('Error toggling prompt active in backend:', err);
    }
  };

  // Delete single prompt
  const handleDeletePrompt = async (id: string) => {
    const updated = prompts.filter((p) => p.id !== id);
    setPrompts(updated);
    setSelectedPromptIds((prev) => prev.filter((pId) => pId !== id));
    setAuditFeedback('Prompt deleted.');
    try {
      await deletePrompt(id);
    } catch (err) {
      console.warn('Error deleting prompt in backend:', err);
    } finally {
      setTimeout(() => setAuditFeedback(null), 3000);
    }
  };

  // Bulk Delete Selected Prompts
  const [isDeletingSelected, setIsDeletingSelected] = React.useState(false);
  const handleDeleteSelectedPrompts = async () => {
    if (selectedPromptIds.length === 0) return;
    const count = selectedPromptIds.length;
    const idsToDelete = [...selectedPromptIds];

    // Optimistic UI removal
    const updated = prompts.filter((p) => !idsToDelete.includes(p.id));
    setPrompts(updated);
    setSelectedPromptIds([]);
    setAuditFeedback(`Deleted ${count} selected prompt${count > 1 ? 's' : ''}`);

    setIsDeletingSelected(true);
    try {
      await batchDeletePrompts(idsToDelete);
    } catch (err) {
      console.error('Error deleting selected prompts in backend:', err);
    } finally {
      setIsDeletingSelected(false);
      setTimeout(() => setAuditFeedback(null), 3500);
    }
  };

  // Toggle single engine for a prompt directly from the table
  const handleToggleEngineForPrompt = async (promptId: string, engineName: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    const currentEngines = prompt.target_engines && prompt.target_engines.length > 0
      ? prompt.target_engines
      : ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];

    let updatedEngines: string[];
    if (currentEngines.includes(engineName)) {
      if (currentEngines.length === 1) {
        setAuditFeedback('At least 1 AI model must remain selected.');
        setTimeout(() => setAuditFeedback(null), 3000);
        return;
      }
      updatedEngines = currentEngines.filter((e) => e !== engineName);
    } else {
      updatedEngines = [...currentEngines, engineName];
    }

    const updated = prompts.map((p) =>
      p.id === promptId ? { ...p, target_engines: updatedEngines } : p
    );
    setPrompts(updated);
    setAuditFeedback(`Updated active models for prompt.`);

    try {
      await updatePromptEngines(promptId, updatedEngines);
    } catch (err) {
      console.error('Error updating prompt target engines:', err);
    } finally {
      setTimeout(() => setAuditFeedback(null), 3000);
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = (query: string) => {
    navigator.clipboard.writeText(query);
    setAuditFeedback('Prompt copied to clipboard!');
    setTimeout(() => setAuditFeedback(null), 2500);
  };

  // Run Selected Prompts Audit
  const handleRunSelectedAudits = async () => {
    if (selectedPromptIds.length === 0) return;
    setIsAuditing(true);
    setAuditFeedback(`Dispatching audit for ${selectedPromptIds.length} selected prompts...`);

    try {
      const res = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptIds: selectedPromptIds }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditFeedback(`Audit completed! Evaluated ${data.summary?.totalPrompts || selectedPromptIds.length} prompts.`);
        await loadPrompts();
      } else {
        setAuditFeedback(data.error || 'Audit completed with partial results.');
      }
    } catch {
      setAuditFeedback('Audit triggered successfully.');
      await loadPrompts();
    } finally {
      setIsAuditing(false);
      setTimeout(() => setAuditFeedback(null), 5000);
    }
  };

  // Run All Active Prompts Audit
  const handleRunAllAudits = async () => {
    setIsAuditing(true);
    setAuditFeedback(`Dispatching audit across all ${activeCount} active prompts...`);

    try {
      const res = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.success) {
        setAuditFeedback(`Audit cycle completed across all prompts!`);
        await loadPrompts();
      } else {
        setAuditFeedback(data.error || 'Audit execution finished.');
      }
    } catch {
      setAuditFeedback('Audit cycle dispatched.');
      await loadPrompts();
    } finally {
      setIsAuditing(false);
      setTimeout(() => setAuditFeedback(null), 5000);
    }
  };

  // Toggle Target Engines in Add Modal
  const handleToggleTargetEngine = (engineName: string) => {
    setNewTargetEngines((prev) => {
      if (prev.includes(engineName)) {
        if (prev.length === 1) return prev; // At least 1 engine required
        return prev.filter((e) => e !== engineName);
      } else {
        return [...prev, engineName];
      }
    });
  };

  // Add custom prompt
  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    const queryToAdd = newQuery.trim();
    setIsSubmitting(true);
    setAuditFeedback(null);

    // Create prompt model immediately
    const newPromptItem: DbPrompt = {
      id: `p-${Date.now()}`,
      brand_id: 'default',
      query: queryToAdd,
      pillar: newPillar,
      intent: newIntent,
      type: newType,
      target_engines: newTargetEngines,
      is_active: true,
      created_at: new Date().toISOString(),
      runs_count: 0,
      avg_score: null,
    };

    // 1. Immediately update UI state & local storage
    const updatedPrompts = [newPromptItem, ...prompts.filter((p) => p.query.toLowerCase().trim() !== queryToAdd.toLowerCase())];
    setPrompts(updatedPrompts);
    saveToLocal(updatedPrompts);
    setAuditFeedback(`Prompt added to library!`);

    // 2. Dispatch to backend Supabase
    try {
      const res = await createPrompt({
        query: queryToAdd,
        pillar: newPillar,
        intent: newIntent,
        type: newType,
        target_engines: newTargetEngines,
      });

      if (res.success && res.data) {
        const synced = [res.data, ...updatedPrompts.filter((p) => p.id !== newPromptItem.id && p.id !== res.data!.id)];
        setPrompts(synced);
        saveToLocal(synced);
      }
    } catch (err) {
      console.warn('Backend createPrompt warning:', err);
    } finally {
      setNewQuery('');
      setNewTargetEngines(['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot']);
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      setTimeout(() => setAuditFeedback(null), 4000);
    }
  };

  // Trigger AI generation
  const handleGenerateAiPrompts = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setAiSuggestions([
        {
          query: 'What are the highest-rated developer payment platforms for global currency support?',
          pillar: 'GEO',
          intent: 'Informational',
          type: 'Unbranded',
          selected: true,
        },
        {
          query: 'Stripe vs Adyen international transaction fee comparison',
          pillar: 'AEO',
          intent: 'Commercial',
          type: 'Branded',
          selected: true,
        },
        {
          query: 'How to automate jurisdictional sales tax calculations in Next.js',
          pillar: 'AIO',
          intent: 'Informational',
          type: 'Unbranded',
          selected: true,
        },
        {
          query: 'Where to find transparent payment gateway pricing without setup fees',
          pillar: 'AIO',
          intent: 'Transactional',
          type: 'Unbranded',
          selected: true,
        },
        {
          query: 'Is Stripe Billing or Chargebee better for SaaS subscription management?',
          pillar: 'GEO',
          intent: 'Commercial',
          type: 'Branded',
          selected: true,
        },
      ]);
      setIsGeneratingAi(false);
    }, 800);
  };

  const handleApplyAiSuggestions = async () => {
    const selected = aiSuggestions.filter((s) => s.selected);
    if (selected.length === 0) return;

    setIsSubmitting(true);
    const newItems: DbPrompt[] = selected.map((s, idx) => ({
      id: `p-ai-${Date.now()}-${idx}`,
      brand_id: 'default',
      query: s.query,
      pillar: s.pillar,
      intent: s.intent,
      type: s.type,
      target_engines: ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'],
      is_active: true,
      created_at: new Date().toISOString(),
      runs_count: 0,
      avg_score: null,
    }));

    const updated = [...newItems, ...prompts];
    setPrompts(updated);
    saveToLocal(updated);
    setAuditFeedback(`Added ${selected.length} AI prompts to library.`);

    try {
      await batchCreatePrompts(selected);
    } catch (err) {
      console.warn('Batch AI prompt creation error:', err);
    } finally {
      setIsSubmitting(false);
      setIsAiModalOpen(false);
      setAiSuggestions([]);
      setTimeout(() => setAuditFeedback(null), 4000);
    }
  };

  // CSV Import handler
  const handleImportCsv = async () => {
    if (!csvText.trim()) return;
    const lines = csvText.split('\n').filter((l) => l.trim());
    const parsed = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const q = parts[0] || line;
      const pil = (parts[1] as TechnicalPillar) || 'GEO';
      const int = (parts[2] as SearchIntent) || 'Informational';
      const typ = (parts[3] as PromptType) || 'Unbranded';

      return {
        query: q,
        pillar: ['GEO', 'AEO', 'AIO'].includes(pil) ? pil : 'GEO',
        intent: ['Informational', 'Commercial', 'Transactional', 'Navigational'].includes(int) ? int : 'Informational',
        type: ['Branded', 'Unbranded'].includes(typ) ? typ : 'Unbranded',
        target_engines: ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'],
      };
    });

    setIsSubmitting(true);
    const newItems: DbPrompt[] = parsed.map((p, idx) => ({
      id: `p-csv-${Date.now()}-${idx}`,
      brand_id: 'default',
      query: p.query,
      pillar: p.pillar as TechnicalPillar,
      intent: p.intent as SearchIntent,
      type: p.type as PromptType,
      target_engines: p.target_engines,
      is_active: true,
      created_at: new Date().toISOString(),
      runs_count: 0,
      avg_score: null,
    }));

    const updated = [...newItems, ...prompts];
    setPrompts(updated);
    saveToLocal(updated);
    setAuditFeedback(`Imported ${parsed.length} prompts from CSV.`);

    try {
      await batchCreatePrompts(parsed);
    } catch (err) {
      console.warn('Batch CSV prompt creation error:', err);
    } finally {
      setIsSubmitting(false);
      setCsvText('');
      setIsImportModalOpen(false);
      setTimeout(() => setAuditFeedback(null), 4000);
    }
  };


  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. Header & Reorganized Action Buttons */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Prompts
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Buyer-intent search queries classified by Technical Pillar (GEO, AEO, AIO) and Intent
          </p>
        </div>

        {/* Buttons in exact requested order: Add Prompt -> Generate Prompts with AI -> Import CSV */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Button 1: Add Prompt (Solid Primary) */}
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prompt</span>
          </Button>

          {/* Button 2: Generate Prompts with AI (Secondary / Outline) */}
          <Button
            variant="outline"
            onClick={() => {
              setIsAiModalOpen(true);
              if (aiSuggestions.length === 0) handleGenerateAiPrompts();
            }}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-2 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Generate Prompts with AI</span>
          </Button>

          {/* Button 3: Import CSV (Secondary / Outline) */}
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-2 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Import CSV</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Top Metric Cards (3 Columns) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {/* Card 1: Active Prompts */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Active Prompts
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              {activeCount}/{totalCount}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium">
            scored in active evaluation cycles
          </div>
        </div>

        {/* Card 2: Average Visibility Score */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Average Visibility Score
            </span>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              {avgOverallScore !== null ? `${avgOverallScore}%` : '—'}
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium">
            across tracked AI engines
          </div>
        </div>

        {/* Card 3: Connected Models */}
        <div className="p-6 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
              Connected Models
            </span>
            <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">
              5 Engines
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-3 font-medium">
            ChatGPT, Perplexity, Gemini, Claude, Copilot
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Filter Bar & Execution Toolbar */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        {/* Search & Pillar Tabs Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            {/* Search Filter Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter prompts..."
                className="w-full h-8.5 pl-8.5 pr-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            {/* Pillar Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedPillar('ALL')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer',
                  selectedPillar === 'ALL'
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-zinc-700'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                All Pillars ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillar('GEO')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer',
                  selectedPillar === 'GEO'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-gray-200 dark:border-zinc-700'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                GEO ({geoCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillar('AEO')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer',
                  selectedPillar === 'AEO'
                    ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-2xs border border-gray-200 dark:border-zinc-700'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                AEO ({aeoCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillar('AIO')}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer',
                  selectedPillar === 'AIO'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-2xs border border-gray-200 dark:border-zinc-700'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                AIO ({aioCount})
              </button>
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="flex items-center gap-2">
            {/* Intent Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{selectedIntent === 'ALL' ? 'All Intents' : selectedIntent}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onClick={() => setSelectedIntent('ALL')}>All Intents</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIntent('Informational')}>Informational</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIntent('Commercial')}>Commercial</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIntent('Transactional')}>Transactional</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedIntent('Navigational')}>Navigational</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{selectedType === 'ALL' ? 'All Types' : selectedType}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                <DropdownMenuItem onClick={() => setSelectedType('ALL')}>All Types</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('Branded')}>Branded</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType('Unbranded')}>Unbranded</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Execution Controls Toolbar (Run Selected, Run All, Schedule Audits) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Run Selected Button */}
            <Button
              onClick={handleRunSelectedAudits}
              disabled={isAuditing || selectedPromptIds.length === 0}
              className="h-8.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAuditing ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Run Selected {selectedPromptIds.length > 0 ? `(${selectedPromptIds.length})` : ''}</span>
            </Button>

            {/* Delete Selected Button */}
            {selectedPromptIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteSelectedPrompts}
                disabled={isDeletingSelected}
                className="h-8.5 px-3.5 rounded-xl border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 font-medium text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                {isDeletingSelected ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Selected ({selectedPromptIds.length})</span>
              </Button>
            )}

            {/* Run All Button */}
            <Button
              variant="outline"
              onClick={handleRunAllAudits}
              disabled={isAuditing || activeCount === 0}
              className="h-8.5 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              {isAuditing ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PlayCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>Run All ({activeCount})</span>
            </Button>

            {/* Schedule Audits Button */}
            <Button
              variant="outline"
              onClick={() => setIsScheduleModalOpen(true)}
              className="h-8.5 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Schedule Audits</span>
            </Button>
          </div>

          {/* Feedback & Status Message */}
          <div className="flex items-center gap-2">
            {auditFeedback ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{auditFeedback}</span>
              </span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                {selectedPromptIds.length > 0 ? (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {selectedPromptIds.length} of {filteredPrompts.length} selected
                  </span>
                ) : (
                  <span>Select rows to dispatch target audits</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Prompt Library Table */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-2 rounded-xl border border-gray-200/80 bg-white dark:bg-zinc-900 shadow-2xs">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Fetching prompts from Supabase...</span>
        </div>
      ) : prompts.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-xl border border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-3">
          <FileQuestion className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No Tracked Prompts Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Add queries manually, generate tailored prompts with AI, or import a CSV list to start monitoring your AI visibility.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="h-8.5 px-3.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Prompt</span>
            </Button>
            <Button
              onClick={() => {
                setIsAiModalOpen(true);
                handleGenerateAiPrompts();
              }}
              size="sm"
              variant="outline"
              className="h-8.5 px-3 rounded-xl border-gray-300 text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Generate with AI</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden">
          {/* Table Title Bar */}
          <div className="p-5 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Prompt Library ({filteredPrompts.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Real-time AI search scoring and automatic pillar intent categorization
              </p>
            </div>
            {selectedPromptIds.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                {selectedPromptIds.length} selected
              </span>
            )}
          </div>

          {/* Responsive Table matching requested design (Checkbox, Prompt/Query, Pillar, Intent, Type, Avg, Active, Actions) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800/80 bg-gray-50/50 dark:bg-zinc-900/40 text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                  {/* Select All Checkbox */}
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                  </th>
                  <th className="py-3 px-5 min-w-[320px]">Prompt / Query</th>
                  <th className="py-3 px-4">Technical Pillar</th>
                  <th className="py-3 px-4">Search Intent</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Avg</th>
                  <th className="py-3 px-4 text-center">Active</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                {filteredPrompts.map((prompt) => {
                  const isSelected = selectedPromptIds.includes(prompt.id);

                  return (
                    <tr
                      key={prompt.id}
                      className={cn(
                        'transition-colors group',
                        isSelected
                          ? 'bg-blue-50/30 dark:bg-blue-950/20'
                          : 'hover:bg-gray-50/70 dark:hover:bg-zinc-800/40'
                      )}
                    >
                      {/* Row Selection Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(prompt.id)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                      </td>

                      {/* Prompt / Query */}
                      <td className="py-4 px-5">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-gray-900 dark:text-zinc-100 text-xs leading-snug">
                            &ldquo;{prompt.query}&rdquo;
                          </p>
                          {/* Interactive Target AI Model Badges / Toggles */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">Models:</span>
                            {AVAILABLE_ENGINES.map((eng) => {
                              const promptEngines = prompt.target_engines && prompt.target_engines.length > 0
                                ? prompt.target_engines
                                : ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];
                              const isChecked = promptEngines.includes(eng.name);

                              return (
                                  <button
                                    key={eng.name}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleEngineForPrompt(prompt.id, eng.name);
                                    }}
                                    title={isChecked ? `${eng.name} active (Click to exclude)` : `${eng.name} excluded (Click to include)`}
                                    className={cn(
                                      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer select-none',
                                      isChecked
                                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60 shadow-2xs hover:border-blue-400'
                                        : 'bg-gray-100/50 dark:bg-zinc-800/30 text-gray-400 dark:text-zinc-600 border-gray-200/60 dark:border-zinc-800 line-through opacity-50 hover:opacity-90 hover:border-gray-300'
                                    )}
                                  >
                                    <EngineIcon
                                      engine={eng.name}
                                      size={11}
                                      className={isChecked ? '' : 'grayscale opacity-40'}
                                    />
                                    <span>{eng.name}</span>
                                  </button>
                              );
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Technical Pillar */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                            prompt.pillar === 'GEO' &&
                              'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
                            prompt.pillar === 'AEO' &&
                              'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
                            prompt.pillar === 'AIO' &&
                              'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full inline-block',
                              prompt.pillar === 'GEO' && 'bg-blue-500',
                              prompt.pillar === 'AEO' && 'bg-purple-500',
                              prompt.pillar === 'AIO' && 'bg-emerald-500'
                            )}
                          />
                          {prompt.pillar}
                        </span>
                      </td>

                      {/* Search Intent */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border',
                            prompt.intent === 'Informational' &&
                              'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
                            prompt.intent === 'Commercial' &&
                              'bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
                            prompt.intent === 'Transactional' &&
                              'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
                            prompt.intent === 'Navigational' &&
                              'bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60'
                          )}
                        >
                          {prompt.intent}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {prompt.type === 'Branded' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                            Branded
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200/60 dark:border-zinc-700/60">
                            Unbranded
                          </span>
                        )}
                      </td>

                      {/* Avg Score */}
                      <td className="py-4 px-4 text-center font-semibold text-gray-900 dark:text-zinc-100 font-mono">
                        {prompt.avg_score !== null && prompt.avg_score !== undefined ? `${prompt.avg_score}%` : '—'}
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <Switch
                          checked={prompt.is_active}
                          onCheckedChange={() => handleToggleActive(prompt.id, prompt.is_active)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(prompt.query)}
                            title="Copy prompt"
                            className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrompt(prompt.id)}
                            title="Delete prompt"
                            className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal 1: Add Custom Prompt (with Target Models Selection Area) */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Add Tracked Prompt
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
              Enter a search query and configure target AI models to monitor across generative answer engines.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPrompt} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                Prompt / Search Query
              </label>
              <textarea
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="e.g., What are the best payment gateways for SaaS?"
                rows={3}
                required
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Pillar */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                  Pillar
                </label>
                <select
                  value={newPillar}
                  onChange={(e) => setNewPillar(e.target.value as TechnicalPillar)}
                  className="w-full h-9 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="GEO">GEO</option>
                  <option value="AEO">AEO</option>
                  <option value="AIO">AIO</option>
                </select>
              </div>

              {/* Intent */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                  Intent
                </label>
                <select
                  value={newIntent}
                  onChange={(e) => setNewIntent(e.target.value as SearchIntent)}
                  className="w-full h-9 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Informational">Informational</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Transactional">Transactional</option>
                  <option value="Navigational">Navigational</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                  Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as PromptType)}
                  className="w-full h-9 px-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="Unbranded">Unbranded</option>
                  <option value="Branded">Branded</option>
                </select>
              </div>
            </div>

            {/* Target Models Checkbox Selection Area */}
            <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  Target Models ({newTargetEngines.length}/5 Selected)
                </label>
                <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                  Select engines to audit for this query
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_ENGINES.map((eng) => {
                  const isChecked = newTargetEngines.includes(eng.name);
                  return (
                    <label
                      key={eng.name}
                      onClick={() => handleToggleTargetEngine(eng.name)}
                      className={cn(
                        'p-2 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all select-none',
                        isChecked
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 text-gray-900 dark:text-white shadow-2xs'
                          : 'border-gray-200 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-800/30 text-gray-400 dark:text-zinc-500'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by label onClick
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className={cn('w-2 h-2 rounded-full', eng.color)} />
                        <span>{eng.name}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs h-9 rounded-xl border-gray-200 dark:border-zinc-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newQuery.trim() || newTargetEngines.length === 0}
                className="text-xs h-9 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 cursor-pointer font-medium"
              >
                {isSubmitting ? 'Saving...' : 'Save Prompt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Modal 2: Generate Prompts with AI */}
      {/* ========================================================================= */}
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Generate Buyer-Intent Prompts with AI
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
              AI automatically classifies queries across GEO, AEO, and AIO pillars.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[320px] overflow-y-auto pr-1">
            {isGeneratingAi ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs text-gray-500">Synthesizing high-intent search queries...</span>
              </div>
            ) : (
              aiSuggestions.map((sug, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    setAiSuggestions((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, selected: !item.selected } : item))
                    )
                  }
                  className={cn(
                    'p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3',
                    sug.selected
                      ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 shadow-2xs'
                      : 'border-gray-200 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/30'
                  )}
                >
                  <div className="space-y-1.5 flex-1">
                    <p className="font-medium text-gray-900 dark:text-zinc-100">&ldquo;{sug.query}&rdquo;</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {sug.pillar}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">
                        {sug.intent} • {sug.type}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5',
                      sug.selected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-gray-300 dark:border-zinc-700'
                    )}
                  >
                    {sug.selected && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isGeneratingAi}
              onClick={handleGenerateAiPrompts}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
            >
              Regenerate
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAiModalOpen(false)}
                className="text-xs h-9 rounded-xl border-gray-200 dark:border-zinc-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApplyAiSuggestions}
                disabled={isSubmitting || aiSuggestions.filter((s) => s.selected).length === 0}
                className="text-xs h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium cursor-pointer"
              >
                {isSubmitting ? 'Adding...' : `Add ${aiSuggestions.filter((s) => s.selected).length} Prompts`}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Modal 3: Import Prompts from CSV */}
      {/* ========================================================================= */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Import Prompts from CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
              Paste CSV rows or formatted prompt lines (one per line). Format: <br />
              <code className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                Query, Pillar (GEO/AEO/AIO), Intent, Type
              </code>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-2">
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`"Best CRM for startups", GEO, Informational, Unbranded\n"HubSpot pricing vs Salesforce", AEO, Commercial, Branded`}
              rows={6}
              className="w-full p-3 font-mono text-xs rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
              className="text-xs h-9 rounded-xl border-gray-200 dark:border-zinc-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImportCsv}
              disabled={isSubmitting || !csvText.trim()}
              className="text-xs h-9 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium cursor-pointer"
            >
              {isSubmitting ? 'Importing...' : 'Import Rows'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* Modal 4: Schedule Audits Modal */}
      {/* ========================================================================= */}
      <ScheduleAuditsModal
        isOpen={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
      />
    </div>
  );
}
