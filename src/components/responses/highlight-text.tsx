'use client';

import * as React from 'react';

interface HighlightTextProps {
  text: string;
  brandName: string;
  aliases?: string[];
  className?: string;
}

// Wrapped in React.memo to prevent unnecessary re-renders when parent components update unrelated state
export const HighlightText = React.memo(function HighlightText({
  text = '',
  brandName,
  aliases = [],
  className = '',
}: HighlightTextProps) {
  // Stable stringified representation of aliases to prevent re-compiling regex on new array references
  const aliasesKey = aliases.join('\0');

  // Performance Optimization:
  // Memoize search terms processing, compiled RegExp, and Set of lowercased terms.
  // Using a Set reduces match lookups in the render loop from O(N * K) array scans to O(1) Set operations.
  const { searchTermsSet, regex } = React.useMemo(() => {
    const terms = [brandName, ...aliases]
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    if (terms.length === 0) {
      return { searchTermsSet: new Set<string>(), regex: null };
    }

    const set = new Set(terms.map((term) => term.toLowerCase()));
    const escapedTerms = terms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const compiledRegex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    return { searchTermsSet: set, regex: compiledRegex };
  }, [brandName, aliasesKey]);

  // Performance Optimization:
  // Memoize text splitting so large LLM transcripts are only split when text or regex changes.
  const parts = React.useMemo(() => {
    if (!text || !regex) return [text || ''];
    return text.split(regex);
  }, [text, regex]);

  if (!text) return null;

  if (searchTermsSet.size === 0 || !regex) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // O(1) Set lookup replacing O(K) array traversal with repeated .toLowerCase() calls
        const isMatch = searchTermsSet.has(part.toLowerCase());

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
      })}
    </span>
  );
});
