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
  aliases = [],
  className = '',
}: HighlightTextProps) {
  if (!text) return null;

  // Memoize search terms and RegExp compilation across re-renders for large text blocks
  const aliasesKey = aliases.join('\0');
  const { searchTerms, regex } = React.useMemo(() => {
    const terms = [brandName, ...aliases]
      .map((term) => term.trim())
      .filter((term) => term.length > 0);

    if (terms.length === 0) {
      return { searchTerms: [], regex: null };
    }

    // Escape special regex characters
    const escapedTerms = terms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    const reg = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    return { searchTerms: terms, regex: reg };
  }, [brandName, aliasesKey]);

  // Memoize string splitting and rendered output calculation
  const renderedContent = React.useMemo(() => {
    if (!regex || searchTerms.length === 0) {
      return text;
    }

    // Convert search terms to lowercase set for fast O(1) match lookups
    const termSet = new Set(searchTerms.map((t) => t.toLowerCase()));
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const isMatch = termSet.has(part.toLowerCase());

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
  }, [text, regex, searchTerms]);

  return <span className={className}>{renderedContent}</span>;
});
