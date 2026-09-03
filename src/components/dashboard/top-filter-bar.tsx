'use client';

import * as React from 'react';
import {
  Calendar,
  Layers,
  Filter,
  RotateCcw,
  Check,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFilterContext, ALL_ENGINES } from '@/context/filter-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DATE_RANGES = [
  'Last 7 Days',
  'Last 30 Days',
  'Last 90 Days',
  'Year to Date',
  'All Time',
];

const CATEGORIES = [
  'All Categories',
  'GEO (Generative Engine Optimization)',
  'AEO (Answer Engine Optimization)',
  'AIO (AI Overview Optimization)',
  'Commercial Intent',
  'Informational Intent',
  'Transactional Intent',
];

export function TopFilterBar() {
  const {
    selectedEngines,
    toggleEngine,
    selectAllEngines,
    dateRange,
    setDateRange,
    promptCategory,
    setPromptCategory,
    resetFilters,
  } = useFilterContext();

  const isAllSelected = selectedEngines.length === ALL_ENGINES.length;

  return (
    <div className="bg-gray-50/90 dark:bg-zinc-900/70 border border-gray-200/80 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs space-y-3">
      {/* Top Row: Section Label + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-gray-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
          <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
            Global Visibility Filters
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
            {selectedEngines.length}/{ALL_ENGINES.length} Engines Active
          </span>
        </div>

        {/* Right Dropdowns */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <Layers className="w-3 h-3 text-gray-400" />
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {promptCategory}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-xs">
              <DropdownMenuLabel className="text-[11px] text-gray-400 uppercase tracking-wider">
                Filter by Category / Pillar
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {CATEGORIES.map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => setPromptCategory(cat)}
                  className="flex items-center justify-between cursor-pointer text-xs"
                >
                  <span className={promptCategory === cat ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
                    {cat}
                  </span>
                  {promptCategory === cat && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Range Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800"
              >
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{dateRange}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              <DropdownMenuLabel className="text-[11px] text-gray-400 uppercase tracking-wider">
                Audit Time Window
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {DATE_RANGES.map((range) => (
                <DropdownMenuItem
                  key={range}
                  onClick={() => setDateRange(range)}
                  className="flex items-center justify-between cursor-pointer text-xs"
                >
                  <span className={dateRange === range ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
                    {range}
                  </span>
                  {dateRange === range && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 px-2 rounded-lg text-xs text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200"
            title="Reset to default filters"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Bottom Row: Engine Toggle Pills */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 mr-1 hidden sm:inline">
            Engines:
          </span>

          {ALL_ENGINES.map((engine) => {
            const isSelected = selectedEngines.includes(engine.id);
            return (
              <button
                key={engine.id}
                type="button"
                aria-pressed={isSelected}
                aria-label={`Toggle ${engine.name} engine`}
                onClick={() => toggleEngine(engine.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900',
                  isSelected
                    ? engine.activeBg
                    : 'bg-white dark:bg-zinc-900/60 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-500 opacity-60 hover:opacity-90'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-1.5 h-1.5 rounded-full inline-block transition-transform',
                    isSelected ? 'scale-110 bg-current' : 'bg-gray-400 dark:bg-zinc-600'
                  )}
                />
                <span>{engine.name}</span>
                {isSelected && (
                  <span aria-hidden="true" className="text-[10px] font-mono opacity-80 pl-0.5">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Select All / Toggle helper */}
        <button
          type="button"
          onClick={selectAllEngines}
          disabled={isAllSelected}
          className={cn(
            'text-[11px] font-medium transition-colors',
            isAllSelected
              ? 'text-gray-400 dark:text-zinc-600 cursor-default'
              : 'text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
          )}
        >
          Select All
        </button>
      </div>
    </div>
  );
}
