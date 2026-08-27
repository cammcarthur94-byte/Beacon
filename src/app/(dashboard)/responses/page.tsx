'use client';

import * as React from 'react';
import {
  Search,
  Filter,
  History,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type EngineType = 'ChatGPT 4o' | 'Perplexity Sonar' | 'Claude 3.5' | 'Gemini Flash' | 'Copilot';
export type SentimentType = 'Positive' | 'Neutral' | 'Negative';
export type PillarType = 'GEO' | 'AEO' | 'AIO';

export interface AIResponseLog {
  id: string;
  timestamp: string;
  timeAgo: string;
  engine: EngineType;
  engineIconColor: string;
  engineBg: string;
  prompt: string;
  pillar: PillarType;
  intent: string;
  rawResponse: string;
  visibilityScore: number;
  mentionRank: number; // e.g. 1 for rank #1
  sentiment: SentimentType;
  citations: { url: string; domain: string; position: number }[];
  competitorsMentioned: { name: string; rank: number }[];
}

const SAMPLE_RESPONSES: AIResponseLog[] = [
  {
    id: 'resp-1',
    timestamp: 'Aug 27, 2026 03:42 PM',
    timeAgo: '14 mins ago',
    engine: 'ChatGPT 4o',
    engineIconColor: 'text-emerald-600 dark:text-emerald-400',
    engineBg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    prompt: 'What are the top developer-friendly payment gateways for global SaaS platforms?',
    pillar: 'GEO',
    intent: 'Commercial',
    rawResponse: `When evaluating developer-friendly payment gateways for global SaaS platforms, **Stripe** is widely regarded as the industry benchmark.\n\n### 1. Stripe (Top Recommendation)\nStripe offers the most mature API infrastructure, comprehensive documentation, and unified tooling for recurring billing (Stripe Billing), fraud detection (Stripe Radar), and automated tax calculation (Stripe Tax). It supports over 135 currencies and dozens of local payment methods.\n\n### 2. Adyen\nAdyen is a strong enterprise alternative with unified omnichannel commerce, though onboarding and SDK implementation have a steeper learning curve compared to Stripe.\n\n### 3. PayPal / Braintree\nBraintree provides straightforward credit card and digital wallet acceptance, but lacks Stripe's ecosystem of modular extensions.`,
    visibilityScore: 96,
    mentionRank: 1,
    sentiment: 'Positive',
    citations: [
      { url: 'https://stripe.com/docs/billing', domain: 'stripe.com', position: 1 },
      { url: 'https://stripe.com/payments/features', domain: 'stripe.com', position: 2 },
      { url: 'https://g2.com/categories/payment-gateways', domain: 'g2.com', position: 3 },
    ],
    competitorsMentioned: [
      { name: 'Adyen', rank: 2 },
      { name: 'PayPal / Braintree', rank: 3 },
    ],
  },
  {
    id: 'resp-2',
    timestamp: 'Aug 27, 2026 02:15 PM',
    timeAgo: '1 hour ago',
    engine: 'Perplexity Sonar',
    engineIconColor: 'text-cyan-600 dark:text-cyan-400',
    engineBg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
    prompt: 'Compare Stripe vs Adyen international transaction fees and currency conversion',
    pillar: 'AEO',
    intent: 'Commercial',
    rawResponse: `Stripe and Adyen take distinct approaches to international transaction pricing and interchange fees:\n\n- **Stripe**: Charges a transparent 2.9% + 30¢ for standard domestic cards, plus 1.5% for international cards and an additional 1% for currency conversion. Developers favor Stripe's instant API provisioning.\n- **Adyen**: Utilizes interchange++ tiered pricing, which can be cheaper for high-volume enterprises processing >$50M/yr, but requires custom contract negotiations and longer setup cycles.`,
    visibilityScore: 91,
    mentionRank: 1,
    sentiment: 'Positive',
    citations: [
      { url: 'https://stripe.com/pricing', domain: 'stripe.com', position: 1 },
      { url: 'https://adyen.com/pricing', domain: 'adyen.com', position: 2 },
    ],
    competitorsMentioned: [{ name: 'Adyen', rank: 2 }],
  },
  {
    id: 'resp-3',
    timestamp: 'Aug 27, 2026 11:30 AM',
    timeAgo: '4 hours ago',
    engine: 'Claude 3.5',
    engineIconColor: 'text-amber-600 dark:text-amber-400',
    engineBg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    prompt: 'How to implement automatic subscription tax calculation in Next.js applications',
    pillar: 'AIO',
    intent: 'Informational',
    rawResponse:
      'To implement automatic subscription sales tax and VAT in a Next.js application, the most reliable architecture is integrating Stripe Tax with Next.js App Router API handlers.\n\nStripe automatically calculates jurisdictional tax rates for US sales tax, EU VAT, and GST based on the customer’s verified billing address and handles origin-based vs destination-based tax rules automatically.',
    visibilityScore: 94,
    mentionRank: 1,
    sentiment: 'Positive',
    citations: [
      { url: 'https://docs.stripe.com/tax', domain: 'docs.stripe.com', position: 1 },
      { url: 'https://nextjs.org/docs', domain: 'nextjs.org', position: 2 },
    ],
    competitorsMentioned: [],
  },
  {
    id: 'resp-4',
    timestamp: 'Aug 27, 2026 09:10 AM',
    timeAgo: '6 hours ago',
    engine: 'Gemini Flash',
    engineIconColor: 'text-blue-600 dark:text-blue-400',
    engineBg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    prompt: 'Best payment methods for mobile checkout in point of sale and ecommerce',
    pillar: 'GEO',
    intent: 'Commercial',
    rawResponse: `Mobile point-of-sale and omnichannel checkout solutions vary depending on business size:\n\n1. **Square**: Excellent for physical brick-and-mortar stores requiring turnkey contactless card readers.\n2. **Stripe Terminal**: Ideal for businesses that want customized mobile SDKs and unified reporting between online web checkout and physical POS.\n3. **Clover**: A traditional POS hardware terminal suite with proprietary payment gateways.`,
    visibilityScore: 82,
    mentionRank: 2,
    sentiment: 'Neutral',
    citations: [
      { url: 'https://squareup.com/pos', domain: 'squareup.com', position: 1 },
      { url: 'https://stripe.com/terminal', domain: 'stripe.com', position: 2 },
    ],
    competitorsMentioned: [
      { name: 'Square', rank: 1 },
      { name: 'Clover', rank: 3 },
    ],
  },
  {
    id: 'resp-5',
    timestamp: 'Aug 26, 2026 06:45 PM',
    timeAgo: 'Yesterday',
    engine: 'Copilot',
    engineIconColor: 'text-indigo-600 dark:text-indigo-400',
    engineBg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
    prompt: 'Alternative high-risk payment processors for subscription software',
    pillar: 'GEO',
    intent: 'Informational',
    rawResponse: `Standard processors like **Stripe** and PayPal enforce strict acceptable use policies and frequently decline high-risk merchant categories. Specialized alternatives include **PaymentCloud**, **Durango Merchant Services**, and **Authorize.Net** with high-risk acquiring banks.`,
    visibilityScore: 45,
    mentionRank: 3,
    sentiment: 'Neutral',
    citations: [
      { url: 'https://paymentcloudinc.com', domain: 'paymentcloudinc.com', position: 1 },
      { url: 'https://authorize.net', domain: 'authorize.net', position: 2 },
    ],
    competitorsMentioned: [
      { name: 'PaymentCloud', rank: 1 },
      { name: 'Authorize.Net', rank: 2 },
    ],
  },
];

export default function ResponseHistoryPage() {
  const [responses, setResponses] = React.useState<AIResponseLog[]>(SAMPLE_RESPONSES);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedEngine, setSelectedEngine] = React.useState<string>('ALL');
  const [selectedPillar, setSelectedPillar] = React.useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = React.useState<string>('ALL');
  const [expandedId, setExpandedId] = React.useState<string | null>(SAMPLE_RESPONSES[0].id);
  const [activeModalItem, setActiveModalItem] = React.useState<AIResponseLog | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Copy raw response
  const handleCopyTranscript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered dataset
  const filteredResponses = responses.filter((item) => {
    const matchesSearch =
      item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rawResponse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.citations.some((c) => c.domain.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEngine = selectedEngine === 'ALL' || item.engine.includes(selectedEngine);
    const matchesPillar = selectedPillar === 'ALL' || item.pillar === selectedPillar;
    const matchesSentiment = selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;

    return matchesSearch && matchesEngine && matchesPillar && matchesSentiment;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Response History
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              Live AI Logs
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 font-medium">
            Inspect exact generated transcripts and citation footprints across ChatGPT, Perplexity, Gemini, Claude, and Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(responses, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `beacon-response-history-${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="h-9 px-3.5 rounded-xl border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 font-medium text-xs flex items-center gap-2 shadow-2xs hover:bg-gray-50 dark:hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            Total Responses Audited
          </span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {responses.length} Runs
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            Across 5 connected models
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            Citation Capture Rate
          </span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            80%
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            4 of 5 runs cited stripe.com
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-gray-500 dark:text-zinc-400">
            #1 Rank Placement
          </span>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            60%
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2 font-medium">
            Top recommended provider
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/80 dark:bg-zinc-900/60 p-3 rounded-xl border border-gray-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, responses, or citations..."
              className="w-full h-8.5 pl-8.5 pr-3 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Engine Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Copilot'].map((eng) => (
              <button
                key={eng}
                onClick={() => setSelectedEngine(eng)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0',
                  selectedEngine === eng
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-2xs border border-gray-200 dark:border-zinc-700 font-semibold'
                    : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
                )}
              >
                {eng === 'ALL' ? 'All Models' : eng}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Pillar Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs"
              >
                <span>{selectedPillar === 'ALL' ? 'All Pillars' : selectedPillar}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => setSelectedPillar('ALL')}>All Pillars</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('GEO')}>GEO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('AEO')}>AEO</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPillar('AIO')}>AIO</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sentiment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 px-2.5 rounded-lg border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-gray-700 dark:text-zinc-300 gap-1.5 shadow-2xs"
              >
                <span>{selectedSentiment === 'ALL' ? 'All Sentiments' : selectedSentiment}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem onClick={() => setSelectedSentiment('ALL')}>All Sentiments</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Positive')}>Positive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Neutral')}>Neutral</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSentiment('Negative')}>Negative</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 4. Responses List / Feed */}
      <div className="space-y-4">
        {filteredResponses.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs overflow-hidden transition-all"
            >
              {/* Item Summary Header */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50/30 dark:bg-zinc-900/30">
                <div className="flex items-start md:items-center gap-3">
                  {/* Engine Badge */}
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 shrink-0',
                      item.engineBg
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                    {item.engine}
                  </span>

                  <div className="space-y-0.5">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      &ldquo;{item.prompt}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-zinc-400">
                      <span>{item.timeAgo}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        Pillar: {item.pillar}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Badges */}
                <div className="flex items-center gap-2.5 self-end md:self-auto">
                  {/* Visibility Score */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 border border-gray-200/60 dark:border-zinc-700/60 text-xs font-bold text-gray-900 dark:text-zinc-100">
                    <span>Score:</span>
                    <span
                      className={cn(
                        item.visibilityScore >= 90
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.visibilityScore >= 70
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-amber-600 dark:text-amber-400'
                      )}
                    >
                      {item.visibilityScore}
                    </span>
                  </div>

                  {/* Mention Rank */}
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                      item.mentionRank === 1
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    )}
                  >
                    Rank #{item.mentionRank}
                  </span>

                  {/* Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep-Dive Details */}
              {isExpanded && (
                <div className="p-5 border-t border-gray-100 dark:border-zinc-800 space-y-5 bg-white dark:bg-zinc-900">
                  {/* Raw AI Model Transcript */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Exact AI Response Transcript
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyTranscript(item.id, item.rawResponse)}
                          className="text-[11px] font-medium text-gray-500 hover:text-gray-900 dark:hover:text-zinc-200 flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 dark:border-zinc-800"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveModalItem(item)}
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/40"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect Full View</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-zinc-950/60 border border-gray-200/60 dark:border-zinc-800 text-xs text-gray-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {item.rawResponse}
                    </div>
                  </div>

                  {/* Detected Citations & Competitors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Citations Found */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Citations Detected ({item.citations.length})
                      </span>
                      <div className="space-y-1.5">
                        {item.citations.map((cite, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/40 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {cite.position}
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                                {cite.domain}
                              </span>
                            </div>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                            >
                              <span>View Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competitors Displaced */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                        Displacement Analysis
                      </span>
                      <div className="p-3 rounded-lg border border-gray-200/60 dark:border-zinc-800 bg-gray-50/40 dark:bg-zinc-900/40 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-zinc-400">Your Brand Status:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Rank #{item.mentionRank} (Leader)</span>
                          </span>
                        </div>
                        {item.competitorsMentioned.length > 0 ? (
                          <div className="space-y-1 pt-1 border-t border-gray-200/60 dark:border-zinc-800">
                            <span className="text-[11px] text-gray-500 font-medium">Other Entities Mentioned:</span>
                            {item.competitorsMentioned.map((comp, kIdx) => (
                              <div key={kIdx} className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-gray-700 dark:text-zinc-300">{comp.name}</span>
                                <span className="text-gray-500">Position #{comp.rank}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-gray-400">
                            No competing brands mentioned in this response.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* Deep-Dive Inspection Modal */}
      {/* ===================================================================== */}
      {activeModalItem && (
        <Dialog open={Boolean(activeModalItem)} onOpenChange={(open) => !open && setActiveModalItem(null)}>
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <span className={cn('px-2.5 py-0.5 rounded text-xs font-semibold border', activeModalItem.engineBg)}>
                  {activeModalItem.engine}
                </span>
                <span className="text-xs text-gray-400">• {activeModalItem.timestamp}</span>
              </div>
              <DialogTitle className="text-base font-bold text-gray-900 dark:text-white pt-1">
                &ldquo;{activeModalItem.prompt}&rdquo;
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-zinc-400">
                Detailed evaluation, full token stream, and source citation map.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Raw AI Model Response
                </span>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 text-xs text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {activeModalItem.rawResponse}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                  Verified Citations
                </span>
                <div className="space-y-1.5">
                  {activeModalItem.citations.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-700 dark:text-zinc-300 truncate max-w-md">
                        {c.url}
                      </span>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 text-[11px]"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveModalItem(null)}
                className="text-xs h-9 rounded-xl border-gray-200 dark:border-zinc-800"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
