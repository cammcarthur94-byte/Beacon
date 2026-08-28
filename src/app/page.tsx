import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, LineChart, Radar, Sparkles } from 'lucide-react';

const engines = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];

const features = [
  {
    icon: Radar,
    title: 'Multi-Engine Auditing',
    description: 'See how your brand appears across the AI engines your audience uses every day.',
    color: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Share of Voice Analytics',
    description: 'Turn citations and recommendations into clear visibility trends your team can act on.',
    color: 'teal',
  },
  {
    icon: LineChart,
    title: 'Automated Prompt Tracking',
    description: 'Monitor important prompts on a schedule and spot changes before they become missed opportunities.',
    color: 'indigo',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Beacon home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Beacon</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
            Sign In
          </Link>
          <Link href="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Generative search visibility, made measurable
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Know where your brand stands in every AI answer.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
            Track AI Share of Voice and generative search visibility across ChatGPT, Perplexity, Gemini, Claude, and Copilot—so your team can turn brand citations into growth.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg">
              Start Tracking Visibility <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#features" className="rounded-xl px-6 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900">
              Explore the platform
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-16 max-w-5xl rounded-2xl border border-slate-200 bg-white p-3 shadow-md sm:mt-20">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Visibility overview</p>
                <p className="mt-1 text-xl font-bold text-slate-900">Your brand across AI search</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                <CheckCircle2 className="h-3.5 w-3.5" /> Tracking active
              </span>
            </div>
            <div className="grid gap-4 py-6 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">AI Share of Voice</p><p className="mt-2 text-3xl font-bold text-blue-600">68.4%</p><p className="mt-1 text-xs font-medium text-teal-600">+12.8% this month</p></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">Brand citations</p><p className="mt-2 text-3xl font-bold text-slate-900">1,284</p><p className="mt-1 text-xs font-medium text-teal-600">Across 5 AI engines</p></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-slate-500">Prompts monitored</p><p className="mt-2 text-3xl font-bold text-slate-900">342</p><p className="mt-1 text-xs font-medium text-teal-600">Updated automatically</p></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {engines.map((engine) => <span key={engine} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">{engine}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-200 bg-white px-6 py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-wider text-blue-600">Built for modern search teams</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">A clearer view of your AI visibility.</h2><p className="mt-4 text-lg leading-8 text-slate-500">Replace guesswork with a living view of where your brand is cited, recommended, and discovered.</p></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color }) => <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color === 'teal' ? 'bg-teal-50 text-teal-600' : color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}><Icon className="h-5 w-5" /></div><h3 className="mt-6 text-lg font-bold text-slate-900">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></div>)}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-8 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-slate-700">Beacon</span><span>Make every AI answer count.</span></div></footer>
    </main>
  );
}
