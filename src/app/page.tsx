import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  LineChart,
  Radar,
  Sparkles,
} from 'lucide-react';

const engines = [
  { name: 'ChatGPT', provider: 'OpenAI GPT-4o' },
  { name: 'Perplexity', provider: 'Sonar Pro' },
  { name: 'Gemini', provider: 'Google Gemini 1.5' },
  { name: 'Claude', provider: 'Anthropic Sonnet 3.5' },
  { name: 'Copilot', provider: 'Microsoft / Bing' },
];

const features = [
  {
    icon: Radar,
    title: 'Multi-Engine Auditing',
    description:
      'Run comprehensive visibility audits across ChatGPT, Perplexity, Gemini, Claude, and Copilot to observe brand presence in real-time generative answers.',
    tag: '5 AI Engines',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Share of Voice Analytics',
    description:
      'Convert brand citations, engine recommendations, and ranking positions into clear, actionable Share of Voice metrics and competitive benchmarks.',
    tag: 'Competitive Intel',
    color: 'teal',
  },
  {
    icon: LineChart,
    title: 'Automated Prompt Tracking',
    description:
      'Monitor your high-impact brand and industry search queries on automated schedules to detect AI citation shifts before competitors do.',
    tag: 'Continuous Sync',
    color: 'indigo',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* Navigation Bar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Beacon Home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">Beacon</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
            Generative Engine Optimization (GEO) Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Track your AI Share of Voice & Generative Search Visibility
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Monitor brand citations, analyze recommendations, and measure visibility across{' '}
            <span className="font-semibold text-slate-900">
              ChatGPT, Perplexity, Gemini, Claude, and Copilot
            </span>
            —all in one unified platform.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
            >
              Start Tracking Visibility
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              Explore Features
            </Link>
          </div>
        </div>

        {/* Rich Interactive / Simulated Visibility Preview Card */}
        <div className="relative z-10 mx-auto mt-16 max-w-5xl rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:mt-20">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live GEO Intelligence
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  Cross-Engine Visibility Benchmark
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 5 Engines Active
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 py-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">AI Share of Voice</p>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    Leader
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-blue-600">68.4%</p>
                <p className="mt-1 text-xs font-medium text-teal-600">+12.8% vs competitors</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Brand Citations</p>
                  <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                    Verified
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">1,284</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Indexed in answers</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Prompts Monitored</p>
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    Scheduled
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-slate-900">342</p>
                <p className="mt-1 text-xs font-medium text-teal-600">Continuous background sync</p>
              </div>
            </div>

            {/* Engine Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <span className="text-xs font-semibold text-slate-400">Supported AI Engines:</span>
              <div className="flex flex-wrap gap-2">
                {engines.map((engine) => (
                  <span
                    key={engine.name}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    <Bot className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-900">{engine.name}</span>
                    <span className="text-slate-400">({engine.provider})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Column Feature Cards Section */}
      <section id="features" className="border-t border-slate-200 bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Core Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Engineered for Modern Generative Search
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-500">
              Transform AI model responses into actionable intelligence with continuous prompt monitoring and Share of Voice metrics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tag, color }) => (
              <div
                key={title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        color === 'teal'
                          ? 'bg-teal-50 text-teal-600 border border-teal-100'
                          : color === 'indigo'
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      {tag}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Learn more <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Ready to measure your generative search visibility?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Audit your brand across all 5 AI engines in seconds. Uncover citations, evaluate rankings, and outpace the competition.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Start Tracking Visibility <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-slate-900">Beacon</span>
            <span className="text-xs text-slate-400">© 2026 Beacon GEO Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <Link href="/login" className="hover:text-slate-900 transition">
              Sign In
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition">
              Sign Up
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
