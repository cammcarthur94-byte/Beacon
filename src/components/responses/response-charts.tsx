'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TimelineDataPoint, EngineDistributionItem } from '@/types/responses';

interface ResponseChartsProps {
  timelineData: TimelineDataPoint[];
  distributionData: EngineDistributionItem[];
  overallCitationRate: number;
  totalCitationsCount: number;
}

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: '#10b981',
  Perplexity: '#06b6d4',
  Gemini: '#3b82f6',
  Claude: '#f59e0b',
  Copilot: '#8b5cf6',
};

export function ResponseCharts({
  timelineData,
  distributionData,
  overallCitationRate,
  totalCitationsCount,
}: ResponseChartsProps) {
  const [expandTimeline, setExpandTimeline] = React.useState(false);
  const [expandDistribution, setExpandDistribution] = React.useState(false);
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. Global Timeline Multi-Line Chart (Spans 2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-zinc-800/80">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Global Timeline — Citation Capture %
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                30-day generative search citation capture rate by AI engine
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{overallCitationRate}% Avg Capture</span>
              </span>
              <button
                type="button"
                onClick={() => setExpandTimeline(true)}
                title="Expand timeline graph"
                className="p-1 rounded-lg border border-gray-200/80 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Multi-Line Chart Canvas */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timelineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  className="dark:stroke-zinc-800"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-gray-900/95 dark:bg-zinc-950/95 text-white text-xs shadow-xl border border-gray-800 backdrop-blur-sm space-y-1.5 min-w-[150px]">
                          <p className="font-bold text-[11px] text-gray-300 border-b border-gray-800 pb-1">
                            {label}
                          </p>
                          {payload.map((entry: any) => (
                            <div
                              key={entry.name}
                              className="flex items-center justify-between gap-3 text-[11px]"
                            >
                              <span className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-gray-300">{entry.name}</span>
                              </span>
                              <span className="font-bold font-mono">
                                {entry.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ChatGPT"
                  stroke={ENGINE_COLORS.ChatGPT}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Perplexity"
                  stroke={ENGINE_COLORS.Perplexity}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Gemini"
                  stroke={ENGINE_COLORS.Gemini}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Claude"
                  stroke={ENGINE_COLORS.Claude}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Copilot"
                  stroke={ENGINE_COLORS.Copilot}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Engine Distribution Donut Chart (1 Column) */}
        <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <PieIcon className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Engine Distribution
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-500 font-medium">
                Active Models
              </span>
              <button
                type="button"
                onClick={() => setExpandDistribution(true)}
                title="Expand distribution chart"
                className="p-1 rounded-lg border border-gray-200/80 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Donut Chart with Center Metric */}
          <div className="relative h-44 sm:h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ENGINE_COLORS[entry.name] || '#3b82f6'}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as EngineDistributionItem;
                      return (
                        <div className="p-2.5 rounded-xl bg-gray-900/95 dark:bg-zinc-950/95 text-white text-xs shadow-xl border border-gray-800 space-y-0.5">
                          <p className="font-bold flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ENGINE_COLORS[data.name] }}
                            />
                            <span>{data.name}</span>
                          </p>
                          <p className="text-gray-300 text-[11px]">
                            {data.citationsCount} citations ({data.percentage}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Metric Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-gray-900 dark:text-white leading-none">
                {totalCitationsCount}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-zinc-500 mt-1">
                Citations
              </span>
            </div>
          </div>

          {/* Distribution Breakdown Mini-List */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800/80">
            {distributionData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-xs py-0.5"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: ENGINE_COLORS[item.name] || '#3b82f6' }}
                  />
                  <span className="font-medium text-gray-700 dark:text-zinc-300">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-zinc-400 font-mono text-[11px]">
                    {item.citationsCount}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white font-mono text-[11px] w-9 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Modal for Global Timeline Chart */}
      <Dialog open={expandTimeline} onOpenChange={setExpandTimeline}>
        <DialogContent className="max-w-5xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Global Timeline — Citation Capture % (Expanded View)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    High-resolution 30-day generative search citation capture rate by AI engine
                  </DialogDescription>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                {overallCitationRate}% Avg Capture
              </span>
            </div>
          </DialogHeader>

          <div className="h-[420px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-zinc-800" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl bg-gray-900/95 dark:bg-zinc-950/95 text-white text-xs shadow-xl border border-gray-800 space-y-1.5 min-w-[170px]">
                          <p className="font-bold text-xs text-gray-300 border-b border-gray-800 pb-1">{label}</p>
                          {payload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-3 text-xs">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-gray-300">{entry.name}</span>
                              </span>
                              <span className="font-bold font-mono">{entry.value}%</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="ChatGPT" stroke={ENGINE_COLORS.ChatGPT} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Perplexity" stroke={ENGINE_COLORS.Perplexity} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Gemini" stroke={ENGINE_COLORS.Gemini} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Claude" stroke={ENGINE_COLORS.Claude} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Copilot" stroke={ENGINE_COLORS.Copilot} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Modal for Engine Distribution Donut Chart */}
      <Dialog open={expandDistribution} onOpenChange={setExpandDistribution}>
        <DialogContent className="max-w-4xl p-6 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <PieIcon className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    Engine Distribution Breakdown (Expanded View)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                    Proportionate citation share across all generative AI answer engines
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 items-center">
            <div className="h-[320px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value">
                    {distributionData.map((entry, index) => (
                      <Cell key={`modal-dist-${index}`} fill={ENGINE_COLORS[entry.name] || '#3b82f6'} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono leading-none">
                  {totalCitationsCount}
                </span>
                <span className="text-xs uppercase font-bold text-gray-400 tracking-wider mt-1">
                  Total Citations
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {distributionData.map((item) => (
                <div key={item.name} className="p-3 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: ENGINE_COLORS[item.name] || '#3b82f6' }} />
                    <span className="font-semibold text-xs text-gray-900 dark:text-zinc-100">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-gray-500">{item.citationsCount} citations</span>
                    <span className="font-bold text-gray-900 dark:text-white px-2 py-0.5 rounded bg-gray-200/60 dark:bg-zinc-700/60">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
