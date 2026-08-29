'use client';

import * as React from 'react';
import {
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ThumbsUp,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EngineIcon } from '@/components/ui/engine-icon';

interface EnginePerformance {
  key: string;
  name: string;
  model: string;
  provider: string;
  citationRate: number;
  change: string;
  avgLatency: string;
  sentimentScore: number;
  hallucinationRate: number;
  topSourceCategory: string;
  recommendedFocus: string;
}

const ENGINE_DATA: EnginePerformance[] = [
  {
    key: 'chatgpt',
    name: 'ChatGPT',
    model: 'GPT-4o (Omni Search)',
    provider: 'OpenAI',
    citationRate: 84.2,
    change: '+6.1%',
    avgLatency: '1.4s',
    sentimentScore: 94,
    hallucinationRate: 1.2,
    topSourceCategory: 'Official Documentation & GitHub',
    recommendedFocus: 'Maintain Schema.org JSON-LD and clean technical markdown documentation.',
  },
  {
    key: 'perplexity',
    name: 'Perplexity',
    model: 'Sonar Pro Online',
    provider: 'Perplexity AI',
    citationRate: 86.5,
    change: '+8.4%',
    avgLatency: '0.9s',
    sentimentScore: 91,
    hallucinationRate: 0.8,
    topSourceCategory: 'Tech Media & Publisher Articles',
    recommendedFocus: 'Distribute PR articles across high Domain Authority tech publications.',
  },
  {
    key: 'gemini',
    name: 'Gemini',
    model: 'Gemini 1.5 Pro Search',
    provider: 'Google DeepMind',
    citationRate: 72.0,
    change: '+3.2%',
    avgLatency: '1.8s',
    sentimentScore: 88,
    hallucinationRate: 2.1,
    topSourceCategory: 'Analyst Reports & Review Sites',
    recommendedFocus: 'Strengthen G2 and Capterra reviews and Knowledge Graph entity links.',
  },
  {
    key: 'claude',
    name: 'Claude',
    model: 'Claude Haiku 4.5 (20251001)',
    provider: 'Anthropic',
    citationRate: 69.4,
    change: '+4.0%',
    avgLatency: '1.1s',
    sentimentScore: 95,
    hallucinationRate: 0.6,
    topSourceCategory: 'Technical Whitepapers & Research',
    recommendedFocus: 'Provide detailed architectural comparison tables and verified benchmarks.',
  },
  {
    key: 'copilot',
    name: 'Copilot',
    model: 'Bing GPT-4 Turbo',
    provider: 'Microsoft',
    citationRate: 70.8,
    change: '+2.8%',
    avgLatency: '1.6s',
    sentimentScore: 86,
    hallucinationRate: 2.4,
    topSourceCategory: 'Enterprise Portals & News',
    recommendedFocus: 'Index corporate case studies and Microsoft ecosystem integrations.',
  },
];

export default function EngineAnalyticsPage() {
  const [selectedEngine, setSelectedEngine] = React.useState<string>('all');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Research & Intelligence
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Multi-Model Breakdown
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engine Analytics & Citation Placement
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Compare generative search citation rates, latency, and sentiment across individual LLMs.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 font-semibold">
            5 Active Engines Evaluated
          </span>
        </div>
      </div>

      {/* Engine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENGINE_DATA.map((eng) => (
          <div
            key={eng.key}
            className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <EngineIcon engine={eng.name} size={22} />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {eng.name}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {eng.model}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  {eng.change}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 font-medium">Citation Rate</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                    {eng.citationRate}%
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 font-medium">Avg Latency</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                    {eng.avgLatency}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 font-medium">Positive Sentiment</div>
                  <div className="text-lg font-extrabold text-emerald-600 font-mono">
                    {eng.sentimentScore}%
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50">
                  <div className="text-[10px] text-slate-400 font-medium">Hallucination Risk</div>
                  <div className="text-lg font-extrabold text-slate-700 dark:text-zinc-300 font-mono">
                    {eng.hallucinationRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Focus */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Recommended Action
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                {eng.recommendedFocus}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Comprehensive Model Comparison Matrix
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Side-by-side technical benchmarks and source attribution channels
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/50 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider select-none">
                <th className="py-3 px-6 w-[25%] min-w-[200px]">Engine / Model</th>
                <th className="py-3 px-4 w-[15%] text-center">Citation Rate</th>
                <th className="py-3 px-4 w-[15%] text-center">Latency</th>
                <th className="py-3 px-4 w-[15%] text-center">Sentiment</th>
                <th className="py-3 px-6 w-[30%] min-w-[200px]">Top Primary Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {ENGINE_DATA.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <EngineIcon engine={row.name} size={18} />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{row.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{row.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {row.citationRate}%
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-slate-600 dark:text-zinc-400">
                    {row.avgLatency}
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-emerald-600">
                    {row.sentimentScore}%
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-zinc-300">
                    {row.topSourceCategory}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
