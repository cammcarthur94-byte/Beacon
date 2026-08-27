'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Database,
  Clock,
  Key,
  Bell,
  CheckCircle2,
  Lock,
  ExternalLink,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">System</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Integrations & Cron</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage Supabase credentials, Vercel Cron scheduling, and AI engine model API integrations.
          </p>
        </div>

        <Button onClick={handleSave} variant="glow" className="gap-2 text-xs font-semibold self-start sm:self-auto">
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Supabase Integration Card */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Supabase Database & Auth</CardTitle>
                  <CardDescription className="text-xs">
                    PostgreSQL storage for Brands, Prompts, Audit Runs, and Citations
                  </CardDescription>
                </div>
              </div>
              <Badge variant="success" className="text-[11px] gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">NEXT_PUBLIC_SUPABASE_URL</label>
                <Input
                  defaultValue="https://xyz-project.supabase.co"
                  className="h-8 text-xs font-mono"
                  readOnly
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <div className="relative">
                  <Input
                    type="password"
                    defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_supabase_token"
                    className="h-8 text-xs font-mono pr-8"
                    readOnly
                  />
                  <Lock className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground font-medium">
                  Database Tables: <code className="text-foreground">brands</code>, <code className="text-foreground">prompts</code>, <code className="text-foreground">runs</code>, <code className="text-foreground">citations</code>
                </span>
              </div>
              <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 text-[11px]">
                Supabase Dashboard <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vercel Cron Scheduling Card */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Vercel Cron Background Auditor</CardTitle>
                  <CardDescription className="text-xs">
                    Automated background execution runner for multi-engine GEO audits
                  </CardDescription>
                </div>
              </div>
              <Badge variant="cyan" className="text-[11px]">
                Cron Enabled
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Schedule (Cron Syntax)</label>
                <Input defaultValue="0 0 * * *" className="h-8 text-xs font-mono" />
                <span className="text-[10px] text-muted-foreground">Every day at 00:00 UTC</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Endpoint Path</label>
                <Input defaultValue="/api/cron/audit-engines" className="h-8 text-xs font-mono" readOnly />
                <span className="text-[10px] text-muted-foreground">Secured with CRON_SECRET</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Timeout Ceiling</label>
                <Input defaultValue="300 seconds (5m)" className="h-8 text-xs font-mono" readOnly />
                <span className="text-[10px] text-muted-foreground">Vercel Pro Serverless max</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Engine API Keys Configuration */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">AI Search Engine API Keys</CardTitle>
                <CardDescription className="text-xs">
                  Direct API integrations used to execute prompt audits and retrieve citations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">OpenAI API Key (ChatGPT 4o)</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● Active</span>
                </div>
                <Input type="password" defaultValue="sk-proj-mock-openai-key-sample" className="h-8 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Anthropic API Key (Claude 3.5)</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● Active</span>
                </div>
                <Input type="password" defaultValue="sk-ant-mock-anthropic-key-sample" className="h-8 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Perplexity API Key (Sonar)</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● Active</span>
                </div>
                <Input type="password" defaultValue="pplx-mock-perplexity-key-sample" className="h-8 text-xs font-mono" />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-foreground">Google Gemini API Key</span>
                  <span className="text-emerald-400 font-mono text-[10px]">● Active</span>
                </div>
                <Input type="password" defaultValue="AIzaSyMock-gemini-key-sample" className="h-8 text-xs font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Digest */}
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Alerts & Notifications</CardTitle>
                <CardDescription className="text-xs">
                  Receive instant alerts when competitors displace your citations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div>
                <div className="text-xs font-semibold text-foreground">Daily Audit Email Digest</div>
                <div className="text-[11px] text-muted-foreground">Send 30-day delta summary report to alex@acmesync.io</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div>
                <div className="text-xs font-semibold text-foreground">Citation Drop Alert</div>
                <div className="text-[11px] text-muted-foreground">Notify immediately if primary rank #1 is lost on any tracked query</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
