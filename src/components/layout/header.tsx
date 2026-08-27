'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  Play,
  RotateCw,
  Calendar,
  Database,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = 'Overview & AI Visibility',
  subtitle = 'Monitor generative search citations across ChatGPT, Claude, Perplexity, Gemini, and Copilot',
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [dateRange, setDateRange] = React.useState('Last 30 Days');
  const [isAuditing, setIsAuditing] = React.useState(false);
  const [auditSuccess, setAuditSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleTriggerAudit = async () => {
    setIsAuditing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/audit/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete audit run');
      }

      setAuditSuccess(true);
      router.refresh();
      // Notify components listening for live audit completion
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('beacon:auditCompleted', { detail: data }));
      }

      setTimeout(() => {
        setAuditSuccess(false);
      }, 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Audit trigger failed';
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <header className="h-16 border-b border-border/80 bg-background/70 backdrop-blur-xl sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Title / Breadcrumb context */}
      <div className="flex flex-col">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-[11px] text-muted-foreground hidden sm:block">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Error notification if audit fails */}
        {errorMessage && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="truncate max-w-[220px]" title={errorMessage}>
              {errorMessage}
            </span>
          </div>
        )}

        {/* Supabase connection indicator pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Database className="w-3 h-3" />
          <span>Supabase Synced</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Date Range Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{dateRange}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDateRange('Last 7 Days')} className="text-xs cursor-pointer">
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 30 Days')} className="text-xs cursor-pointer">
              Last 30 Days (Default)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 90 Days')} className="text-xs cursor-pointer">
              Last 90 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Year to Date')} className="text-xs cursor-pointer">
              Year to Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Trigger Instant Audit Button */}
        <Button
          size="sm"
          variant="glow"
          disabled={isAuditing}
          onClick={handleTriggerAudit}
          className="h-8 gap-1.5 text-xs font-semibold shadow-md relative overflow-hidden"
        >
          {isAuditing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing Engines...</span>
            </>
          ) : auditSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Audit Completed!</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Audit Now</span>
            </>
          )}
        </Button>

        {/* Theme Toggle Button */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </Button>
        )}
      </div>
    </header>
  );
}
