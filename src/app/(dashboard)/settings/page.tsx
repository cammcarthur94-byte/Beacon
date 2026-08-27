'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [workspaceName, setWorkspaceName] = React.useState('Beacon Workspace');
  const [adminEmail, setAdminEmail] = React.useState('cammcarthur94@gmail.com');
  const [customDomain, setCustomDomain] = React.useState('');
  const [domainsList, setDomainsList] = React.useState([
    { domain: 'analytics.beacon-geo.com', status: 'verified', added: '2w ago' },
    { domain: 'reports.clientbrand.com', status: 'pending', added: '2d ago' },
  ]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('bcn_live_8f3a9e1029c4819d7b5e');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;
    setDomainsList((prev) => [
      { domain: customDomain.trim().toLowerCase(), status: 'pending', added: 'Just now' },
      ...prev,
    ]);
    setCustomDomain('');
  };

  const handleDeleteDomain = (domain: string) => {
    setDomainsList((prev) => prev.filter((d) => d.domain !== domain));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800/80 pb-5">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Workspace Settings
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Manage your workspace details, custom domains, team notifications, and API preferences.
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="h-9 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shadow-2xs self-start sm:self-auto transition-all"
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

      <div className="space-y-5">
        {/* 1. General Workspace Profile */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Workspace Profile
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Primary organization branding and notification dispatch address
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                Admin Notification Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* 2. Custom Domains */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Custom Domains & White-Labeling
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Host client-facing GEO audit dashboards under your own brand CNAME
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Pro Feature
            </span>
          </div>

          <form onSubmit={handleAddDomain} className="flex items-center gap-2.5 pt-1">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="e.g., reports.yourdomain.com"
              className="flex-1 h-9 px-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
            <Button
              type="submit"
              disabled={!customDomain.trim()}
              className="h-9 px-3.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs flex items-center gap-1.5 shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Domain</span>
            </Button>
          </form>

          <div className="divide-y divide-gray-100 dark:divide-zinc-800/60 pt-1">
            {domainsList.map((item) => (
              <div
                key={item.domain}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-gray-900 dark:text-zinc-100">
                    {item.domain}
                  </span>
                  {item.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      DNS Pending
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400">Added {item.added}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteDomain(item.domain)}
                  title="Remove domain"
                  className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Alerts & Automated Notifications */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Alerts & Automated Digests
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Configure instant triggers for competitor displacements and daily audit digests
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                  Daily Audit Email Digest
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Send 24h summary report with delta changes to {adminEmail}
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                  Competitor Displacement Alert
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Trigger instant notification when a competitor overtakes #1 citation ranking
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                  Weekly GEO Executive Summary
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Weekly PDF report formatted for stakeholder reviews
                </div>
              </div>
              <Switch className="data-[state=checked]:bg-blue-600" />
            </div>
          </div>
        </div>

        {/* 4. Public API & Webhook Access */}
        <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                Developer API Access
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Use your API token to programmatically trigger audits and fetch citation records
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-medium text-gray-700 dark:text-zinc-300">
              Live API Key
            </label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value="bcn_live_8f3a9e1029c4819d7b5e"
                readOnly
                className="flex-1 h-9 px-3 font-mono rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 text-xs text-gray-900 dark:text-zinc-100 shadow-2xs select-all"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyApiKey}
                className="h-9 px-3 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-300 font-medium flex items-center gap-1.5 shadow-2xs hover:bg-gray-50"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-gray-400">
              Never share your API token in public repositories or client-side code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
