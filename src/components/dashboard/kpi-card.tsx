import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LucideIcon, CheckCircle2 } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  trendColor?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  badgeText?: string;
  badgeVariant?: 'emerald' | 'blue' | 'purple' | 'amber' | 'neutral';
  period?: string;
  icon?: LucideIcon;
  iconColor?: string;
  accentGlow?: string;
  subtext?: string;
  isSelected?: boolean;
  onClick?: () => void;
  breakdown?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  trendColor = 'emerald',
  badgeText,
  badgeVariant = 'emerald',
  period = 'vs last 30d',
  icon: Icon,
  iconColor = 'text-blue-600 dark:text-blue-400',
  accentGlow = 'from-blue-500/10 to-transparent',
  subtext,
  isSelected = false,
  onClick,
  breakdown,
}: KpiCardProps) {
  const getTrendStyle = () => {
    switch (trendColor) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60';
      case 'rose':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60';
      case 'emerald':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60';
    }
  };

  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60';
      case 'emerald':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60';
    }
  };

  const getSelectedBorder = () => {
    switch (trendColor) {
      case 'blue':
        return 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-md shadow-blue-500/10';
      case 'purple':
        return 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/20 dark:bg-purple-950/20 shadow-md shadow-purple-500/10';
      case 'amber':
        return 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-md shadow-amber-500/10';
      case 'emerald':
      default:
        return 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-md shadow-emerald-500/10';
    }
  };

  return (
    <Card
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        'relative overflow-hidden transition-all duration-200 group flex flex-col justify-between select-none cursor-pointer',
        isSelected
          ? getSelectedBorder()
          : 'border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-xs'
      )}
    >
      <div className={cn('absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity', accentGlow)} />
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'text-[11px] font-bold uppercase tracking-wider truncate transition-colors',
              isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400'
            )}>
              {title}
            </span>
            {badgeText ? (
              <span className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border', getBadgeStyle())}>
                {badgeText}
              </span>
            ) : Icon ? (
              <div className={cn('p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/50 dark:border-zinc-700/50 shrink-0', iconColor)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex items-baseline gap-2.5 flex-wrap">
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
              {value}
            </div>
            {change && (
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full border',
                  getTrendStyle()
                )}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{change}</span>
              </div>
            )}
          </div>
        </div>

        {/* Optional Sentiment progress breakdown bar */}
        {breakdown ? (
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 flex overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${breakdown.positive}%` }} title={`Positive: ${breakdown.positive}%`} />
              <div className="bg-amber-400 h-full transition-all" style={{ width: `${breakdown.neutral}%` }} title={`Neutral: ${breakdown.neutral}%`} />
              <div className="bg-rose-500 h-full transition-all" style={{ width: `${breakdown.negative}%` }} title={`Negative: ${breakdown.negative}%`} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {breakdown.positive}% Pos</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {breakdown.neutral}% Neu</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {breakdown.negative}% Neg</span>
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-gray-500 dark:text-zinc-400 flex items-center justify-between pt-1">
            <span>{period}</span>
            {subtext && <span className="font-medium text-gray-700 dark:text-zinc-300">{subtext}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


