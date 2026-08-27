'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { PromptQuery } from '@/types/geo';

export interface BrandProfileInput {
  name: string;
  domain?: string;
  industry?: string;
  description?: string;
  competitors: string[];
}

export interface BrandKitState {
  brand: {
    id: string;
    name: string;
    domain: string;
    industry: string;
    description: string;
    competitors: { id: string; name: string; domain: string }[];
  } | null;
  prompts: PromptQuery[];
}

/**
 * Fetch Brand Kit profile and prompts for the logged-in user.
 */
export async function getBrandKitData(): Promise<BrandKitState> {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  // 1. Fetch user's brand
  const { data: brandRow, error: brandError } = await admin
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (brandError) {
    console.error('[BRAND_KIT_ACTION] Error fetching brand:', brandError.message);
  }

  if (!brandRow) {
    return {
      brand: null,
      prompts: [],
    };
  }

  // Parse competitors array from text[] into objects
  const rawCompetitors: string[] = Array.isArray(brandRow.competitors)
    ? brandRow.competitors
    : [];

  const parsedCompetitors = rawCompetitors.map((compStr, idx) => {
    // Handle potential "Name (domain.com)" or just "Name"
    const match = compStr.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const name = match ? match[1].trim() : compStr;
    const domain = match && match[2] ? match[2].trim() : `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
    return {
      id: `c-${idx + 1}`,
      name,
      domain,
    };
  });

  // 2. Fetch prompts for the brand
  const { data: promptRows, error: promptsError } = await admin
    .from('prompts')
    .select(`
      id,
      query,
      is_active,
      created_at,
      runs (
        id,
        status,
        created_at,
        engine_responses (
          visibility_score
        )
      )
    `)
    .eq('brand_id', brandRow.id)
    .order('created_at', { ascending: false });

  if (promptsError) {
    console.error('[BRAND_KIT_ACTION] Error fetching prompts:', promptsError.message);
  }

  const prompts: PromptQuery[] = (promptRows || []).map((row: any) => {
    // Compute last visibility score if available
    const runs = row.runs || [];
    const completedRuns = runs.filter((r: any) => r.status === 'completed');
    const latestRun = completedRuns.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

    let avgScore = 0;
    if (latestRun?.engine_responses?.length) {
      const scores = latestRun.engine_responses
        .map((er: any) => er.visibility_score)
        .filter((s: any) => typeof s === 'number');
      if (scores.length > 0) {
        avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
      }
    }

    const lastAuditedStr = latestRun
      ? new Date(latestRun.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Pending Next Run';

    return {
      id: row.id,
      query: row.query,
      category: 'High-Intent Commercial',
      priority: 'high',
      enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'],
      lastAudited: lastAuditedStr,
      status: row.is_active ? 'active' : 'paused',
      visibilityScore: avgScore,
    };
  });

  return {
    brand: {
      id: brandRow.id,
      name: brandRow.brand_name || '',
      domain: (brandRow as any).domain || `${brandRow.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      industry: (brandRow as any).industry || 'B2B SaaS / Software',
      description: (brandRow as any).description || '',
      competitors: parsedCompetitors,
    },
    prompts,
  };
}

/**
 * Insert or update the brand profile for the user.
 */
export async function saveBrandProfile(input: BrandProfileInput) {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  // Find existing brand
  const { data: existing } = await admin
    .from('brands')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  // Format competitors array
  const formattedCompetitors = input.competitors.map((c) => c.trim()).filter(Boolean);

  let brandId: string;

  if (existing?.id) {
    const { data: updated, error } = await admin
      .from('brands')
      .update({
        brand_name: input.name.trim(),
        competitors: formattedCompetitors,
      })
      .eq('id', existing.id)
      .select('id')
      .single();

    if (error) throw new Error(`Failed to update brand: ${error.message}`);
    brandId = updated.id;
  } else {
    const { data: inserted, error } = await admin
      .from('brands')
      .insert({
        user_id: userId,
        brand_name: input.name.trim(),
        competitors: formattedCompetitors,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create brand: ${error.message}`);
    brandId = inserted.id;
  }

  revalidatePath('/dashboard/brand-kit');
  revalidatePath('/dashboard');
  return { success: true, brandId };
}

/**
 * Add a new search prompt for the user's active brand.
 */
export async function addPrompt(data: { query: string; category?: string }) {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  if (!data.query || !data.query.trim()) {
    throw new Error('Search prompt query cannot be empty.');
  }

  // 1. Get or create user brand
  let { data: brand } = await admin
    .from('brands')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (!brand) {
    const { data: newBrand, error: brandErr } = await admin
      .from('brands')
      .insert({
        user_id: userId,
        brand_name: 'My Brand',
        competitors: [],
      })
      .select('id')
      .single();

    if (brandErr) throw new Error(`Could not initialize brand: ${brandErr.message}`);
    brand = newBrand;
  }

  // 2. Insert prompt
  const { data: newPrompt, error: promptErr } = await admin
    .from('prompts')
    .insert({
      brand_id: brand.id,
      query: data.query.trim(),
      is_active: true,
    })
    .select('id, query, is_active, created_at')
    .single();

  if (promptErr) {
    throw new Error(`Failed to add prompt: ${promptErr.message}`);
  }

  revalidatePath('/dashboard/brand-kit');
  revalidatePath('/dashboard');
  return { success: true, prompt: newPrompt };
}

/**
 * Delete a prompt by ID.
 */
export async function deletePrompt(promptId: string) {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from('prompts').delete().eq('id', promptId);

  if (error) {
    throw new Error(`Failed to delete prompt: ${error.message}`);
  }

  revalidatePath('/dashboard/brand-kit');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * Toggle prompt active status.
 */
export async function togglePromptStatus(promptId: string, isActive: boolean) {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from('prompts')
    .update({ is_active: isActive })
    .eq('id', promptId);

  if (error) {
    throw new Error(`Failed to update prompt status: ${error.message}`);
  }

  revalidatePath('/dashboard/brand-kit');
  revalidatePath('/dashboard');
  return { success: true };
}
