'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Layers, Globe, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourceDomain, CitationCategoryBreakdown } from '@/types/domains';

interface DomainChartsProps {
  topDomains: SourceDomain[];
  categoryBreakdown: CitationCategoryBreakdown[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  selectedDomain?: string;
  onSelectDomain?: (domain: string) => void;
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

export function DomainCharts({
  topDomains,
  categoryBreakdown,
  selectedCategory = 'ALL',
  onSelectCategory,
  selectedDomain = '',
  onSelectDomain,
}: DomainChartsProps) {
  const chartData = React.useMemo(() => {
    return topDomains.slice(0, 8).map((d) => ({
      domain: d.domain,
      citations: d.totalCitations,
      da: d.domainAuthority,
      category: d.category,
    }));
  }, [topDomains]);

  const totalCategoryCitations = React.useMemo(() => {
    return categoryBreakdown.reduce((acc, c) => acc + c.citationsCount, 0);
  }, [categoryBreakdown]);

  const handleCategoryClick = (categoryName: string) => {
    if (!onSelectCategory) return;
    if (selectedCategory === categoryName) {
      onSelectCategory('ALL');
    } else {
      onSelectCategory(categoryName);
    }
  };

  const handleDomainClick = (domainName: string) => {
    if (!onSelectDomain) return;
    if (selectedDomain === domainName) {
      onSelectDomain('');
    } else {
      onSelectDomain(domainName);
    }
  };

  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const domain = payload.value;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    const isDomainSelected = selectedDomain === domain;

    return (
      <g
        transform={`translate(${x - 135},${y - 8})`}
        onClick={() => handleDomainClick(domain)}
        className="cursor-pointer group"
      >
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
          fill={isDomainSelected ? '#2563eb' : '#334155'}
          fontSize={11}
          fontWeight={isDomainSelected ? 700 : 500}
          className={cn(
            'dark:fill-zinc-200 font-sans transition-colors',
            isDomainSelected && 'dark:fill-blue-400 font-bold'
          )}
        >
          {domain.length > 16 ? `${domain.substring(0, 14)}...` : domain}
        </text>
      </g>
    );
  };

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
          <div className="flex items-center gap-2">
            {selectedDomain && (
              <button
                onClick={() => onSelectDomain && onSelectDomain('')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Clear &ldquo;{selectedDomain}&rdquo;</span>
                <span>✕</span>
              </button>
            )}
            <span className="text-[11px] font-semibold text-gray-400 dark:text-zinc-500">
              Citation Volume
            </span>
          </div>
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
                          <p className="text-[10px] text-blue-400 font-semibold pt-1">
                            Click bar to filter table
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="citations"
                radius={[0, 6, 6, 0]}
                barSize={16}
                className="cursor-pointer"
                onClick={(entry: any) => handleDomainClick(entry.domain)}
              >
                {chartData.map((entry, index) => {
                  const isDimmed = selectedDomain && selectedDomain !== entry.domain;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                      opacity={isDimmed ? 0.35 : 1}
                      cursor="pointer"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Right: By Category (Interactive Donut Chart) - 1 Column */}
      <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              Citations by Category
            </h2>
          </div>
          {selectedCategory !== 'ALL' ? (
            <button
              onClick={() => onSelectCategory && onSelectCategory('ALL')}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset</span>
              <span>✕</span>
            </button>
          ) : (
            <span className="text-[11px] text-gray-400 font-medium">Domain Types</span>
          )}
        </div>

        {/* Donut Chart with Center Metric Label */}
        <div className="relative h-44 w-full flex items-center justify-center my-1 cursor-pointer">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CitationCategoryBreakdown;
                    return (
                      <div className="p-2.5 rounded-xl bg-gray-900/95 dark:bg-zinc-950/95 text-white text-xs shadow-xl border border-gray-800 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.category}</span>
                        </div>
                        <div className="text-[11px] text-gray-300 flex items-center justify-between gap-3 pt-1 border-t border-gray-800 font-mono">
                          <span>{data.citationsCount} citations</span>
                          <span className="font-bold text-white">{data.percentage}%</span>
                        </div>
                        <p className="text-[10px] text-purple-400 font-semibold pt-0.5">
                          Click slice to filter table
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={categoryBreakdown}
                dataKey="citationsCount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                stroke="#ffffff"
                strokeWidth={2}
                className="dark:stroke-zinc-900 cursor-pointer"
                onClick={(entry: any) => handleCategoryClick(entry.category)}
              >
                {categoryBreakdown.map((entry, index) => {
                  const isSelected = selectedCategory === entry.category;
                  const isDimmed = selectedCategory !== 'ALL' && !isSelected;

                  return (
                    <Cell
                      key={`cat-cell-${index}`}
                      fill={entry.color}
                      opacity={isDimmed ? 0.3 : 1}
                      stroke={isSelected ? '#2563eb' : '#ffffff'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all cursor-pointer hover:opacity-90"
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Donut Stat */}
          <div
            onClick={() => onSelectCategory && onSelectCategory('ALL')}
            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none group"
            title="Click to view all categories"
          >
            <span className="text-base font-extrabold text-gray-900 dark:text-white font-mono leading-none group-hover:text-blue-600 transition-colors">
              {totalCategoryCitations}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider mt-0.5 group-hover:text-blue-500 transition-colors">
              {selectedCategory !== 'ALL' ? selectedCategory.substring(0, 10) : 'Citations'}
            </span>
          </div>
        </div>

        {/* Categories Interactive Legend */}
        <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
          {categoryBreakdown.map((cat, idx) => {
            const isSelected = selectedCategory === cat.category;

            return (
              <div
                key={idx}
                onClick={() => handleCategoryClick(cat.category)}
                title={`Filter table by ${cat.category}`}
                className={cn(
                  'flex items-center justify-between text-xs py-1 px-2 rounded-lg cursor-pointer transition-all select-none',
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-800/60 shadow-2xs'
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 transition-transform',
                      isSelected && 'scale-125 ring-2 ring-blue-500/30'
                    )}
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.category}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className={cn(isSelected ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 dark:text-zinc-500')}>
                    {cat.citationsCount}
                  </span>
                  <span
                    className={cn(
                      'font-bold w-8 text-right',
                      isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-zinc-100'
                    )}
                  >
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2.5 mt-2 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-gray-500">
          <span>{categoryBreakdown.length} Tracked Categories</span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {selectedCategory !== 'ALL' ? `Filtered (${selectedCategory})` : '100% Total Volume'}
          </span>
        </div>
      </div>
    </div>
  );
}
