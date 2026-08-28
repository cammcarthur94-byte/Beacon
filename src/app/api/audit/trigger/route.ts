import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dispatchAuditForPrompt, PromptAuditResult } from '@/lib/ai/dispatcher';
import { runRecommendationEngineForAuditResults } from '@/lib/ai/recommendation-engine';
import { PromptWithBrand, AIEngine } from '@/types/geo';


export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * POST /api/audit/trigger
 * Triggers an immediate evaluation audit across all AI engines
 * for the logged-in user's active prompts.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let body: { promptIds?: string[] } = {};
    try {
      body = await request.json();
    } catch {
      // Empty or non-JSON body is acceptable (defaults to all active prompts)
    }

    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    // 1. Get user's brand and profile subscription tier
    const [brandRes, profileRes] = await Promise.all([
      admin
        .from('brands')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .maybeSingle(),
    ]);

    const { data: brandRow, error: brandErr } = brandRes;
    const userTier = profileRes.data?.subscription_tier || 'starter';

    if (brandErr) {
      console.error('[AUDIT_TRIGGER] Brand fetch error:', brandErr.message);
    }

    if (!brandRow) {
      return NextResponse.json(
        {
          success: false,
          error: 'No brand profile configured. Please set up your Brand Kit first.',
        },
        { status: 400 }
      );
    }

    // 2. Get prompts for this brand (filtered by promptIds if provided)
    let promptQuery = admin
      .from('prompts')
      .select('*')
      .eq('brand_id', brandRow.id);

    if (body.promptIds && Array.isArray(body.promptIds) && body.promptIds.length > 0) {
      promptQuery = promptQuery.in('id', body.promptIds);
    } else {
      promptQuery = promptQuery.eq('is_active', true);
    }

    const { data: promptRows, error: promptErr } = await promptQuery;

    if (promptErr) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch prompts: ${promptErr.message}`,
        },
        { status: 500 }
      );
    }

    if (!promptRows || promptRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No matching active prompts found to audit.',
        },
        { status: 400 }
      );
    }

    // Format competitors
    const rawCompetitors: string[] = Array.isArray(brandRow.competitors)
      ? brandRow.competitors
      : [];

    const formattedCompetitors = rawCompetitors.map((c, idx) => ({
      id: `c-${idx + 1}`,
      name: c,
      domain: `${c.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    }));

    const promptsToAudit: PromptWithBrand[] = promptRows.map((p) => {
      // Map stored target engines to normalized engine identifiers
      const customEngines: AIEngine[] = Array.isArray(p.target_engines) && p.target_engines.length > 0
        ? (p.target_engines.map((e: string) => e.toLowerCase().replace(/\s+/g, '_')) as AIEngine[])
        : userTier === 'pro' || userTier === 'enterprise'
        ? (['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot', 'google_aio'] as AIEngine[])
        : (['chatgpt', 'claude', 'perplexity', 'gemini'] as AIEngine[]);

      return {
        id: p.id,
        brand_id: brandRow.id,
        query: p.query,
        category: 'High-Intent Commercial',
        priority: 'high',
        engines_tracked: customEngines,
        is_active: true,
        subscription_tier: userTier,
        brands: {
          id: brandRow.id,
          name: brandRow.brand_name,
          domain: (brandRow as any).domain || `${brandRow.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          subscription_tier: userTier,
          competitors: formattedCompetitors,
        },
      };
    });


    // 3. Execute audits for the active prompts
    const auditResults: PromptAuditResult[] = [];

    for (const prompt of promptsToAudit) {
      try {
        const result = await dispatchAuditForPrompt(admin, prompt);
        auditResults.push(result);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`Audit failed for prompt "${prompt.query}":`, errorMsg);
        auditResults.push({
          promptId: prompt.id,
          query: prompt.query,
          brandName: brandRow.brand_name,
          engineResults: [],
          status: 'failed',
          error: errorMsg,
        });
      }
    }

    // 4. Process low-scoring audits for action recommendations
    let recommendations: any[] = [];
    try {
      recommendations = await runRecommendationEngineForAuditResults(
        admin,
        auditResults,
        promptsToAudit
      );
    } catch (recErr) {
      console.warn('[AUDIT_TRIGGER] Recommendation engine warning:', recErr);
    }

    const totalEnginesDispatched = auditResults.reduce(
      (acc, r) => acc + r.engineResults.length,
      0
    );
    const completedAudits = auditResults.filter((r) => r.status === 'completed').length;
    const partialAudits = auditResults.filter((r) => r.status === 'partial').length;
    const failedAudits = auditResults.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      summary: {
        totalPrompts: promptsToAudit.length,
        completedAudits,
        partialAudits,
        failedAudits,
        totalEnginesDispatched,
        recommendationsGenerated: recommendations.length,
      },
      results: auditResults,
      recommendations,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[AUDIT_TRIGGER] Unexpected error:', errorMsg);
    return NextResponse.json(
      { success: false, error: `Audit dispatch error: ${errorMsg}` },
      { status: 500 }
    );
  }
}
