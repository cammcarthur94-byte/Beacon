'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { EngineComparison } from '@/types/geo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EngineBadge } from '@/components/engine-badge';

interface EngineBreakdownChartProps {
  data: EngineComparison[];
}

export function EngineBreakdownChart({ data }: EngineBreakdownChartProps) {
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as EngineComparison;
      return (
        <div className="rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-border pb-1 mb-1">
            <span className="font-semibold text-foreground">{item.name}</span>
            <span className="font-bold text-primary font-mono">{item.score}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Indexed Citations:</span>
            <span className="text-foreground font-mono font-medium">{item.citationCount}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Mention Rate:</span>
            <span className="text-foreground font-mono font-medium">{item.mentionRate}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Avg Ranking Position:</span>
            <span className="text-emerald-400 font-mono font-medium">#{item.avgRank}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/80 shadow-sm col-span-1">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">AI Engine Comparison</CardTitle>
          <Badge variant="cyan" className="text-[10px]">
            5 Models Tracked
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Brand visibility score benchmarked by individual AI engine
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-3">
        <div className="h-[210px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#a1a1aa"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mini stats summary below chart */}
        <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Top Performing</div>
            <div className="text-xs font-bold text-teal-400 mt-0.5 flex items-center justify-center gap-1">
              Perplexity (93.2%)
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Citations</div>
            <div className="text-xs font-bold text-foreground mt-0.5 font-mono">
              1,305 URLs
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
