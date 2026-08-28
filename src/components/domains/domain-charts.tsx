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
import { BarChart3, Layers, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceDomain, CitationCategoryBreakdown } from '@/types/domains';

interface DomainChartsProps {
  topDomains: SourceDomain[];
  categoryBreakdown: CitationCategoryBreakdown[];
}

const BAR_COLORS = [
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const domain = payload.value;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

  return (
    <g transform={`translate(${x - 135},${y - 8})`}>
      {/* 16px high-res domain favicon image */}
      <image
        href={faviconUrl}
        x={0}
        y={0}
        height={16}
        width={16}
        preserveAspectRatio="xMidYMid meet"
      />
      {/* Domain label */}
      <text
        x={22}
        y={12}
        textAnchor="start"
        fill="#334155"
        fontSize={11}
        fontWeight={500}
        className="dark:fill-zinc-200 font-sans"
      >
        {domain.length > 16 ? `${domain.substring(0, 14)}...` : domain}
      </text>
    </g>
  );
};

export function DomainCharts({
  topDomains,
  categoryBreakdown,
}: DomainChartsProps) {
  const chartData = React.useMemo(() => {
    return topDomains.slice(0, 8).map((d) => ({
      domain: d.domain,
      citations: d.totalCitations,
      da: d.domainAuthority,
      category: d.category,
    }));
  }, [topDomains]);

  const maxCitations = Math.max(...categoryBreakdown.map((c) => c.citationsCount), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Left: Citations by Domain (Horizontal Bar Chart) - 2 Columns */}
      <div className="lg:col-span-2 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Citations by Domain (Top 8 Sources)
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Foundational external websites providing citation ground truth to AI models
            </p>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500">
            Citation Volume
          </span>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
                className="dark:stroke-zinc-800"
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                type="category"
                dataKey="domain"
                tick={<CustomYAxisTick />}
                tickLine={false}
                axisLine={false}
                width={140}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-gray-900/95 dark:bg-zinc-950/95 text-white text-xs shadow-xl border border-gray-800 space-y-1">
                        <p className="font-bold text-sm text-cyan-400">{data.domain}</p>
                        <div className="text-[11px] text-gray-300 space-y-0.5 pt-1 border-t border-gray-800">
                          <p>
                            <span className="text-gray-400">Total Citations: </span>
                            <span className="font-bold font-mono text-white">{data.citations}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Domain Authority: </span>
                            <span className="font-bold font-mono text-emerald-400">DA {data.da}</span>
                          </p>
                          <p>
                            <span className="text-gray-400">Category: </span>
                            <span className="font-medium text-purple-300">{data.category}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="citations" radius={[0, 6, 6, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Right: By Category (List / Horizontal Progress Bars) - 1 Column */}
      <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Citations by Category
            </h2>
          </div>
          <span className="text-[11px] text-gray-400 font-medium">Domain Types</span>
        </div>

        {/* Categories Progress Bars List */}
        <div className="space-y-4 my-auto py-2">
          {categoryBreakdown.map((cat, idx) => {
            const relativeWidth = Math.round((cat.citationsCount / maxCitations) * 100);

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.category}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-zinc-400 text-[11px] font-mono">
                      {cat.citationsCount} cites
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono text-[11px] w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Thin Colored Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', cat.barColor)}
                    style={{ width: `${relativeWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-gray-500">
          <span>{categoryBreakdown.length} Tracked Categories</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">100% Total Volume</span>
        </div>
      </div>
    </div>
  );
}
