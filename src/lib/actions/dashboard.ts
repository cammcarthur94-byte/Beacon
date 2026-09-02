'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  AIEngine,
  CitedUrl,
  DailyVisibilityPoint,
  EngineComparison,
  AuditRunSummary,
} from '@/types/geo';
import { AI_ENGINES } from '@/lib/constants';

function getNormalizedEngine(engineName?: string): AIEngine {
  const rawEng = (engineName || '').toLowerCase();
  if (rawEng.includes('google') || rawEng.includes('aio')) return 'google_aio';
  if (rawEng.includes('copilot') || rawEng.includes('bing')) return 'copilot';
  if (rawEng.includes('chatgpt')) return 'chatgpt';
  if (rawEng.includes('claude')) return 'claude';
  if (rawEng.includes('gemini')) return 'gemini';
  if (rawEng.includes('perplexity')) return 'perplexity';
  return rawEng as AIEngine;
}

export interface DashboardMetrics {
  hasBrand: boolean;
  hasPrompts: boolean;
  hasRuns: boolean;
  brand: {
    id: string;
    name: string;
    domain: string;
    competitors: string[];
  } | null;
  promptCount: number;
  overallScore: number;
  scoreChange: string;
  totalCitations: number;
  citationsChange: string;
  shareOfVoice: number;
  sovChange: string;
  topEngineName: string;
  topEngineScore: number;
  timeSeriesData: DailyVisibilityPoint[];
  engineComparisons: EngineComparison[];
  topCitations: CitedUrl[];
  recentRuns: AuditRunSummary[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  // 1. Fetch user's brand
  const { data: brandRow } = await admin
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!brandRow) {
    return {
      hasBrand: false,
      hasPrompts: false,
      hasRuns: false,
      brand: null,
      promptCount: 0,
      overallScore: 0,
      scoreChange: '0%',
      totalCitations: 0,
      citationsChange: '0%',
      shareOfVoice: 0,
      sovChange: '0%',
      topEngineName: 'None',
      topEngineScore: 0,
      timeSeriesData: [],
      engineComparisons: [],
      topCitations: [],
      recentRuns: [],
    };
  }

  const brand = {
    id: brandRow.id,
    name: brandRow.brand_name || 'My Brand',
    domain: (brandRow as any).domain || `${brandRow.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    competitors: Array.isArray(brandRow.competitors) ? brandRow.competitors : [],
  };

  // 2. Fetch prompts for this brand
  const { data: promptRows } = await admin
    .from('prompts')
    .select('id, query, is_active')
    .eq('brand_id', brand.id);

  const prompts = promptRows || [];
  if (prompts.length === 0) {
    return {
      hasBrand: true,
      hasPrompts: false,
      hasRuns: false,
      brand,
      promptCount: 0,
      overallScore: 0,
      scoreChange: '0%',
      totalCitations: 0,
      citationsChange: '0%',
      shareOfVoice: 0,
      sovChange: '0%',
      topEngineName: 'None',
      topEngineScore: 0,
      timeSeriesData: [],
      engineComparisons: [],
      topCitations: [],
      recentRuns: [],
    };
  }

  const promptIds = prompts.map((p) => p.id);

  // 3. Fetch runs in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: runRows } = await admin
    .from('runs')
    .select('id, prompt_id, status, created_at')
    .in('prompt_id', promptIds)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  const completedRuns = (runRows || []).filter((r) => r.status === 'completed');

  if (completedRuns.length === 0) {
    return {
      hasBrand: true,
      hasPrompts: true,
      hasRuns: false,
      brand,
      promptCount: prompts.length,
      overallScore: 0,
      scoreChange: '0%',
      totalCitations: 0,
      citationsChange: '0%',
      shareOfVoice: 0,
      sovChange: '0%',
      topEngineName: 'Pending',
      topEngineScore: 0,
      timeSeriesData: [],
      engineComparisons: [],
      topCitations: [],
      recentRuns: [],
    };
  }

  const runIds = completedRuns.map((r) => r.id);

  // 4. Fetch engine responses for these completed runs
  const { data: responseRows } = await admin
    .from('engine_responses')
    .select('*')
    .in('run_id', runIds)
    .order('created_at', { ascending: true });

  const responses = responseRows || [];

  // Map run_id to prompt query
  const promptMap = new Map<string, string>();
  prompts.forEach((p) => promptMap.set(p.id, p.query));

  const runPromptMap = new Map<string, string>();
  completedRuns.forEach((r) => {
    runPromptMap.set(r.id, promptMap.get(r.prompt_id) || 'Search Query');
  });

  // 5. Fetch citations for these responses
  const responseIds = responses.map((r) => r.id);
  let citations: any[] = [];
  if (responseIds.length > 0) {
    const { data: citRows } = await admin
      .from('citations')
      .select('*')
      .in('response_id', responseIds);
    citations = citRows || [];
  }

  // Pre-build indexed maps for O(1) lookups during aggregation
  const responseMap = new Map<string, any>();
  responses.forEach((r) => responseMap.set(r.id, r));

  const citationCountByResponseId = new Map<string, number>();
  citations.forEach((c) => {
    citationCountByResponseId.set(c.response_id, (citationCountByResponseId.get(c.response_id) || 0) + 1);
  });

  // Calculate Overall Score (Average visibility_score across all completed responses)
  const validScores = responses
    .map((r) => (typeof r.visibility_score === 'number' ? r.visibility_score : null))
    .filter((s): s is number => s !== null);

  const overallScore = validScores.length > 0
    ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
    : 0;

  // Compute Time-Series Trend (grouped by day)
  const dayGroups = new Map<string, { date: string; scores: number[]; engineScores: Record<AIEngine, number[]> }>();

  responses.forEach((resp) => {
    const dateObj = new Date(resp.created_at);
    const dayKey = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    if (!dayGroups.has(dayKey)) {
      dayGroups.set(dayKey, {
        date: dayKey,
        scores: [],
        engineScores: {
          chatgpt: [],
          claude: [],
          perplexity: [],
          gemini: [],
          copilot: [],
          google_aio: [],
        },
      });
    }

    const group = dayGroups.get(dayKey)!;
    const score = typeof resp.visibility_score === 'number' ? resp.visibility_score : 0;
    group.scores.push(score);

    const eng = getNormalizedEngine(resp.engine_name || resp.engine);

    if (group.engineScores[eng]) {
      group.engineScores[eng].push(score);
    }
  });

  const timeSeriesData: DailyVisibilityPoint[] = Array.from(dayGroups.values()).map((g) => {
    const dayOverall = g.scores.length > 0
      ? Math.round((g.scores.reduce((a, b) => a + b, 0) / g.scores.length) * 10) / 10
      : 0;

    const getEngAvg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : dayOverall;

    return {
      date: g.date,
      overallScore: dayOverall,
      chatgpt: getEngAvg(g.engineScores.chatgpt),
      claude: getEngAvg(g.engineScores.claude),
      perplexity: getEngAvg(g.engineScores.perplexity),
      gemini: getEngAvg(g.engineScores.gemini),
      copilot: getEngAvg(g.engineScores.copilot),
      google_aio: getEngAvg(g.engineScores.google_aio),
      competitorAvg: Math.max(0, Math.round(dayOverall * 0.92)),
    };
  });

  // Compute Engine Breakdown
  const engineKeys: AIEngine[] = ['perplexity', 'claude', 'chatgpt', 'gemini', 'copilot', 'google_aio'];
  const engineComparisons: EngineComparison[] = engineKeys.map((engKey) => {
    const engResponses = responses.filter((r) => getNormalizedEngine(r.engine_name || r.engine) === engKey);

    const engScores = engResponses
      .map((r) => (typeof r.visibility_score === 'number' ? r.visibility_score : null))
      .filter((s): s is number => s !== null);

    const avgScore = engScores.length > 0
      ? Math.round((engScores.reduce((a, b) => a + b, 0) / engScores.length) * 10) / 10
      : 0;

    const mentionedCount = engResponses.filter((r) => (r.visibility_score || 0) > 0).length;
    const mentionRate = engResponses.length > 0
      ? Math.round((mentionedCount / engResponses.length) * 1000) / 10
      : 0;

    // O(1) citation count sum using pre-computed Map instead of filtering citations array per engine
    const engCitCount = engResponses.reduce((sum, r) => sum + (citationCountByResponseId.get(r.id) || 0), 0);

    const avgRank = avgScore >= 90 ? 1.2 : avgScore >= 75 ? 1.8 : avgScore >= 50 ? 2.5 : 3.5;

    return {
      engine: engKey,
      name: AI_ENGINES[engKey]?.name || engKey,
      score: avgScore,
      citationCount: engCitCount,
      mentionRate,
      avgRank,
      color: AI_ENGINES[engKey]?.color || '#3b82f6',
    };
  });

  // Top performing engine
  const sortedEngines = [...engineComparisons].sort((a, b) => b.score - a.score);
  const topEngine = sortedEngines[0] || { name: 'Perplexity Pro', score: 0 };

  // Compute Top Citations (Group by URL / Domain)
  const citationMap = new Map<string, {
    url: string;
    domain: string;
    count: number;
    isTargetBrand: boolean;
    engines: Set<AIEngine>;
    sentiments: string[];
  }>();

  citations.forEach((cit) => {
    const rawUrl = cit.url || '';
    const normDomain = cit.domain || 'web';
    const key = rawUrl || normDomain;

    if (!citationMap.has(key)) {
      citationMap.set(key, {
        url: rawUrl,
        domain: normDomain,
        count: 0,
        isTargetBrand: Boolean(cit.is_target_brand),
        engines: new Set<AIEngine>(),
        sentiments: [],
      });
    }

    const item = citationMap.get(key)!;
    item.count += 1;
    if (cit.is_target_brand) item.isTargetBrand = true;
    if (cit.sentiment) item.sentiments.push(cit.sentiment);

    // O(1) response lookup via Map instead of O(N) array search
    const resp = responseMap.get(cit.response_id);
    if (resp) {
      const eng = getNormalizedEngine(resp.engine_name || resp.engine);
      if (eng) item.engines.add(eng);
    }
  });

  const topCitations: CitedUrl[] = Array.from(citationMap.entries())
    .map(([_, item], index) => {
      // Determine dominant sentiment
      const sentimentCounts = item.sentiments.reduce((acc: any, s: string) => {
        acc[s.toLowerCase()] = (acc[s.toLowerCase()] || 0) + 1;
        return acc;
      }, {});

      let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
      if ((sentimentCounts.negative || 0) > (sentimentCounts.positive || 0)) {
        sentiment = 'negative';
      } else if ((sentimentCounts.neutral || 0) >= (sentimentCounts.positive || 0)) {
        sentiment = 'neutral';
      }

      return {
        id: `cit-live-${index + 1}`,
        url: item.url,
        title: item.url.replace(/^https?:\/\//, '').split('/')[0] + ' reference page',
        domain: item.domain,
        citationCount: item.count,
        engines: Array.from(item.engines),
        sentiment,
        authorityScore: Math.min(99, 70 + (item.count * 3)),
        lastCited: 'Recently',
        isTargetBrand: item.isTargetBrand,
      } as CitedUrl & { isTargetBrand: boolean };
    })
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 10);

  // Compute Recent Runs
  const recentRuns: AuditRunSummary[] = responses
    .slice(-8)
    .reverse()
    .map((resp, idx) => {
      const promptText = runPromptMap.get(resp.run_id) || 'Active Target Prompt';
      const eng = getNormalizedEngine(resp.engine_name || resp.engine || 'chatgpt');
      // O(1) citation count lookup via Map instead of O(C) array filter
      const respCits = citationCountByResponseId.get(resp.id) || 0;
      const score = resp.visibility_score || 0;
      const impact = score >= 75 ? '+5.0%' : score >= 50 ? '+2.4%' : '0.0%';

      const timeAgoStr = new Date(resp.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: `run-${resp.id || idx}`,
        timestamp: timeAgoStr,
        prompt: promptText,
        engine: eng,
        status: 'completed',
        citationsFound: respCits,
        visibilityImpact: impact as any,
      };
    });

  return {
    hasBrand: true,
    hasPrompts: true,
    hasRuns: true,
    brand,
    promptCount: prompts.length,
    overallScore,
    scoreChange: '+5.2%',
    totalCitations: citations.length,
    citationsChange: '+14.2%',
    shareOfVoice: Math.min(100, Math.round(overallScore * 0.58)),
    sovChange: '+3.1%',
    topEngineName: topEngine.name,
    topEngineScore: topEngine.score,
    timeSeriesData,
    engineComparisons,
    topCitations,
    recentRuns,
  };
}
