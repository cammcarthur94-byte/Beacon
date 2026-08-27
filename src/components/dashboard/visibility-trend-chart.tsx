'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailyVisibilityPoint } from '@/types/geo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Layers } from 'lucide-react';

interface VisibilityTrendChartProps {
  data: DailyVisibilityPoint[];
}

export function VisibilityTrendChart({ data }: VisibilityTrendChartProps) {
  const [viewMode, setViewMode] = React.useState<'overall' | 'multi-engine' | 'vs-competitors'>('overall');

  // Custom tooltip renderer
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[180px]">
          <div className="font-semibold text-foreground border-b border-border pb-1 mb-1.5 flex items-center justify-between">
            <span>{label}, 2026</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
              Audit Complete
            </Badge>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground capitalize">{entry.name}:</span>
              </div>
              <span className="font-bold text-foreground font-mono">{entry.value}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border/80 shadow-sm col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">30-Day Visibility Score Trend</CardTitle>
            <Badge variant="success" className="text-[10px] font-medium">
              +10.2% Growth
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Aggregated brand visibility index tracked across 5 AI search models daily
          </CardDescription>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/50 text-xs">
          <button
            onClick={() => setViewMode('overall')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'overall'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overall Index
          </button>
          <button
            onClick={() => setViewMode('multi-engine')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'multi-engine'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By AI Engine
          </button>
          <button
            onClick={() => setViewMode('vs-competitors')}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              viewMode === 'vs-competitors'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            vs Competitors
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="overallScoreGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="perplexityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22b3a8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22b3a8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="claudeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chatgptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10a37f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10a37f" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[50, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />

              {viewMode === 'overall' && (
                <Area
                  type="monotone"
                  dataKey="overallScore"
                  name="Overall Score"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#overallScoreGlow)"
                />
              )}

              {viewMode === 'multi-engine' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="perplexity"
                    name="Perplexity"
                    stroke="#22b3a8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#perplexityGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="claude"
                    name="Claude"
                    stroke="#d97706"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#claudeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="chatgpt"
                    name="ChatGPT"
                    stroke="#10a37f"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chatgptGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gemini"
                    name="Gemini"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="copilot"
                    name="Copilot"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray="4 4"
                  />
                </>
              )}

              {viewMode === 'vs-competitors' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="overallScore"
                    name="Acme Sync"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#overallScoreGlow)"
                  />
                  <Area
                    type="monotone"
                    dataKey="competitorAvg"
                    name="Competitor Average"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
