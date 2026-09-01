import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dispatchAuditForPrompt, PromptAuditResult } from '@/lib/ai/dispatcher';
import { runRecommendationEngineForAuditResults } from '@/lib/ai/recommendation-engine';
import { PromptWithBrand, AIEngine } from '@/types/geo';

export const maxDuration = 300;

export const dynamic = 'force-dynamic';

/**
 * Vercel Cron Endpoint: /api/cron/process-scheduled-audits
 * Triggered periodically via Vercel Cron (e.g. hourly or daily).
 * Checks Supabase for any user schedules due for execution and runs them automatically.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // 1. Security Check: Validate Cron Secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON_SCHEDULED] CRON_SECRET environment variable is not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is missing.' },
      { status: 500 }
    );
  }

  const expectedAuth = `Bearer ${cronSecret}`;
  if (authHeader !== expectedAuth) {
    console.warn('[CRON_SCHEDULED] Unauthorized scheduled audit trigger rejected.');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch (err: any) {
    console.error('[CRON_SCHEDULED] Failed to initialize Supabase admin client:', err);
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 });
  }

  try {
    const nowIso = new Date().toISOString();

    // 2. Fetch all active schedules due for execution
    const { data: dueSchedules, error: schedErr } = await admin
      .from('audit_schedules')
      .select(`
        id,
        user_id,
        brand_id,
        frequency,
        is_enabled,
        last_run_at,
        next_run_at,
        brands (
          id,
          brand_name,
          domain,
          competitors,
          profiles (
            subscription_tier
          )
        )
      `)
      .eq('is_enabled', true)
      .lte('next_run_at', nowIso);

    if (schedErr) {
      console.warn('[CRON_SCHEDULED] Error querying audit_schedules table:', schedErr.message);
      return NextResponse.json({
        success: false,
        error: `Failed to query schedules: ${schedErr.message}`,
      }, { status: 500 });
    }

    if (!dueSchedules || dueSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled audits currently due.',
        schedulesProcessed: 0,
        durationMs: Date.now() - startTime,
      });
    }

    const processedSummaries: any[] = [];

    // 3. Process each due schedule
    for (const schedule of dueSchedules) {
      const brand = Array.isArray(schedule.brands) ? schedule.brands[0] : schedule.brands;
      if (!brand) continue;

      const profile = Array.isArray(brand.profiles) ? brand.profiles[0] : brand.profiles;
      const userTier = profile?.subscription_tier || 'starter';

      // Fetch active prompts for this brand
      const { data: promptRows } = await admin
        .from('prompts')
        .select('*')
        .eq('brand_id', schedule.brand_id)
        .eq('is_active', true);

      if (!promptRows || promptRows.length === 0) {
        // Still update next_run_at so we don't spin indefinitely
        await updateScheduleNextRun(admin, schedule.id, schedule.frequency);
        continue;
      }

      const rawCompetitors: string[] = Array.isArray(brand.competitors) ? brand.competitors : [];
      const formattedCompetitors = rawCompetitors.map((c, idx) => ({
        id: `c-${idx + 1}`,
        name: c,
        domain: `${c.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      }));

      const promptsToAudit: PromptWithBrand[] = promptRows.map((p) => {
        const customEngines: AIEngine[] = Array.isArray(p.target_engines) && p.target_engines.length > 0
          ? (p.target_engines.map((e: string) => e.toLowerCase().replace(/\s+/g, '_')) as AIEngine[])
          : userTier === 'pro' || userTier === 'enterprise'
          ? (['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot', 'google_aio'] as AIEngine[])
          : (['chatgpt', 'claude', 'perplexity', 'gemini'] as AIEngine[]);

        return {
          id: p.id,
          brand_id: brand.id,
          query: p.query,
          category: 'High-Intent Commercial',
          priority: 'high',
          engines_tracked: customEngines,
          is_active: true,
          subscription_tier: userTier,
          brands: {
            id: brand.id,
            name: brand.brand_name || 'Brand',
            domain: brand.domain || `${(brand.brand_name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            subscription_tier: userTier,
            competitors: formattedCompetitors,
          },
        };
      });


      const auditResults: PromptAuditResult[] = [];
      for (const prompt of promptsToAudit) {
        try {
          const res = await dispatchAuditForPrompt(admin, prompt);
          auditResults.push(res);
        } catch (err: any) {
          auditResults.push({
            promptId: prompt.id,
            query: prompt.query,
            brandName: brand.brand_name,
            engineResults: [],
            status: 'failed',
            error: err?.message || String(err),
          });
        }
      }

      // Generate action recommendations if needed
      try {
        await runRecommendationEngineForAuditResults(admin, auditResults, promptsToAudit);
      } catch (recErr) {
        console.warn('[CRON_SCHEDULED] Recommendation error:', recErr);
      }

      // Update schedule record
      await updateScheduleNextRun(admin, schedule.id, schedule.frequency);

      processedSummaries.push({
        scheduleId: schedule.id,
        brandId: schedule.brand_id,
        brandName: brand.brand_name,
        promptsAudited: promptsToAudit.length,
        completed: auditResults.filter((r) => r.status === 'completed').length,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      schedulesProcessed: processedSummaries.length,
      summaries: processedSummaries,
    });
  } catch (err: any) {
    console.error('[CRON_SCHEDULED] Execution error:', err);
    return NextResponse.json({
      success: false,
      error: `Scheduled audit processing error: ${err.message}`,
    }, { status: 500 });
  }
}

async function updateScheduleNextRun(admin: any, scheduleId: string, frequency: string) {
  const now = new Date();
  const nextRun = new Date(now);

  if (frequency === 'daily') {
    nextRun.setDate(nextRun.getDate() + 1);
  } else if (frequency === 'monthly') {
    nextRun.setMonth(nextRun.getMonth() + 1);
  } else {
    // weekly
    nextRun.setDate(nextRun.getDate() + 7);
  }

  await admin
    .from('audit_schedules')
    .update({
      last_run_at: now.toISOString(),
      next_run_at: nextRun.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', scheduleId);
}
