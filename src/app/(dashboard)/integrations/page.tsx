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
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface IntegrationItem {
  id: string;
  name: string;
  category: 'E-Commerce / CMS' | 'API & Webhooks' | 'Analytics & CRM';
  description: string;
  status: 'Connected' | 'Available' | 'Configuring';
  lastSynced?: string;
  iconBg: string;
  iconText: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'shopify',
    name: 'Shopify Store Catalog',
    category: 'E-Commerce / CMS',
    description: 'Auto-ingest product structured data, schema markup, and catalog changes into LLM knowledge graphs.',
    status: 'Connected',
    lastSynced: '12 mins ago',
    iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    iconText: 'SH',
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce Ingestion',
    category: 'E-Commerce / CMS',
    description: 'Sync WordPress product taxonomy, categories, and technical specs for answer engine grounding.',
    status: 'Available',
    iconBg: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    iconText: 'WC',
  },
  {
    id: 'webflow',
    name: 'Webflow CMS Collection',
    category: 'E-Commerce / CMS',
    description: 'Index blog posts, documentation collections, and case study rich snippets.',
    status: 'Connected',
    lastSynced: '1 hour ago',
    iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    iconText: 'WF',
  },
  {
    id: 'custom-webhook',
    name: 'Real-Time Ingestion Webhook',
    category: 'API & Webhooks',
    description: 'Push new articles, changelogs, and pricing updates directly to Beacon via HTTP POST.',
    status: 'Connected',
    lastSynced: 'Just now',
    iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    iconText: 'WH',
  },
  {
    id: 'github-docs',
    name: 'GitHub Markdown Docs Sync',
    category: 'Analytics & CRM',
    description: 'Sync developer API markdown reference files straight from your GitHub repository.',
    status: 'Available',
    iconBg: 'bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200',
    iconText: 'GH',
  },
];

export default function IntegrationsPage() {
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [copiedWebhook, setCopiedWebhook] = React.useState(false);
  const apiKey = 'bcn_live_9f82d1c4a03b57e9301e7b6d5f4a21';
  const webhookUrl = 'https://beacon-ruddy-alpha.vercel.app/api/ingest/webhook';

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Configuration
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Data Ingestion Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Integrations & Ingestion Webhooks
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Connect content repositories and e-commerce catalogs to keep AI models updated with accurate entity data.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-semibold">
            3 Active Connections
          </span>
        </div>
      </div>

      {/* API & Webhooks Credentials Card */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Direct Ingestion Credentials & Webhook Endpoint</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Authenticate programmatic API pushes and configure headless CMS webhooks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* API Key */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Live API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full h-8.5 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="h-8.5 px-3 text-xs rounded-lg gap-1.5 cursor-pointer shrink-0"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Ingestion Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full h-8.5 px-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none truncate"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyWebhook}
                className="h-8.5 px-3 text-xs rounded-lg gap-1.5 cursor-pointer shrink-0"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Catalog Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Available Platform Connectors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.id}
              className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={cn('w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center shadow-2xs font-mono', item.iconBg)}>
                    {item.iconText}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-mono',
                      item.status === 'Connected'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200/60'
                        : 'bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200'
                    )}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                {item.lastSynced ? (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Synced {item.lastSynced}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ready to configure
                  </span>
                )}

                <Button
                  size="sm"
                  variant={item.status === 'Connected' ? 'outline' : 'default'}
                  className={cn(
                    'h-8 px-3 text-xs rounded-lg font-semibold cursor-pointer',
                    item.status !== 'Connected' && 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  )}
                >
                  {item.status === 'Connected' ? 'Manage' : 'Connect'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
