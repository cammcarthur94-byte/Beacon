'use client';

import * as React from 'react';

interface HighlightTextProps {
  text: string;
  brandName: string;
  aliases?: string[];
  className?: string;
}

export function HighlightText({
  text,
  brandName,
  aliases = [],
  className = '',
}: HighlightTextProps) {
  if (!text) return null;

  const searchTerms = [brandName, ...aliases]
    .map((term) => term.trim())
    .filter((term) => term.length > 0);

  if (searchTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedTerms = searchTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = searchTerms.some(
          (term) => term.toLowerCase() === part.toLowerCase()
        );

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
}
