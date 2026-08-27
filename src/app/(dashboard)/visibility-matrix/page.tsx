'use client';

import * as React from 'react';
import { MOCK_MATRIX_ROWS, AI_ENGINES } from '@/lib/mock-data';
import { AIEngine } from '@/types/geo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EngineBadge } from '@/components/engine-badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Grid3X3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
  Download,
  Flame,
} from 'lucide-react';

export default function VisibilityMatrixPage() {
  const [selectedEngineFilter, setSelectedEngineFilter] = React.useState<string>('all');
  const engineKeys = Object.keys(AI_ENGINES) as AIEngine[];

  const renderStatusCell = (engineStatus: any) => {
    if (!engineStatus || engineStatus.status === 'not_mentioned') {
      return (
        <div className="flex items-center justify-center p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[11px] text-muted-foreground/60">
          <span>Unranked</span>
        </div>
      );
    }

    if (engineStatus.status === 'ranked_1') {
      return (
        <a
          href={engineStatus.citationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>#1 Citation</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      );
    }

    if (engineStatus.status === 'top_3') {
      return (
        <a
          href={engineStatus.citationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>Rank #{engineStatus.rank}</span>
          </div>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      );
    }

    return (
      <a
        href={engineStatus.citationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors group cursor-pointer"
      >
        <span>Cited #{engineStatus.rank}</span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Cross-Engine Audit</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Grid View</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">AI Visibility Matrix</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Full cross-comparison of search prompt rankings and citations across ChatGPT, Claude, Perplexity, Gemini, and Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export Matrix CSV
          </Button>
        </div>
      </div>

      {/* Legend & Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
            #1
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-400">Primary Source (#1)</div>
            <div className="text-[10px] text-muted-foreground">11 Matrix hits</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            Top 3
          </div>
          <div>
            <div className="text-xs font-bold text-blue-400">Top 3 Mention</div>
            <div className="text-[10px] text-muted-foreground">9 Matrix hits</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
            Ref
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400">Cited Secondary URL</div>
            <div className="text-[10px] text-muted-foreground">4 Matrix hits</div>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
            0
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground">Unranked / Not Cited</div>
            <div className="text-[10px] text-muted-foreground">6 Opportunities</div>
          </div>
        </div>
      </div>

      {/* Visibility Matrix Table */}
      <Card className="border-border/80 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Generative Search Matrix</CardTitle>
          <CardDescription className="text-xs">
            Click any active badge to inspect the exact reference URL cited in the engine&apos;s answer
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">TRACKED SEARCH QUERY</TableHead>
                {engineKeys.map((key) => (
                  <TableHead key={key} className="text-center font-semibold">
                    <EngineBadge engine={key} size="sm" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MATRIX_ROWS.map((row) => (
                <TableRow key={row.promptId} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold text-xs text-foreground">&quot;{row.query}&quot;</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{row.category}</div>
                  </TableCell>

                  {engineKeys.map((engineKey) => (
                    <TableCell key={engineKey} className="p-2">
                      {renderStatusCell(row.engines[engineKey])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
