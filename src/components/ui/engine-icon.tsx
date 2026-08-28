'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type SupportedEngine =
  | 'chatgpt'
  | 'ChatGPT'
  | 'perplexity'
  | 'Perplexity'
  | 'gemini'
  | 'Gemini'
  | 'claude'
  | 'Claude'
  | 'copilot'
  | 'Copilot'
  | 'google_aio'
  | 'Google AIO';

interface EngineIconProps {
  engine: SupportedEngine | string;
  className?: string;
  size?: number;
}

export function EngineIcon({ engine, className, size = 16 }: EngineIconProps) {
  const norm = (engine || '').toLowerCase();

  // ChatGPT / OpenAI Icon
  if (norm.includes('chatgpt') || norm.includes('openai') || norm.includes('gpt')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-emerald-600 dark:text-emerald-400 shrink-0', className)}
      >
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l2.46-1.42 2.459 1.42v2.84l-2.459 1.42-2.46-1.42z" />
      </svg>
    );
  }

  // Perplexity Icon
  if (norm.includes('perplexity') || norm.includes('sonar')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-cyan-600 dark:text-cyan-400 shrink-0', className)}
      >
        <path d="M12 2L9.5 7.5H4L8.5 12L6 17.5L12 14.5L18 17.5L15.5 12L20 7.5H14.5L12 2ZM12 5.8L13.3 8.7H16.8L13.8 11.2L15.2 14.6L12 13L8.8 14.6L10.2 11.2L7.2 8.7H10.7L12 5.8Z" />
      </svg>
    );
  }

  // Gemini Icon (Google 4-point Spark)
  if (norm.includes('gemini') || norm.includes('google')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-blue-600 dark:text-blue-400 shrink-0', className)}
      >
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    );
  }

  // Claude Icon (Anthropic Sparkle Sunburst)
  if (norm.includes('claude') || norm.includes('anthropic')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-amber-600 dark:text-amber-400 shrink-0', className)}
      >
        <path d="M4.5 12a7.5 7.5 0 0 0 15 0 7.5 7.5 0 0 0-15 0Zm7.5-6.5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm0 11a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm6.5-5.5a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1ZM8.5 12a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Z" />
      </svg>
    );
  }

  // Copilot Icon (Microsoft Copilot ribbon)
  if (norm.includes('copilot') || norm.includes('bing') || norm.includes('microsoft')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cn('text-purple-600 dark:text-purple-400 shrink-0', className)}
      >
        <path d="M12 2a10 10 0 0 0-7.07 17.07A10 10 0 1 0 19.07 4.93 9.93 9.93 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8zm3.5-9a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5zm-7 0A1.5 1.5 0 1 1 7 9.5 1.5 1.5 0 0 1 8.5 11zm3.5 5.5a4.5 4.5 0 0 1-4.04-2.5 1 1 0 1 1 1.78-.9 2.5 2.5 0 0 0 4.52 0 1 1 0 0 1 1.78.9A4.5 4.5 0 0 1 12 16.5z" />
      </svg>
    );
  }

  // Default Fallback
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('text-gray-500 shrink-0', className)}
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
