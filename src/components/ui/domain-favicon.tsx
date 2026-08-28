'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainFaviconProps {
  domainOrUrl: string;
  className?: string;
  size?: number;
  fallbackInitial?: boolean;
}

export function extractDomain(input: string): string {
  if (!input) return '';
  try {
    let clean = input.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || input;
  }
}

export function DomainFavicon({
  domainOrUrl,
  className,
  size = 16,
  fallbackInitial = false,
}: DomainFaviconProps) {
  const [hasError, setHasError] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const domain = React.useMemo(() => extractDomain(domainOrUrl), [domainOrUrl]);

  // Reset error state if domain changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [domain]);

  if (!domain || hasError) {
    if (fallbackInitial && domain) {
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center font-bold uppercase rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 select-none text-[10px]',
            className
          )}
          style={{ width: size, height: size }}
        >
          {domain.charAt(0)}
        </span>
      );
    }
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500',
          className
        )}
        style={{ width: size, height: size }}
      >
        <Globe className="w-3/4 h-3/4" />
      </span>
    );
  }

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

  return (
    <span
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 rounded-md overflow-hidden bg-gray-50 dark:bg-zinc-800 border border-gray-200/60 dark:border-zinc-700/60 shadow-2xs',
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Fallback placeholder while loading */}
      {!isLoaded && (
        <span className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-[10px] font-bold text-gray-500 uppercase">
          {domain.charAt(0)}
        </span>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconUrl}
        alt={`${domain} icon`}
        width={size}
        height={size}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'w-full h-full object-contain transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </span>
  );
}
