import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dispatchAuditForPrompt, PromptAuditResult } from '@/lib/ai/dispatcher';
import { runRecommendationEngineForAuditResults } from '@/lib/ai/recommendation-engine';
import { PromptWithBrand } from '@/types/geo';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * POST /api/audit/trigger
 * Triggers an immediate evaluation audit across all AI engines
 * for the logged-in user's active prompts.
 */
export async function POST(_request: NextRequest) {
  const startTime = Date.now();

  try {
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

    // 2. Get active prompts for this brand
    const { data: promptRows, error: promptErr } = await admin
      .from('prompts')
      .select('*')
      .eq('brand_id', brandRow.id)
      .eq('is_active', true);

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
          error: 'No active prompts found. Add and activate prompts in your Brand Kit first.',
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

    const promptsToAudit: PromptWithBrand[] = promptRows.map((p) => ({
      id: p.id,
      brand_id: brandRow.id,
      query: p.query,
      category: 'High-Intent Commercial',
      priority: 'high',
      engines_tracked: userTier === 'pro' || userTier === 'enterprise'
        ? ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot', 'google_aio']
        : ['chatgpt', 'claude', 'perplexity', 'gemini'],
      is_active: true,
      subscription_tier: userTier,
      brands: {
        id: brandRow.id,
        name: brandRow.brand_name,
        domain: (brandRow as any).domain || `${brandRow.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        subscription_tier: userTier,
        competitors: formattedCompetitors,
      },
    }));

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
