import * as React from 'react';
import { AIEngine } from '@/types/geo';
import { AI_ENGINES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';

interface EngineBadgeProps {
  engine: AIEngine;
  showModel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EngineBadge({ engine, showModel = false, size = 'sm', className }: EngineBadgeProps) {
  const meta = AI_ENGINES[engine];
  if (!meta) return null;

  const iconPx = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  const getBadgeColors = () => {
    switch (engine) {
      case 'perplexity':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60';
      case 'chatgpt':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
      case 'claude':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
      case 'gemini':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60';
      case 'copilot':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60';
      case 'google_aio':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-semibold transition-colors shadow-2xs select-none',
        size === 'sm' && 'px-2 py-0.5 text-[11px]',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
        getBadgeColors(),
        className
      )}
    >
      <EngineIcon engine={engine} size={iconPx} />
      <span>{meta.name}</span>
      {showModel && <span className="opacity-60 text-[10px] font-mono">({meta.model})</span>}
    </span>
  );
}
