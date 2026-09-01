'use client';

import * as React from 'react';

interface HighlightTextProps {
  text: string;
  brandName: string;
  aliases?: string[];
  className?: string;
}

export const HighlightText = React.memo(function HighlightText({
  text,
  brandName,
  aliases,
  className = '',
}: HighlightTextProps) {
  // Stabilize aliases key to prevent default array reference instability from re-triggering useMemo
  const aliasKey = aliases ? aliases.join('\0') : '';

  // Hooks must be called unconditionally at top level before early returns
  const { searchTermsSet, regex } = React.useMemo(() => {
    const aliasList = aliasKey ? aliasKey.split('\0') : [];
    const terms = [brandName, ...aliasList]
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    if (terms.length === 0) {
      return { searchTermsSet: new Set<string>(), regex: null };
    }

    const set = new Set(terms.map((term) => term.toLowerCase()));
    const escapedTerms = terms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    return {
      searchTermsSet: set,
      regex: new RegExp(`(${escapedTerms.join('|')})`, 'gi'),
    };
  }, [brandName, aliasKey]);

  if (!text) return null;

  if (!regex || searchTermsSet.size === 0) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Fast O(1) Set lookup instead of O(N) array search
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
