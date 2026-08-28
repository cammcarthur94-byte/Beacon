'use client';

import * as React from 'react';
import { AIEngine } from '@/types/geo';

export const ALL_ENGINES: { id: AIEngine; name: string; shortName: string; badgeColor: string; activeBg: string }[] = [
  { id: 'chatgpt', name: 'ChatGPT', shortName: 'GPT-4o', badgeColor: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' },
  { id: 'perplexity', name: 'Perplexity', shortName: 'Sonar', badgeColor: 'text-cyan-600 dark:text-cyan-400', activeBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300' },
  { id: 'gemini', name: 'Gemini', shortName: 'Flash', badgeColor: 'text-blue-600 dark:text-blue-400', activeBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' },
  { id: 'claude', name: 'Claude', shortName: 'Sonnet', badgeColor: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300' },
  { id: 'copilot', name: 'Copilot', shortName: 'Bing', badgeColor: 'text-indigo-600 dark:text-indigo-400', activeBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300' },
  { id: 'google_aio', name: 'Google AIO', shortName: 'AIO', badgeColor: 'text-purple-600 dark:text-purple-400', activeBg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300' },
];

export interface FilterState {
  selectedEngines: AIEngine[];
  dateRange: string;
  promptCategory: string;
  searchQuery: string;
  isSampleData: boolean;
}

export interface FilterContextType extends FilterState {
  toggleEngine: (engine: AIEngine) => void;
  selectAllEngines: () => void;
  clearAllEngines: () => void;
  setDateRange: (range: string) => void;
  setPromptCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setIsSampleData: (isSample: boolean) => void;
  resetFilters: () => void;
  isEngineSelected: (engine: AIEngine) => boolean;
}

const DEFAULT_FILTER_STATE: FilterState = {
  selectedEngines: ['chatgpt', 'perplexity', 'gemini', 'claude', 'copilot', 'google_aio'],
  dateRange: 'Last 30 Days',
  promptCategory: 'All Categories',
  searchQuery: '',
  isSampleData: true,
};

const FilterContext = React.createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FilterState>(DEFAULT_FILTER_STATE);

  const toggleEngine = React.useCallback((engine: AIEngine) => {
    setState((prev) => {
      const exists = prev.selectedEngines.includes(engine);
      if (exists) {
        if (prev.selectedEngines.length === 1) return prev;
        return {
          ...prev,
          selectedEngines: prev.selectedEngines.filter((e) => e !== engine),
        };
      } else {
        return {
          ...prev,
          selectedEngines: [...prev.selectedEngines, engine],
        };
      }
    });
  }, []);

  const selectAllEngines = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedEngines: ALL_ENGINES.map((e) => e.id),
    }));
  }, []);

  const clearAllEngines = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedEngines: [ALL_ENGINES[0].id],
    }));
  }, []);

  const setDateRange = React.useCallback((dateRange: string) => {
    setState((prev) => ({ ...prev, dateRange }));
  }, []);

  const setPromptCategory = React.useCallback((promptCategory: string) => {
    setState((prev) => ({ ...prev, promptCategory }));
  }, []);

  const setSearchQuery = React.useCallback((searchQuery: string) => {
    setState((prev) => ({ ...prev, searchQuery }));
  }, []);

  const setIsSampleData = React.useCallback((isSampleData: boolean) => {
    setState((prev) => ({ ...prev, isSampleData }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setState(DEFAULT_FILTER_STATE);
  }, []);

  const isEngineSelected = React.useCallback(
    (engine: AIEngine) => state.selectedEngines.includes(engine),
    [state.selectedEngines]
  );

  const value = React.useMemo<FilterContextType>(
    () => ({
      ...state,
      toggleEngine,
      selectAllEngines,
      clearAllEngines,
      setDateRange,
      setPromptCategory,
      setSearchQuery,
      setIsSampleData,
      resetFilters,
      isEngineSelected,
    }),
    [state, toggleEngine, selectAllEngines, clearAllEngines, setDateRange, setPromptCategory, setSearchQuery, setIsSampleData, resetFilters, isEngineSelected]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilterContext(): FilterContextType {
  const context = React.useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
}

