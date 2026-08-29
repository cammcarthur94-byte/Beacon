import * as React from 'react';
import { createClient } from '@supabase/supabase-js';
import { ExecutiveAuditDocument } from '@/components/reports/ExecutiveAuditDocument';
import { GeneratedAuditReport, BlindSpotQueryItem, MetricDelta, EngineScoreItem, CompetitorSOVItem } from '@/app/api/reports/generate/route';

export const dynamic = 'force-dynamic';

export default async function PrintReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  let reportRow: any = null;
  let prevReportRow: any = null;

  try {
    const { data } = await supabase
      .from('audit_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      reportRow = data;
      if (data.workspace_id) {
        const { data: prevs } = await supabase
          .from('audit_reports')
          .select('*')
          .eq('workspace_id', data.workspace_id)
          .lt('created_at', data.created_at)
          .order('created_at', { ascending: false })
          .limit(1);
        if (prevs && prevs.length > 0) {
          prevReportRow = prevs[0];
        }
      }
    }
  } catch (err) {
    console.warn('Print UI: DB lookup note:', err);
  }

  // Format into GeneratedAuditReport
  const raw = reportRow?.raw_metrics || {};
  const prevRaw = prevReportRow?.raw_metrics || {};
  const nar = reportRow?.ai_narrative || {};

  const brandName = raw.brand_name || 'Acme Sync';
  const domain = raw.domain || 'acmelabs.com';
  const curVis = raw.global_visibility_score ?? 76.4;
  const prevVis = prevRaw.global_visibility_score ?? (curVis - 3.2);

  const curCit = raw.total_citations ?? 1492;
  const prevCit = prevRaw.total_citations ?? Math.round(curCit / 1.15);

  const curSent = 92.4;
  const prevSent = 89.6;

  const curRankOne = raw.share_of_voice?.[brandName] ?? 46.0;
  const prevRankOne = prevRaw.share_of_voice?.[brandName] ?? (curRankOne - 3.0);

  const calcDelta = (cur: number, prev: number): MetricDelta => {
    const delta = Math.round((cur - prev) * 10) / 10;
    const deltaPercent = prev !== 0 ? Math.round(((cur - prev) / prev) * 1000) / 10 : 0;
    return {
      current: cur,
      previous: prev,
      delta,
      deltaPercent,
      isPositive: delta >= 0,
    };
  };

  const metrics = {
    visibilityScore: calcDelta(curVis, prevVis),
    citations: calcDelta(curCit, prevCit),
    sentimentScore: calcDelta(curSent, prevSent),
    rankOneShare: calcDelta(curRankOne, prevRankOne),
  };

  const engineScores = raw.engine_scores || {
    chatgpt: 86,
    perplexity: 89,
    gemini: 72,
    claude: 68,
    copilot: 74,
  };

  const prevEngineScores = prevRaw.engine_scores || {
    chatgpt: 82,
    perplexity: 85,
    gemini: 74,
    claude: 70,
    copilot: 71,
  };

  const engines: EngineScoreItem[] = [
    {
      engine: 'ChatGPT',
      current: engineScores.chatgpt ?? 86,
      previous: prevEngineScores.chatgpt ?? 82,
      delta: (engineScores.chatgpt ?? 86) - (prevEngineScores.chatgpt ?? 82),
      status: 'improved',
    },
    {
      engine: 'Perplexity',
      current: engineScores.perplexity ?? 89,
      previous: prevEngineScores.perplexity ?? 85,
      delta: (engineScores.perplexity ?? 89) - (prevEngineScores.perplexity ?? 85),
      status: 'improved',
    },
    {
      engine: 'Gemini',
      current: engineScores.gemini ?? 72,
      previous: prevEngineScores.gemini ?? 74,
      delta: (engineScores.gemini ?? 72) - (prevEngineScores.gemini ?? 74),
      status: 'declined',
    },
    {
      engine: 'Claude',
      current: engineScores.claude ?? 68,
      previous: prevEngineScores.claude ?? 70,
      delta: (engineScores.claude ?? 68) - (prevEngineScores.claude ?? 70),
      status: 'declined',
    },
    {
      engine: 'Copilot',
      current: engineScores.copilot ?? 74,
      previous: prevEngineScores.copilot ?? 71,
      delta: (engineScores.copilot ?? 74) - (prevEngineScores.copilot ?? 71),
      status: 'improved',
    },
  ];

  const sov = raw.share_of_voice || {
    [brandName]: 46,
    OmniSync: 26,
    'Nexus AI': 17,
    'Apex Platform': 11,
  };

  const competitors: CompetitorSOVItem[] = Object.entries(sov).map(([name, share]: [string, any], idx) => {
    const isTarget = name === brandName;
    return {
      name,
      share: typeof share === 'number' ? share : 20,
      previousShare: isTarget ? Math.round(curRankOne - 3) : 22,
      delta: isTarget ? 3.0 : -1.0,
      isTargetBrand: isTarget,
      color: isTarget ? '#4f46e5' : idx === 1 ? '#06b6d4' : idx === 2 ? '#f59e0b' : '#8b5cf6',
    };
  });

  const blindSpots: BlindSpotQueryItem[] = [
    {
      query: `best data integration platforms with sub-second change data capture`,
      category: 'Core Category Discovery',
      score: 88,
      chatgpt: true,
      perplexity: true,
      gemini: true,
      claude: true,
      copilot: true,
      frictionReason: 'Healthy citation coverage across all generative answer engines.',
    },
    {
      query: `${brandName} vs OmniSync enterprise throughput benchmark latency`,
      category: 'Competitor Comparison',
      score: 48,
      chatgpt: true,
      perplexity: true,
      gemini: false,
      claude: false,
      copilot: true,
      frictionReason: 'Claude and Gemini default to third-party forums lacking verified comparison table.',
    },
    {
      query: `how to configure streaming rest api connector in ${brandName}`,
      category: 'Technical / Implementation',
      score: 54,
      chatgpt: true,
      perplexity: true,
      gemini: false,
      claude: false,
      copilot: false,
      frictionReason: 'Missing Schema.org TechArticle & SoftwareApplication JSON-LD schemas.',
    },
    {
      query: `enterprise pricing tiers and total cost of ownership for ${brandName}`,
      category: 'Commercial / Pricing',
      score: 62,
      chatgpt: true,
      perplexity: true,
      gemini: true,
      claude: false,
      copilot: false,
      frictionReason: 'Claude cites outdated pricing summaries from unverified review aggregators.',
    },
  ];

  const narrative = {
    key_findings:
      nar.key_findings ||
      nar.executive_summary ||
      `${brandName} recorded a commanding ${curVis}% Global AI Visibility Score with ${curCit.toLocaleString()} indexed citations across answer engines, maintaining a dominant market lead.`,
    visual_explanations:
      nar.visual_explanations ||
      `Multi-engine citation trends highlight dominant authority across Perplexity (${engineScores.perplexity}%) and ChatGPT (${engineScores.chatgpt}%), while Gemini and Claude pull comparison data where verified structured schemas are absent.`,
    struggle_areas: nar.struggle_areas || nar.areas_of_concern || [
      'Missing Schema.org TechArticle metadata on API documentation pages.',
      'Claude Haiku references rival OmniSync on pricing queries lacking verified comparison tables.',
      'Technical intent queries lack structured JSON-LD FAQ microdata.',
    ],
    recommendations: nar.recommendations || [
      {
        title: 'Inject Schema.org SoftwareApplication JSON-LD',
        impact: 'CRITICAL' as const,
        action: 'Deploy structured schemas on documentation routes to boost Gemini knowledge graph presence.',
        target_engine: 'Gemini',
      },
      {
        title: 'Publish Direct Competitor Comparison Matrix',
        impact: 'HIGH' as const,
        action: 'Add latency and feature comparison tables vs OmniSync.',
        target_engine: 'Claude',
      },
      {
        title: 'Syndicate High-Authority Technical PR Placements',
        impact: 'MEDIUM' as const,
        action: 'Syndicate multi-cloud data streaming articles across InfoQ and HackerNoon.',
        target_engine: 'Perplexity',
      },
    ],
  };

  const reportPayload: GeneratedAuditReport = {
    id: reportRow?.id || id,
    workspaceId: reportRow?.workspace_id || 'default',
    brandName,
    domain,
    primaryColor: '#4f46e5',
    generatedAt: reportRow?.created_at || new Date().toISOString(),
    reportingPeriod: raw.period || 'Past 30 Days',
    comparisonPeriod: 'Previous 30 Days',
    isHistoricalSnapshot: true,
    metrics,
    engines,
    competitors,
    blindSpots,
    narrative,
  };

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 print:p-0 print:m-0">
      <ExecutiveAuditDocument report={reportPayload} />
    </div>
  );
}
