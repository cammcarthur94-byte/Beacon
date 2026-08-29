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
import { useFilterContext } from '@/context/filter-context';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  brandName?: string;
  domain?: string;
}

export function Header({
  title = 'Overview & AI Visibility',
  subtitle = 'Monitor generative search citations across active AI models',
  brandName,
  domain,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const { dateRange, setDateRange } = useFilterContext();
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
    <header className="h-16 border-b border-gray-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4 print:hidden">
      {/* Title & Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-bold tracking-tight text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {domain && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <span>{domain}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
            <span className="truncate">{subtitle}</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Error notification if audit fails */}
        {errorMessage && (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]" title={errorMessage}>
              {errorMessage}
            </span>
          </div>
        )}

        {/* Date Range Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">{dateRange}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 text-xs">
            <DropdownMenuItem onClick={() => setDateRange('Last 7 Days')} className="cursor-pointer">
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 30 Days')} className="cursor-pointer font-medium">
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Last 90 Days')} className="cursor-pointer">
              Last 90 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDateRange('Year to Date')} className="cursor-pointer">
              Year to Date
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Run Audit Button */}
        <Button
          size="sm"
          disabled={isAuditing}
          onClick={handleTriggerAudit}
          className="h-8 gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-xs cursor-pointer"
        >
          {isAuditing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Auditing...</span>
            </>
          ) : auditSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span className="hidden sm:inline">Completed!</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run Audit</span>
            </>
          )}
        </Button>

        {/* Theme Toggle Button */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-8 h-8 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </header>
  );
}
