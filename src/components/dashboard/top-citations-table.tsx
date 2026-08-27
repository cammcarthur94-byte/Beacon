'use client';

import * as React from 'react';
import { CitedUrl } from '@/types/geo';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EngineBadge } from '@/components/engine-badge';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, Globe, ThumbsUp, Minus, ThumbsDown, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TopCitationsTableProps {
  citations: (CitedUrl & { isTargetBrand?: boolean })[];
}

export function TopCitationsTable({ citations }: TopCitationsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredCitations = citations.filter(
    (c) =>
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.domain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.url || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Top Cited URLs in AI Answers</CardTitle>
            <Badge variant="purple" className="text-[10px]">
              {citations.length} Key Sources
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Webpages and assets most frequently referenced by AI search engines during brand audits
          </CardDescription>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filter URLs or domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-background/50"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">CITED WEBPAGE & DOMAIN</TableHead>
              <TableHead>ENTITY TYPE</TableHead>
              <TableHead>AI ENGINES CITED IN</TableHead>
              <TableHead className="text-center">SENTIMENT</TableHead>
              <TableHead className="text-right">CITATIONS</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCitations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  {citations.length === 0
                    ? 'No citation records available yet. Run an audit to index AI citations.'
                    : 'No cited URLs match your search filter.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCitations.map((item, index) => (
                <TableRow key={item.id || index} className="group">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5 border border-border/50 text-xs font-mono">
                        #{index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {item.title || item.url}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                          <Globe className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                          <span className="font-mono text-[10px] text-muted-foreground truncate">{item.domain}</span>
                          <span>•</span>
                          <span className="text-[10px] text-muted-foreground/70">{item.lastCited}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Target Brand vs Competitor badge */}
                  <TableCell>
                    {item.isTargetBrand ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] gap-1 font-medium hover:bg-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Target Brand
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border text-[10px] gap-1 font-medium">
                        <ShieldAlert className="w-3 h-3 text-indigo-400" /> Rival / Web
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.engines && item.engines.length > 0 ? (
                        item.engines.map((engine) => (
                          <EngineBadge key={engine} engine={engine} size="sm" />
                        ))
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-mono">All Engines</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    {item.sentiment === 'positive' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ThumbsUp className="w-2.5 h-2.5" /> Positive
                      </span>
                    )}
                    {item.sentiment === 'neutral' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border">
                        <Minus className="w-2.5 h-2.5" /> Neutral
                      </span>
                    )}
                    {item.sentiment === 'negative' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        <ThumbsDown className="w-2.5 h-2.5" /> Critical
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-mono font-bold text-xs text-foreground">{item.citationCount}</div>
                    <div className="text-[10px] text-muted-foreground">references</div>
                  </TableCell>

                  <TableCell className="text-right">
                    {item.url && (
                      <a
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground inline-flex transition-colors"
                        title="Open source URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
