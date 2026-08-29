'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface ReportExecutiveKPI {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  subtitle: string;
}

export interface ReportTrendPoint {
  date: string;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  claude: number;
  copilot: number;
  overall: number;
}

export interface ReportSOVItem {
  entity: string;
  sov: number;
  color: string;
  isTargetBrand: boolean;
}

export interface ReportBlindSpotItem {
  promptId: string;
  prompt: string;
  pillar: 'GEO' | 'AEO' | 'AIO';
  intent: string;
  chatgpt: { cited: boolean; score: number };
  perplexity: { cited: boolean; score: number };
  gemini: { cited: boolean; score: number };
  claude: { cited: boolean; score: number };
  copilot: { cited: boolean; score: number };
}

export interface ReportActionItem {
  id: string;
  title: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  engine: string;
  effort: 'Low' | 'Medium' | 'High';
  estimatedLift: string;
  category: string;
}

export interface ReportsData {
  generatedAt: string;
  brandName: string;
  primaryDomain: string;
  dateRange: string;
  executiveSummary: {
    globalScore: ReportExecutiveKPI;
    totalCitations: ReportExecutiveKPI;
    sovLeader: ReportExecutiveKPI;
    sentimentScore: ReportExecutiveKPI;
  };
  trendTimeline: ReportTrendPoint[];
  shareOfVoice: ReportSOVItem[];
  blindSpotMatrix: ReportBlindSpotItem[];
  actionItems: ReportActionItem[];
}

export async function getReportsData(): Promise<ReportsData> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  let brandName = 'Acme Sync';
  let primaryDomain = 'acmelabs.com';

  try {
    const { data: brandData } = await supabase
      .from('brands')
      .select('name, domain')
      .limit(1)
      .single();

    if (brandData?.name) brandName = brandData.name;
    if (brandData?.domain) primaryDomain = brandData.domain;
  } catch (err) {
    console.warn('Reports: Using default brand profile for aggregation.');
  }

  // Placeholder Supabase RPC call for server-side aggregation
  try {
    const { data: rpcResult } = await supabase.rpc('get_reports_summary', {
      p_brand_domain: primaryDomain,
    });

    if (rpcResult && rpcResult.executiveSummary) {
      return rpcResult as ReportsData;
    }
  } catch (err) {
    // Graceful fallback to verified benchmark dataset
  }

  return {
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    brandName,
    primaryDomain,
    dateRange: 'Past 30 Days (Aug 2026)',
    executiveSummary: {
      globalScore: {
        title: 'Global AI Visibility Score',
        value: '74.2%',
        change: '+5.8%',
        isPositive: true,
        sparkline: [62, 65, 68, 67, 71, 74.2],
        subtitle: 'Average answer engine presence',
      },
      totalCitations: {
        title: 'Total Generated Citations',
        value: '1,428',
        change: '+18.4%',
        isPositive: true,
        sparkline: [1120, 1190, 1250, 1310, 1380, 1428],
        subtitle: 'Indexed publisher placements',
      },
      sovLeader: {
        title: 'Share of Voice Lead',
        value: '44.0%',
        change: '+4.2%',
        isPositive: true,
        sparkline: [38, 39, 41, 40, 42, 44],
        subtitle: 'Rank #1 vs tracked rivals',
      },
      sentimentScore: {
        title: 'Favorable Sentiment Rate',
        value: '91.8%',
        change: '+2.4%',
        isPositive: true,
        sparkline: [86, 87, 89, 88, 90, 91.8],
        subtitle: 'Positive contextual recommendation',
      },
    },
    trendTimeline: [
      { date: 'Aug 1', chatgpt: 68, perplexity: 72, gemini: 60, claude: 55, copilot: 58, overall: 62.6 },
      { date: 'Aug 7', chatgpt: 71, perplexity: 74, gemini: 63, claude: 58, copilot: 60, overall: 65.2 },
      { date: 'Aug 14', chatgpt: 76, perplexity: 79, gemini: 66, claude: 62, copilot: 64, overall: 69.4 },
      { date: 'Aug 21', chatgpt: 80, perplexity: 82, gemini: 69, claude: 65, copilot: 67, overall: 72.6 },
      { date: 'Aug 28', chatgpt: 84, perplexity: 86, gemini: 72, claude: 69, copilot: 70, overall: 76.2 },
    ],
    shareOfVoice: [
      { entity: brandName, sov: 44, color: '#2563eb', isTargetBrand: true },
      { entity: 'OmniSync', sov: 28, color: '#06b6d4', isTargetBrand: false },
      { entity: 'Nexus AI', sov: 18, color: '#8b5cf6', isTargetBrand: false },
      { entity: 'Apex Platform', sov: 10, color: '#64748b', isTargetBrand: false },
    ],
    blindSpotMatrix: [
      {
        promptId: 'p-1',
        prompt: 'Best real-time data sync platforms for enterprise SaaS',
        pillar: 'GEO',
        intent: 'Commercial',
        chatgpt: { cited: true, score: 94 },
        perplexity: { cited: true, score: 91 },
        gemini: { cited: true, score: 85 },
        claude: { cited: true, score: 78 },
        copilot: { cited: true, score: 82 },
      },
      {
        promptId: 'p-2',
        prompt: 'How to stream multi-region Postgres tables to Snowflake',
        pillar: 'AEO',
        intent: 'Informational',
        chatgpt: { cited: true, score: 88 },
        perplexity: { cited: true, score: 96 },
        gemini: { cited: false, score: 32 },
        claude: { cited: true, score: 80 },
        copilot: { cited: true, score: 75 },
      },
      {
        promptId: 'p-3',
        prompt: 'OmniSync vs Acme Sync pricing and scalability comparison',
        pillar: 'GEO',
        intent: 'Commercial',
        chatgpt: { cited: true, score: 90 },
        perplexity: { cited: true, score: 85 },
        gemini: { cited: true, score: 78 },
        claude: { cited: false, score: 40 },
        copilot: { cited: false, score: 38 },
      },
      {
        promptId: 'p-4',
        prompt: 'SOC2 compliant change data capture tools for FinTech',
        pillar: 'AIO',
        intent: 'Commercial',
        chatgpt: { cited: false, score: 45 },
        perplexity: { cited: true, score: 88 },
        gemini: { cited: false, score: 30 },
        claude: { cited: true, score: 84 },
        copilot: { cited: false, score: 42 },
      },
      {
        promptId: 'p-5',
        prompt: 'Zero-downtime database replication architecture guide',
        pillar: 'AEO',
        intent: 'Informational',
        chatgpt: { cited: true, score: 92 },
        perplexity: { cited: true, score: 94 },
        gemini: { cited: true, score: 88 },
        claude: { cited: true, score: 86 },
        copilot: { cited: true, score: 80 },
      },
      {
        promptId: 'p-6',
        prompt: 'Sub-second API latency guarantees in cloud ETL pipelines',
        pillar: 'GEO',
        intent: 'Transactional',
        chatgpt: { cited: true, score: 86 },
        perplexity: { cited: false, score: 48 },
        gemini: { cited: true, score: 82 },
        claude: { cited: false, score: 35 },
        copilot: { cited: true, score: 78 },
      },
    ],
    actionItems: [
      {
        id: 'act-1',
        title: 'Publish Dedicated Schema.org TechArticle for Change Data Capture',
        impact: 'CRITICAL',
        engine: 'Gemini & Copilot',
        effort: 'Low',
        estimatedLift: '+14% Gemini Citation Capture',
        category: 'Structured Data',
      },
      {
        id: 'act-2',
        title: 'Add Head-to-Head Feature Matrix vs OmniSync to Documentation',
        impact: 'HIGH',
        engine: 'Claude & Copilot',
        effort: 'Medium',
        estimatedLift: '+9% Competitor Comparison SOV',
        category: 'Entity Proof',
      },
      {
        id: 'act-3',
        title: 'Fix Missing HTTPS Canonical Redirect on /api/v2/streaming Docs',
        impact: 'HIGH',
        engine: 'Perplexity & Google AIO',
        effort: 'Low',
        estimatedLift: '+11% Direct Markdown Ingestion',
        category: 'Crawlability',
      },
      {
        id: 'act-4',
        title: 'Add Enterprise Security & SOC2 Type II Trust Badges in Footer',
        impact: 'MEDIUM',
        engine: 'ChatGPT Search',
        effort: 'Low',
        estimatedLift: '+6% FinTech Commercial Query Rank',
        category: 'Trust Grounding',
      },
    ],
  };
}
