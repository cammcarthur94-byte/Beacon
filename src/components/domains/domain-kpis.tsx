'use client';

import * as React from 'react';
import {
  Globe,
  Quote,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DomainKpiMetrics } from '@/types/domains';

interface DomainKpisProps {
  metrics: DomainKpiMetrics;
}

export function DomainKpis({ metrics }: DomainKpisProps) {
  const cards = [
    {
      title: 'Total Domains',
      value: metrics.totalDomains.toLocaleString(),
      mom: metrics.totalDomainsMom,
      description: 'Unique referring domains cited by LLMs',
      icon: Globe,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      title: 'Total Citations',
      value: metrics.totalCitations.toLocaleString(),
      mom: metrics.totalCitationsMom,
      description: 'Aggregate AI answer citations across models',
      icon: Quote,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      title: 'Avg Domain Authority',
      value: `DA ${metrics.avgDomainAuthority}`,
      mom: metrics.avgDomainAuthorityMom,
      description: 'Weighted authority score across sources',
      icon: ShieldCheck,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    },
    {
      title: 'New This Month',
      value: `+${metrics.newThisMonth}`,
      mom: metrics.newThisMonthMom,
      description: 'Newly indexed sources feeding AI models',
      icon: Sparkles,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const isPositive = card.mom >= 0;
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
                {card.title}
              </span>
              <div className={cn('p-2 rounded-xl', card.color)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
                {card.value}
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border',
                    isPositive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span>
                    {isPositive ? `+${card.mom}%` : `${card.mom}%`}
                  </span>
                </span>
                <span className="text-[11px] text-gray-400 font-medium">vs last month</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-zinc-400 pt-2 border-t border-gray-100 dark:border-zinc-800/80 truncate">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
