'use client';

import * as React from 'react';
import { AI_ENGINES } from '@/lib/constants';
import { AIEngine, MatrixRow } from '@/types/geo';
import { getDashboardMetrics } from '@/lib/actions/dashboard';
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
  RotateCw,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function VisibilityMatrixPage() {
  const [selectedEngineFilter, setSelectedEngineFilter] = React.useState<string>('all');
  const [matrixRows, setMatrixRows] = React.useState<MatrixRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const engineKeys = Object.keys(AI_ENGINES) as AIEngine[];

  React.useEffect(() => {
    getDashboardMetrics().then((res) => {
      if (res.hasPrompts && res.topCitations.length > 0) {
        // Build matrix rows from live citations and engine data
        const rows: MatrixRow[] = res.topCitations.map((cit, idx) => {
          const enginesMap: MatrixRow['engines'] = {};
          cit.engines.forEach((eng) => {
            enginesMap[eng] = {
              status: cit.authorityScore >= 85 ? 'ranked_1' : 'cited',
              rank: cit.authorityScore >= 85 ? 1 : 2,
              citationUrl: cit.url,
            };
          });

          return {
            promptId: cit.id,
            query: cit.title || cit.url,
            category: cit.isTargetBrand ? 'Brand Primary' : 'Industry Reference',
            engines: enginesMap,
          };
        });
        setMatrixRows(rows);
      } else {
        setMatrixRows([]);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const renderStatusCell = (engineStatus: any) => {
    if (!engineStatus || engineStatus.status === 'not_mentioned') {
      return (
        <div className="flex items-center justify-center p-2 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-200/50 dark:border-zinc-800 text-[11px] text-gray-400">
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
          className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>#1 Citation</span>
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
        className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-100/60 transition-colors group cursor-pointer"
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Cited Source</span>
        </div>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Cross-Engine</span>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-zinc-400">Generative Discovery</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            AI Visibility Matrix
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Real-time grid showing your brand citation and ranking footprint across all major LLM answer engines.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matrixRows, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `visibility-matrix-${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="text-xs gap-1.5 h-8.5 rounded-lg border-gray-200 dark:border-zinc-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Matrix</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
          <RotateCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Loading Visibility Matrix...</span>
        </div>
      ) : matrixRows.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 space-y-3">
          <Grid3X3 className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No Visibility Matrix Data Yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Add prompts and run an AI audit cycle to populate real-time citations and cross-engine rankings.
          </p>
          <Link href="/prompts">
            <Button size="sm" className="h-8.5 text-xs rounded-xl bg-gray-900 hover:bg-black text-white mt-2">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Prompts to Audit
            </Button>
          </Link>
        </div>
      ) : (
        /* Matrix Table Card */
        <Card className="border-gray-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                  <TableHead className="min-w-[260px] text-xs font-semibold">Tracked Search Query / Reference</TableHead>
                  {engineKeys.map((key) => {
                    const engine = AI_ENGINES[key];
                    return (
                      <TableHead key={key} className="min-w-[160px] text-center text-xs font-semibold">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: engine.color }} />
                          <span>{engine.name}</span>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrixRows.map((row) => (
                  <TableRow key={row.promptId} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-xs">
                      <div className="space-y-1">
                        <div className="text-gray-900 dark:text-zinc-100 font-semibold">{row.query}</div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{row.category}</span>
                      </div>
                    </TableCell>
                    {engineKeys.map((key) => (
                      <TableCell key={key} className="p-2">
                        {renderStatusCell(row.engines[key])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
