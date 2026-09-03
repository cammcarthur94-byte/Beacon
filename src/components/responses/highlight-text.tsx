'use client';

import * as React from 'react';

interface HighlightTextProps {
  text: string;
  brandName: string;
  aliases?: string[];
  className?: string;
}

// Optimized with React.memo to prevent re-rendering when props remain unchanged.
export const HighlightText = React.memo(function HighlightText({
  text,
  brandName,
  aliases = [],
  className = '',
}: HighlightTextProps) {
  if (!text) return null;

  // Stable dependency key for aliases array to handle inline array props without cache misses
  const aliasesKey = aliases.length > 0 ? aliases.join('\0') : '';

  // Performance Optimization: Memoize term parsing, Set construction, and RegEx compilation.
  // Using a Set provides O(1) lookup during part evaluation instead of O(N*M) array scans.
  // Sorting terms by length descending ensures longer aliases (e.g. 'Stripe Docs') match before shorter prefixes ('Stripe').
  const { regex, searchSet } = React.useMemo(() => {
    const terms = [brandName, ...aliases]
      .map((term) => term.trim())
      .filter((term) => term.length > 0)
      .sort((a, b) => b.length - a.length);

    if (terms.length === 0) {
      return { regex: null, searchSet: new Set<string>() };
    }

    const set = new Set(terms.map((t) => t.toLowerCase()));
    const escapedTerms = terms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const re = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    return { regex: re, searchSet: set };
  }, [brandName, aliasesKey]);

  // Performance Optimization: Memoize string splitting and node mapping.
  // Avoids re-splitting strings and recreating React nodes on re-renders.
  const elements = React.useMemo(() => {
    if (!regex) {
      return text;
    }

    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isMatch = searchSet.has(part.toLowerCase());

      if (isMatch) {
        return (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-400/30 text-yellow-950 dark:text-yellow-100 font-semibold px-1 py-0.5 rounded border border-yellow-300/80 dark:border-yellow-500/40 shadow-2xs inline-block"
          >
            {part}
          </mark>
        );
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  }, [text, regex, searchSet]);

  return <span className={className}>{elements}</span>;
});
