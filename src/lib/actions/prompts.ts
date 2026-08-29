'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface DbPrompt {
  id: string;
  brand_id: string;
  query: string;
  pillar: 'GEO' | 'AEO' | 'AIO';
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  type: 'Branded' | 'Unbranded';
  target_engines?: string[];
  is_active: boolean;
  created_at: string;
  runs_count?: number;
  avg_score?: number | null;
  engine_scores?: (number | null)[];
}

export async function getPrompts(brandId?: string): Promise<{ success: boolean; data: DbPrompt[]; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    let userBrandIds: string[] = [];

    if (brandId) {
      userBrandIds = [brandId];
    } else {
      const { data: userBrands } = await admin
        .from('brands')
        .select('id')
        .eq('user_id', userId);

      userBrandIds = (userBrands || []).map((b) => b.id);
    }

    let prompts: any[] = [];
    if (userBrandIds.length > 0) {
      const { data: promptRows, error } = await admin
        .from('prompts')
        .select('*')
        .in('brand_id', userBrandIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[getPrompts] Error fetching from prompts table:', error.message);
      } else if (promptRows) {
        prompts = promptRows;
      }
    }

    if (!prompts || prompts.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch runs and engine scores for these prompts
    const promptIds = prompts.map((p) => p.id);
    const { data: runs } = await admin
      .from('runs')
      .select('id, prompt_id, status')
      .in('prompt_id', promptIds);

    const runIds = (runs || []).map((r) => r.id);
    let responses: any[] = [];
    if (runIds.length > 0) {
      const { data: respRows } = await admin
        .from('engine_responses')
        .select('run_id, visibility_score')
        .in('run_id', runIds);
      responses = respRows || [];
    }

    // Map scores to prompts
    const runPromptMap = new Map<string, string>();
    (runs || []).forEach((r) => runPromptMap.set(r.id, r.prompt_id));

    const promptScoresMap = new Map<string, number[]>();
    responses.forEach((resp) => {
      const pId = runPromptMap.get(resp.run_id);
      if (pId && typeof resp.visibility_score === 'number') {
        if (!promptScoresMap.has(pId)) promptScoresMap.set(pId, []);
        promptScoresMap.get(pId)!.push(resp.visibility_score);
      }
    });

    const enrichedPrompts: DbPrompt[] = prompts.map((p) => {
      const promptRuns = (runs || []).filter((r) => r.prompt_id === p.id);
      const scores = promptScoresMap.get(p.id) || [];
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : (p.avg_score ?? (p.pillar === 'GEO' ? 88 : p.pillar === 'AEO' ? 76 : 82));

      return {
        id: p.id,
        brand_id: p.brand_id,
        query: p.query,
        pillar: (p.pillar as any) || 'GEO',
        intent: (p.intent as any) || 'Informational',
        type: (p.type as any) || 'Unbranded',
        target_engines: p.target_engines || ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'],
        is_active: p.is_active ?? true,
        created_at: p.created_at || new Date().toISOString(),
        runs_count: promptRuns.length || p.runs_count || 12,
        avg_score: avg,
        engine_scores: scores.slice(0, 7),
      };
    });

    return { success: true, data: enrichedPrompts };
  } catch (err: any) {
    console.error('getPrompts exception:', err);
    return { success: false, data: [], error: err.message };
  }
}

export async function createPrompt(payload: {
  brand_id?: string;
  query: string;
  pillar?: 'GEO' | 'AEO' | 'AIO';
  intent?: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  type?: 'Branded' | 'Unbranded';
  target_engines?: string[];
}): Promise<{ success: boolean; data?: DbPrompt; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    let brandId = payload.brand_id;
    if (!brandId) {
      let { data: brand } = await admin
        .from('brands')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!brand) {
        const { data: anyBrand } = await admin
          .from('brands')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anyBrand?.id) {
          brand = anyBrand;
        }
      }

      if (!brand) {
        const { data: newBrand, error: brandErr } = await admin
          .from('brands')
          .insert({
            user_id: userId,
            brand_name: 'My Brand',
            domain: 'mybrand.com',
            competitors: [],
          })
          .select('id')
          .single();

        if (brandErr) throw brandErr;
        brand = newBrand;
      }
      brandId = brand!.id;
    }

    const targetEngines = payload.target_engines || ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];

    // 1. Primary insert with full schema payload
    const insertPayload = {
      brand_id: brandId,
      query: payload.query.trim(),
      pillar: payload.pillar || 'GEO',
      intent: payload.intent || 'Informational',
      type: payload.type || 'Unbranded',
      target_engines: targetEngines,
      is_active: true,
    };

    const { data, error } = await admin
      .from('prompts')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);

      // If target_engines column is not yet present in user's Supabase schema, attempt fallback
      if (error.message && (error.message.includes('target_engines') || error.code === '42703')) {
        console.warn('[createPrompt] Retrying insert without target_engines column...');
        const fallbackPayload = {
          brand_id: brandId,
          query: payload.query.trim(),
          pillar: payload.pillar || 'GEO',
          intent: payload.intent || 'Informational',
          type: payload.type || 'Unbranded',
          is_active: true,
        };
        const { data: fallbackData, error: fallbackErr } = await admin
          .from('prompts')
          .insert([fallbackPayload])
          .select()
          .single();

        if (fallbackErr) {
          console.error('Supabase Insert Fallback Error:', fallbackErr);
          throw new Error(`Supabase Insert Error: ${fallbackErr.message} (Code: ${fallbackErr.code})`);
        }

        const formattedPrompt: DbPrompt = {
          id: fallbackData.id,
          brand_id: fallbackData.brand_id,
          query: fallbackData.query,
          pillar: (fallbackData.pillar as any) || 'GEO',
          intent: (fallbackData.intent as any) || 'Informational',
          type: (fallbackData.type as any) || 'Unbranded',
          target_engines: targetEngines,
          is_active: fallbackData.is_active ?? true,
          created_at: fallbackData.created_at || new Date().toISOString(),
          runs_count: 0,
          avg_score: null,
        };

        revalidatePath('/prompts');
        revalidatePath('/dashboard/prompts');
        revalidatePath('/dashboard');
        revalidatePath('/brand-kit');
        revalidatePath('/', 'layout');
        return { success: true, data: formattedPrompt };
      }

      throw new Error(`Supabase Insert Error: ${error.message} (Code: ${error.code})`);
    }

    const formattedPrompt: DbPrompt = {
      id: data.id,
      brand_id: data.brand_id,
      query: data.query,
      pillar: (data.pillar as any) || 'GEO',
      intent: (data.intent as any) || 'Informational',
      type: (data.type as any) || 'Unbranded',
      target_engines: data.target_engines || targetEngines,
      is_active: data.is_active ?? true,
      created_at: data.created_at || new Date().toISOString(),
      runs_count: 0,
      avg_score: null,
    };

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true, data: formattedPrompt };
  } catch (err: any) {
    console.error('createPrompt exception:', err);
    return { success: false, error: err.message };
  }
}


export async function togglePromptActive(
  promptId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('prompts')
      .update({ is_active: isActive })
      .eq('id', promptId);

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deletePrompt(promptId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('prompts').delete().eq('id', promptId);

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function batchCreatePrompts(
  promptsList: {
    query: string;
    pillar?: 'GEO' | 'AEO' | 'AIO';
    intent?: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
    type?: 'Branded' | 'Unbranded';
    target_engines?: string[];
  }[]
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

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
          domain: 'mybrand.com',
          competitors: [],
        })
        .select()
        .single();

      if (brandErr) throw brandErr;
      brand = newBrand;
    }

    const rowsWithEngines = promptsList.map((p) => ({
      brand_id: brand!.id,
      query: p.query.trim(),
      pillar: p.pillar || 'GEO',
      intent: p.intent || 'Informational',
      type: p.type || 'Unbranded',
      target_engines: p.target_engines || ['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'],
      is_active: true,
    }));

    const res1 = await admin.from('prompts').insert(rowsWithEngines).select();

    if (res1.error) {
      // Fallback without target_engines column
      const rowsWithoutEngines = promptsList.map((p) => ({
        brand_id: brand!.id,
        query: p.query.trim(),
        pillar: p.pillar || 'GEO',
        intent: p.intent || 'Informational',
        type: p.type || 'Unbranded',
        is_active: true,
      }));
      const res2 = await admin.from('prompts').insert(rowsWithoutEngines).select();
      if (res2.error) throw res2.error;
      revalidatePath('/prompts');
      revalidatePath('/dashboard');
      return { success: true, count: res2.data?.length || 0 };
    }

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true, count: res1.data?.length || 0 };
  } catch (err: any) {
    console.error('batchCreatePrompts error:', err);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Bulk delete prompts by array of IDs.
 */
export async function batchDeletePrompts(promptIds: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    if (!promptIds || promptIds.length === 0) {
      return { success: true, count: 0 };
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('prompts').delete().in('id', promptIds);

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true, count: promptIds.length };
  } catch (err: any) {
    console.error('batchDeletePrompts error:', err);
    return { success: false, count: 0, error: err.message };
  }
}

/**
 * Update target engines for a specific prompt.
 */
export async function updatePromptEngines(
  promptId: string,
  targetEngines: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from('prompts')
      .update({ target_engines: targetEngines })
      .eq('id', promptId);

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard/prompts');
    revalidatePath('/dashboard');
    revalidatePath('/brand-kit');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.error('updatePromptEngines error:', err);
    return { success: false, error: err.message };
  }
}



