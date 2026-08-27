'use client';

import * as React from 'react';
import { AIEngine, PromptQuery } from '@/types/geo';
import { AI_ENGINES } from '@/lib/constants';
import {
  getBrandKitData,
  saveBrandProfile,
  addPrompt,
  deletePrompt,
} from '@/lib/actions/brand-kit';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EngineBadge } from '@/components/engine-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
} from 'lucide-react';

interface CompetitorChip {
  id: string;
  name: string;
  domain: string;
}

export default function BrandKitPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isAddingPrompt, setIsAddingPrompt] = React.useState(false);
  const [deletingPromptId, setDeletingPromptId] = React.useState<string | null>(null);

  // Brand Profile State
  const [brandName, setBrandName] = React.useState('');
  const [brandDomain, setBrandDomain] = React.useState('');
  const [industry, setIndustry] = React.useState('B2B SaaS / Software');
  const [description, setDescription] = React.useState('');
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Competitors State
  const [competitors, setCompetitors] = React.useState<CompetitorChip[]>([]);
  const [newCompName, setNewCompName] = React.useState('');
  const [newCompDomain, setNewCompDomain] = React.useState('');

  // Tracked Prompts State
  const [prompts, setPrompts] = React.useState<PromptQuery[]>([]);
  const [newPromptText, setNewPromptText] = React.useState('');
  const [newPromptCategory, setNewPromptCategory] = React.useState('High-Intent Commercial');
  const [isAddPromptOpen, setIsAddPromptOpen] = React.useState(false);

  // Engine toggles state
  const [enabledEngines, setEnabledEngines] = React.useState<Record<AIEngine, boolean>>({
    chatgpt: true,
    claude: true,
    perplexity: true,
    gemini: true,
    copilot: true,
    google_aio: true,
  });

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBrandKitData();
      if (data.brand) {
        setBrandName(data.brand.name || '');
        setBrandDomain(data.brand.domain || '');
        setIndustry(data.brand.industry || 'B2B SaaS / Software');
        setDescription(data.brand.description || '');
        setCompetitors(data.brand.competitors || []);
      } else {
        // Initial defaults for empty onboarding state
        setBrandName('');
        setBrandDomain('');
        setIndustry('B2B SaaS / Software');
        setDescription('');
        setCompetitors([]);
      }
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error('Failed to load brand kit data:', err);
      setStatusMessage({ type: 'error', text: 'Failed to load brand configuration from database.' });
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

    const domain = newCompDomain.trim() || `${newCompName.toLowerCase().replace(/\s+/g, '')}.com`;
    setCompetitors([
      ...competitors,
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
    setCompetitors(competitors.filter((c) => c.id !== id));
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
      // Format competitors as tags e.g. "Name (domain.com)" or just "Name"
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
      setStatusMessage({ type: 'success', text: 'Brand kit configuration saved successfully.' });
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RotateCw className="w-6 h-6 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground">Loading brand configuration from Supabase...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Configuration</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Entity Mapping & Prompts</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Brand Kit & Target Queries</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Define your core brand identity, benchmark competitors, and natural language search prompts to evaluate.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {statusMessage && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <Button
            onClick={handleSaveBrandKit}
            disabled={isSaving}
            variant="glow"
            className="gap-2 text-xs font-semibold"
          >
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Changes Saved!</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Brand Profile & AI Engine Toggles */}
        <div className="space-y-6 lg:col-span-1">
          {/* Brand Identity Card */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Brand Identity</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Your primary entity indexed by AI search models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Brand Name *</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Cloud"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Primary Domain URL</label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    placeholder="acmesync.io"
                    className="h-8 text-xs pl-8 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Industry / Niche</label>
                <Input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="B2B SaaS / Data Infrastructure"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Core Value Proposition / Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background/50 p-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Summarize what your brand does so AI auditors evaluate entity contextual relevance..."
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Engine Auditor Preferences Card */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <CardTitle className="text-sm font-semibold">Active AI Engine Auditors</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Toggle models included in live and scheduled audits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(Object.keys(AI_ENGINES) as AIEngine[]).map((engineKey) => {
                const meta = AI_ENGINES[engineKey];
                const isEnabled = enabledEngines[engineKey];
                return (
                  <div
                    key={engineKey}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <EngineBadge engine={engineKey} size="sm" />
                      <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                        {meta.model}
                      </span>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        setEnabledEngines((prev) => ({ ...prev, [engineKey]: checked }))
                      }
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Competitor Tracker & Tracked Search Queries */}
        <div className="space-y-6 lg:col-span-2">
          {/* Competitors Management Card */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <CardTitle className="text-sm font-semibold">Benchmark Competitors</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {competitors.length} Monitored
                </Badge>
              </div>
              <CardDescription className="text-xs">
                AI engines will benchmark your brand citations directly against these rival domains
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Existing Competitors Chip List */}
              {competitors.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2">
                  No competitors added yet. Add rival brands below to monitor comparative share of voice.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {competitors.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/80 text-xs shadow-sm group hover:border-primary/40 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-semibold text-foreground">{comp.name}</span>
                      {comp.domain && (
                        <span className="font-mono text-[10px] text-muted-foreground">({comp.domain})</span>
                      )}
                      <button
                        onClick={() => handleRemoveCompetitor(comp.id)}
                        className="text-muted-foreground hover:text-rose-400 p-0.5 ml-1 transition-colors"
                        title="Remove competitor"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Competitor Inline Form */}
              <form onSubmit={handleAddCompetitor} className="pt-2 border-t border-border/50 flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Competitor brand (e.g. Fivetran)"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
                <Input
                  placeholder="Domain (e.g. fivetran.com)"
                  value={newCompDomain}
                  onChange={(e) => setNewCompDomain(e.target.value)}
                  className="h-8 text-xs font-mono flex-1"
                />
                <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1 shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add Competitor
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tracked Search Prompts / Queries Builder */}
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-400" />
                  <CardTitle className="text-sm font-semibold">Tracked Search Prompts & Queries</CardTitle>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  High-value generative search queries audited for brand presence and citations
                </CardDescription>
              </div>

              {/* Add Prompt Modal */}
              <Dialog open={isAddPromptOpen} onOpenChange={setIsAddPromptOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="glow" className="h-8 text-xs gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Add New Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Track New Generative Search Query</DialogTitle>
                    <DialogDescription className="text-xs">
                      Enter the natural language search prompt you want Beacon to test across all 5 AI engines.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Target Search Query / Prompt</label>
                      <Input
                        placeholder="e.g. Best real-time data integration tools for enterprise"
                        value={newPromptText}
                        onChange={(e) => setNewPromptText(e.target.value)}
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Query Category</label>
                      <select
                        value={newPromptCategory}
                        onChange={(e) => setNewPromptCategory(e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="High-Intent Commercial">High-Intent Commercial</option>
                        <option value="Competitor Displacement">Competitor Displacement</option>
                        <option value="Technical Discovery">Technical Discovery</option>
                        <option value="Product Comparison">Product Comparison</option>
                        <option value="Emerging AI Topics">Emerging AI Topics</option>
                      </select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" size="sm" onClick={() => setIsAddPromptOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="glow"
                      size="sm"
                      disabled={isAddingPrompt || !newPromptText.trim()}
                      onClick={handleAddPrompt}
                    >
                      {isAddingPrompt ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        'Save and Track Prompt'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-0">
              {prompts.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <Search className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                  <div className="text-xs font-medium text-foreground">No search prompts tracked yet</div>
                  <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                    Click &quot;Add New Prompt&quot; above to define queries you want audited across ChatGPT, Claude, Perplexity, Gemini, and Copilot.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">SEARCH PROMPT / QUERY</TableHead>
                      <TableHead>CATEGORY</TableHead>
                      <TableHead className="text-center">PRIORITY</TableHead>
                      <TableHead className="text-right">VISIBILITY</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prompts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-xs text-foreground">&quot;{p.query}&quot;</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Audited: {p.lastAudited}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {p.category}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          {p.priority === 'high' ? (
                            <Badge variant="destructive" className="text-[10px]">High</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Medium</Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-xs">
                          {p.visibilityScore > 0 ? (
                            <span className={p.visibilityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                              {p.visibilityScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-normal text-[10px]">Pending</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <button
                            disabled={deletingPromptId === p.id}
                            onClick={() => handleDeletePrompt(p.id)}
                            className="text-muted-foreground hover:text-rose-400 p-1 transition-colors disabled:opacity-50"
                            title="Delete prompt"
                          >
                            {deletingPromptId === p.id ? (
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
