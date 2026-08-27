import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  period?: string;
  icon: LucideIcon;
  iconColor?: string;
  accentGlow?: string;
  subtext?: string;
}

export function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  period = 'vs last 30d',
  icon: Icon,
  iconColor = 'text-primary',
  accentGlow = 'from-primary/10 to-transparent',
  subtext,
}: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/80 hover:border-border transition-all duration-300 group hover:shadow-lg hover:shadow-black/20">
      <div className={cn('absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br rounded-full blur-2xl pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity', accentGlow)} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <div className={cn('p-2 rounded-lg bg-muted/60 border border-border/50', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {change && (
            <div
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md border',
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              )}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>{period}</span>
          {subtext && <span className="font-medium text-foreground/80">{subtext}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
