'use client';

import * as React from 'react';
import {
  Puzzle,
  Globe,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RotateCw,
  Plus,
  Trash2,
  KeyRound,
  Webhook,
  Database,
  Layers,
  Sparkles,
  RefreshCw,
  Shield,
  Activity,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ConnectorItem {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Connected' | 'Available' | 'Configuring';
  lastSynced?: string;
  iconBg: string;
  iconText: string;
  autoSync: boolean;
}

interface IngestionEvent {
  id: string;
  event: string;
  source: string;
  status: 'Success' | 'Processing' | 'Failed';
  timestamp: string;
  recordsCount: number;
}

const ECOMMERCE_CONNECTORS: ConnectorItem[] = [
  {
    id: 'shopify',
    name: 'Shopify Store Catalog',
    category: 'E-Commerce',
    description: 'Auto-ingest product structured data, JSON-LD schema, and catalog inventory into LLM knowledge graphs.',
    status: 'Connected',
    lastSynced: '12 mins ago',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    iconText: 'SH',
    autoSync: true,
  },
  {
    id: 'webflow',
    name: 'Webflow CMS Collections',
    category: 'CMS',
    description: 'Index blog articles, customer case studies, and feature documentation rich snippets.',
    status: 'Connected',
    lastSynced: '1 hour ago',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    iconText: 'WF',
    autoSync: true,
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce Store',
    category: 'E-Commerce',
    description: 'Sync WordPress product taxonomy, categories, and technical specs for answer engine grounding.',
    status: 'Available',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    iconText: 'WC',
    autoSync: false,
  },
];

const CONTENT_REPOSITORIES: ConnectorItem[] = [
  {
    id: 'github-docs',
    name: 'GitHub Markdown Repository',
    category: 'Docs',
    description: 'Directly ingest API markdown references and developer documentation from your Git branches.',
    status: 'Connected',
    lastSynced: '24 mins ago',
    iconBg: 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200',
    iconText: 'GH',
    autoSync: true,
  },
  {
    id: 'notion-kb',
    name: 'Notion Knowledge Base',
    category: 'Knowledge',
    description: 'Synchronize public help center pages and product release roadmaps.',
    status: 'Available',
    iconBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    iconText: 'NT',
    autoSync: false,
  },
  {
    id: 'zendesk-guide',
    name: 'Zendesk Help Center',
    category: 'Support Docs',
    description: 'Index customer FAQ articles and troubleshooting guides for LLM question-answering citations.',
    status: 'Available',
    iconBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    iconText: 'ZD',
    autoSync: false,
  },
];

const RECENT_EVENTS: IngestionEvent[] = [
  {
    id: 'evt-1',
    event: 'catalog.products.reindexed',
    source: 'Shopify Store Catalog',
    status: 'Success',
    timestamp: '12m ago',
    recordsCount: 142,
  },
  {
    id: 'evt-2',
    event: 'docs.markdown.synced',
    source: 'GitHub Repository',
    status: 'Success',
    timestamp: '24m ago',
    recordsCount: 38,
  },
  {
    id: 'evt-3',
    event: 'cms.collection.updated',
    source: 'Webflow CMS',
    status: 'Success',
    timestamp: '1h ago',
    recordsCount: 19,
  },
];

export default function IntegrationsPage() {
  const [apiKey, setApiKey] = React.useState('bcn_live_9f82d1c4a03b57e9301e7b6d5f4a21');
  const [webhookUrl] = React.useState('https://beacon-ruddy-alpha.vercel.app/api/ingest/webhook');
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const [isRotating, setIsRotating] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPinging, setIsPinging] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [statusFeedback, setStatusFeedback] = React.useState<string | null>(null);

  const [ecommerceList, setEcommerceList] = React.useState<ConnectorItem[]>(ECOMMERCE_CONNECTORS);
  const [contentList, setContentList] = React.useState<ConnectorItem[]>(CONTENT_REPOSITORIES);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleRotateApiKey = () => {
    setIsRotating(true);
    setTimeout(() => {
      const newKey = `bcn_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKey(newKey);
      setIsRotating(false);
      setStatusFeedback('New API key generated successfully.');
      setTimeout(() => setStatusFeedback(null), 3500);
    }, 600);
  };

  const handleToggleEcommerceSync = (id: string, current: boolean) => {
    setEcommerceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, autoSync: !current } : item))
    );
  };

  const handleToggleContentSync = (id: string, current: boolean) => {
    setContentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, autoSync: !current } : item))
    );
  };

  const handleTestWebhookPing = async () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setStatusFeedback('Webhook endpoint responded with HTTP 200 OK (38ms latency).');
      setTimeout(() => setStatusFeedback(null), 4000);
    }, 800);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setStatusFeedback('Integration settings saved successfully.');
      setTimeout(() => {
        setSavedSuccess(false);
        setStatusFeedback(null);
      }, 4000);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-32">
      
      {/* ========================================================================= */}
      {/* 1. Clean Header (Title & Breadcrumbs Only) */}
      {/* ========================================================================= */}
      <div className="space-y-1 pb-6 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Configuration
          </span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Platform Integrations
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Integrations & Ingestion Hub
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Connect your content repositories, e-commerce stores, and webhook streams to ground generative AI citations.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. Split-Row Section 1: API & Direct Webhook Credentials */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              API & Webhook Credentials
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Authenticate programmatic ingestion requests and configure headless CMS webhooks to push new product catalogs and articles in real time.
          </p>
        </div>

        {/* Right Column (2/3 width): Credentials Card */}
        <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-5">
          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Production API Secret Key
              </label>
              <button
                type="button"
                onClick={handleRotateApiKey}
                disabled={isRotating}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={cn('w-3 h-3', isRotating && 'animate-spin')} />
                <span>Rotate Secret</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="h-9 px-3 text-xs rounded-lg gap-1.5 cursor-pointer shrink-0 border-slate-200 dark:border-zinc-800"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Pass this key in the <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">Authorization: Bearer</code> header for ingest requests.
            </p>
          </div>

          {/* Webhook Endpoint */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Real-Time Ingestion Webhook URL
              </label>
              <button
                type="button"
                onClick={handleTestWebhookPing}
                disabled={isPinging}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Send className={cn('w-3 h-3', isPinging && 'animate-pulse')} />
                <span>Test Webhook Ping</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/60 text-slate-900 dark:text-zinc-100 focus:outline-none truncate"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyWebhook}
                className="h-9 px-3 text-xs rounded-lg gap-1.5 cursor-pointer shrink-0 border-slate-200 dark:border-zinc-800"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">
              Configure your CMS or e-commerce webhooks to send <code className="bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">POST</code> payloads to this endpoint on content publish.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. Split-Row Section 2: E-Commerce & CMS Sync */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Puzzle className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              E-Commerce & CMS Sync
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Automatically ingest product schemas, category taxonomies, and blog article rich snippets directly from your storefront and content management platforms.
          </p>
        </div>

        {/* Right Column (2/3 width): Connectors List Card */}
        <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-3">
          {ecommerceList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700 transition-all gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 font-mono shadow-2xs', item.iconBg)}>
                  {item.iconText}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border font-mono',
                        item.status === 'Connected'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200'
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.status === 'Connected' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      Auto-sync
                    </span>
                    <Switch
                      checked={item.autoSync}
                      onCheckedChange={() => handleToggleEcommerceSync(item.id, item.autoSync)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. Split-Row Section 3: Content Repositories & Docs */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Content & Docs Repositories
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Synchronize technical markdown files, GitHub docs, Notion knowledge bases, and customer support guides for precise answer engine citations.
          </p>
        </div>

        {/* Right Column (2/3 width): Content Repositories Card */}
        <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-3">
          {contentList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-800/30 hover:border-slate-300 dark:hover:border-zinc-700 transition-all gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn('w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 font-mono shadow-2xs', item.iconBg)}>
                  {item.iconText}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <span
                      className={cn(
                        'text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border font-mono',
                        item.status === 'Connected'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200'
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.status === 'Connected' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      Auto-sync
                    </span>
                    <Switch
                      checked={item.autoSync}
                      onCheckedChange={() => handleToggleContentSync(item.id, item.autoSync)}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. Split-Row Section 4: Webhook Ingestion Activity Log */}
      {/* ========================================================================= */}
      <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start pt-6 border-t border-slate-200/80 dark:border-zinc-800">
        {/* Left Column (1/3 width): Section Title & Context */}
        <div className="md:w-1/3 space-y-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ingestion Event Stream
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Live audit log of structured data sync events, catalog updates, and schema refresh webhooks processed by Beacon.
          </p>
        </div>

        {/* Right Column (2/3 width): Activity Log Table Card */}
        <div className="md:w-2/3 w-full border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-3">
          <div className="space-y-2">
            {RECENT_EVENTS.map((evt) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-800/20 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-mono font-semibold text-slate-900 dark:text-white text-[11px]">
                    {evt.event}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Source: <strong className="text-slate-600 dark:text-zinc-300">{evt.source}</strong> ({evt.recordsCount} entities processed)
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{evt.status}</span>
                  </span>
                  <span className="text-slate-400">{evt.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. Sticky Bottom Action Bar */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-white/95 dark:bg-zinc-950/95 border-t border-slate-200/90 dark:border-zinc-800 py-3.5 px-4 sm:px-8 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            {statusFeedback ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{statusFeedback}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>3 platform connectors active • Catalog synced 12m ago</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Integration Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
