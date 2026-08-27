'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface DbResponseLog {
  id: string;
  timestamp: string;
  timeAgo: string;
  engine: string;
  engineIconColor: string;
  engineBg: string;
  prompt: string;
  pillar: string;
  intent: string;
  rawResponse: string;
  visibilityScore: number;
  mentionRank: number;
  sentiment: string;
  citations: { url: string; domain: string; position: number }[];
  competitorsMentioned: { name: string; rank: number }[];
}

export async function getResponseHistory(brandId?: string): Promise<{ success: boolean; data: DbResponseLog[]; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    let targetBrandId = brandId;
    if (!targetBrandId) {
      const { data: brand } = await admin
        .from('brands')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!brand) {
        return { success: true, data: [] };
      }
      targetBrandId = brand.id;
    }

    // 1. Fetch prompts for this brand
    const { data: prompts } = await admin
      .from('prompts')
      .select('id, query, pillar, intent')
      .eq('brand_id', targetBrandId);

    if (!prompts || prompts.length === 0) {
      return { success: true, data: [] };
    }

    const promptMap = new Map<string, { query: string; pillar: string; intent: string }>();
    prompts.forEach((p) => promptMap.set(p.id, { query: p.query, pillar: p.pillar || 'GEO', intent: p.intent || 'Informational' }));

    const promptIds = prompts.map((p) => p.id);

    // 2. Fetch runs for these prompts
    const { data: runs } = await admin
      .from('runs')
      .select('id, prompt_id, created_at')
      .in('prompt_id', promptIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!runs || runs.length === 0) {
      return { success: true, data: [] };
    }

    const runMap = new Map<string, { promptId: string; createdAt: string }>();
    runs.forEach((r) => runMap.set(r.id, { promptId: r.prompt_id, createdAt: r.created_at }));

    const runIds = runs.map((r) => r.id);

    // 3. Fetch engine responses
    const { data: responses, error: respErr } = await admin
      .from('engine_responses')
      .select('*')
      .in('run_id', runIds)
      .order('created_at', { ascending: false });

    if (respErr) throw respErr;
    if (!responses || responses.length === 0) {
      return { success: true, data: [] };
    }

    const responseIds = responses.map((r) => r.id);

    // 4. Fetch citations
    const { data: citations } = await admin
      .from('citations')
      .select('*')
      .in('response_id', responseIds);

    const citationMap = new Map<string, any[]>();
    (citations || []).forEach((c) => {
      if (!citationMap.has(c.response_id)) citationMap.set(c.response_id, []);
      citationMap.get(c.response_id)!.push(c);
    });

    const engineMetaMap: Record<string, { name: string; color: string; bg: string }> = {
      chatgpt: {
        name: 'ChatGPT 4o',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
      },
      perplexity: {
        name: 'Perplexity Sonar',
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300',
      },
      claude: {
        name: 'Claude 3.5',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
      },
      gemini: {
        name: 'Gemini Flash',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
      },
      copilot: {
        name: 'Copilot',
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
      },
    };

    const logs: DbResponseLog[] = responses.map((resp) => {
      const runInfo = runMap.get(resp.run_id);
      const promptInfo = runInfo ? promptMap.get(runInfo.promptId) : null;
      const respCits = citationMap.get(resp.id) || [];

      const rawEng = (resp.engine_name || 'chatgpt').toLowerCase();
      const engMeta = engineMetaMap[rawEng] || {
        name: resp.engine_name || 'AI Engine',
        color: 'text-gray-600',
        bg: 'bg-gray-50 border-gray-200 text-gray-700',
      };

      const dateObj = new Date(resp.created_at);
      const timeAgo = formatTimeAgo(dateObj);
      const formattedTimestamp = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const score = typeof resp.visibility_score === 'number' ? resp.visibility_score : 0;
      const rank = score >= 80 ? 1 : score >= 50 ? 2 : 3;

      return {
        id: resp.id,
        timestamp: formattedTimestamp,
        timeAgo,
        engine: engMeta.name,
        engineIconColor: engMeta.color,
        engineBg: engMeta.bg,
        prompt: promptInfo?.query || 'Prompt Query',
        pillar: promptInfo?.pillar || 'GEO',
        intent: promptInfo?.intent || 'Informational',
        rawResponse: resp.raw_text || 'No raw transcript recorded.',
        visibilityScore: score,
        mentionRank: rank,
        sentiment: (resp.sentiment as any) || (score >= 70 ? 'Positive' : 'Neutral'),
        citations: respCits.map((c, idx) => ({
          url: c.url,
          domain: c.domain || c.url.replace(/^https?:\/\//, '').split('/')[0],
          position: idx + 1,
        })),
        competitorsMentioned: [],
      };
    });

    return { success: true, data: logs };
  } catch (err: any) {
    console.error('getResponseHistory error:', err);
    return { success: false, data: [], error: err.message };
  }
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
