import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dispatchAuditForPrompt, PromptAuditResult } from '@/lib/ai/dispatcher';
import { runRecommendationEngineForAuditResults } from '@/lib/ai/recommendation-engine';
import { PromptWithBrand } from '@/types/geo';

// Maximum execution duration for Vercel Cron/Serverless (300 seconds on Pro plans)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Job Handler: /api/cron/run-audits
 * Triggered daily at midnight UTC via vercel.json.
 * 
 * Workflow:
 * 1. Validate CRON_SECRET authorization header.
 * 2. Fetch all active prompts with joined brands & competitors using Supabase Service Role client.
 * 3. Dispatch queries across target AI engines (ChatGPT, Claude, Gemini, Perplexity, etc.).
 * 4. Execute LLM-as-a-Judge evaluation and store results in Supabase.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // ============================================================================
  // 1. Security Check: Validate Cron Secret
  // ============================================================================
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, CRON_SECRET must be configured and match the Bearer token
  if (!cronSecret) {
    console.error('[CRON_AUDIT] CRON_SECRET environment variable is not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is missing.' },
      { status: 500 }
    );
  }

  const expectedAuth = `Bearer ${cronSecret}`;
  if (authHeader !== expectedAuth) {
    console.warn('[CRON_AUDIT] Unauthorized audit trigger attempt rejected.');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ============================================================================
  // 2. Fetch Active Prompts from Supabase
  // ============================================================================
  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[CRON_AUDIT] Failed to initialize Supabase admin client:', message);
    return NextResponse.json(
      { error: `Database initialization failed: ${message}` },
      { status: 500 }
    );
  }

  let activePrompts: PromptWithBrand[] = [];

  try {
    // Select active prompts joining brands and profiles for subscription gatekeeping
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select(`
        id,
        brand_id,
        query,
        category,
        priority,
        engines_tracked,
        is_active,
        brands (
          id,
          name:brand_name,
          brand_name,
          domain,
          industry,
          description,
          user_id,
          profiles (
            subscription_tier
          ),
          competitors (
            id,
            name,
            domain
          )
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.warn('[CRON_AUDIT] Error querying prompts table with joined profiles:', error.message);
      // Fallback with direct query if nested join structure varies
      const { data: fallbackData } = await supabaseAdmin
        .from('prompts')
        .select(`
          id,
          brand_id,
          query,
          category,
          priority,
          engines_tracked,
          is_active,
          brands (
            id,
            brand_name,
            domain,
            user_id
          )
        `)
        .eq('is_active', true);

      if (fallbackData) {
        activePrompts = fallbackData.map((p: any) => ({
          ...p,
          subscription_tier: 'starter',
          brands: p.brands ? {
            ...p.brands,
            name: p.brands.brand_name || p.brands.name || 'Target Brand',
            subscription_tier: 'starter',
          } : null,
        }));
      }
    } else if (data) {
      activePrompts = (data as any[]).map((p) => {
        const brand = p.brands;
        const profile = Array.isArray(brand?.profiles) ? brand.profiles[0] : brand?.profiles;
        const tier = profile?.subscription_tier || brand?.subscription_tier || 'starter';

        return {
          ...p,
          subscription_tier: tier,
          brands: brand
            ? {
                ...brand,
                name: brand.brand_name || brand.name || 'Target Brand',
                subscription_tier: tier,
              }
            : null,
        };
      }) as PromptWithBrand[];
    }
  } catch (fetchErr) {
    console.error('[CRON_AUDIT] Database fetch error:', fetchErr);
    return NextResponse.json(
      { error: 'Failed to fetch active prompts from database' },
      { status: 500 }
    );
  }

  if (!activePrompts || activePrompts.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No active prompts found to audit.',
      promptsAudited: 0,
      durationMs: Date.now() - startTime,
    });
  }

  // ============================================================================
  // 3. Batch Dispatcher (Controlled Concurrency Chunks)
  // ============================================================================
  const CONCURRENCY_LIMIT = 3; // Process 3 prompts at a time to prevent rate limits
  const auditResults: PromptAuditResult[] = [];

  for (let i = 0; i < activePrompts.length; i += CONCURRENCY_LIMIT) {
    const batch = activePrompts.slice(i, i + CONCURRENCY_LIMIT);
    const batchPromises = batch.map((prompt) =>
      dispatchAuditForPrompt(supabaseAdmin, prompt)
    );

    const settled = await Promise.allSettled(batchPromises);
    settled.forEach((res, idx) => {
      if (res.status === 'fulfilled') {
        auditResults.push(res.value);
      } else {
        const failedPrompt = batch[idx];
        auditResults.push({
          promptId: failedPrompt.id,
          query: failedPrompt.query,
          brandName: failedPrompt.brands?.name || 'Unknown',
          engineResults: [],
          status: 'failed',
          error: String(res.reason),
        });
      }
    });
  }

  // ============================================================================
  // 4. Task 2: Action Engine - Process Low-Scoring Prompts (< 50) for Recommendations
  // ============================================================================
  let newRecommendations: any[] = [];
  try {
    newRecommendations = await runRecommendationEngineForAuditResults(
      supabaseAdmin,
      auditResults,
      activePrompts
    );
    console.log(
      `[CRON_AUDIT] Generated ${newRecommendations.length} action recommendations for low-scoring audits.`
    );
  } catch (recErr) {
    console.error('[CRON_AUDIT] Error generating action recommendations:', recErr);
  }

  // ============================================================================
  // 5. Return Audit Summary
  // ============================================================================
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
      totalPrompts: activePrompts.length,
      completedAudits,
      partialAudits,
      failedAudits,
      totalEnginesDispatched,
      recommendationsGenerated: newRecommendations.length,
    },
    results: auditResults,
    recommendations: newRecommendations,
  });
}

