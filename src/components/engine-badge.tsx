import * as React from 'react';
import { AIEngine } from '@/types/geo';
import { AI_ENGINES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Bot, Sparkles, Search, Zap, Compass, Globe } from 'lucide-react';

interface EngineBadgeProps {
  engine: AIEngine;
  showModel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EngineBadge({ engine, showModel = false, size = 'sm', className }: EngineBadgeProps) {
  const meta = AI_ENGINES[engine];
  if (!meta) return null;

  const renderIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    switch (engine) {
      case 'perplexity':
        return <Search className={iconSize} />;
      case 'chatgpt':
        return <Bot className={iconSize} />;
      case 'claude':
        return <Sparkles className={iconSize} />;
      case 'gemini':
        return <Zap className={iconSize} />;
      case 'copilot':
        return <Compass className={iconSize} />;
      case 'google_aio':
        return <Globe className={iconSize} />;
    }
  };

  const getBadgeColors = () => {
    switch (engine) {
      case 'perplexity':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20';
      case 'chatgpt':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';
      case 'claude':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20';
      case 'gemini':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20';
      case 'copilot':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20';
      case 'google_aio':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-xs',
        size === 'lg' && 'px-3 py-1.5 text-sm',
        getBadgeColors(),
        className
      )}
    >
      {renderIcon()}
      <span>{meta.name}</span>
      {showModel && <span className="opacity-60 text-[10px]">({meta.model})</span>}
    </span>
  );
}
