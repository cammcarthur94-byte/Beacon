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

    const { data: prompts, error } = await admin
      .from('prompts')
      .select('*')
      .eq('brand_id', targetBrandId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return { success: false, data: [], error: error.message };
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
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

      return {
        id: p.id,
        brand_id: p.brand_id,
        query: p.query,
        pillar: (p.pillar as any) || 'GEO',
        intent: (p.intent as any) || 'Informational',
        type: (p.type as any) || 'Unbranded',
        is_active: p.is_active,
        created_at: p.created_at,
        runs_count: promptRuns.length,
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
}): Promise<{ success: boolean; data?: DbPrompt; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    let brandId = payload.brand_id;
    if (!brandId) {
      // Find or create default brand for user
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
      brandId = brand!.id;
    }

    const { data: prompt, error } = await admin
      .from('prompts')
      .insert({
        brand_id: brandId,
        query: payload.query.trim(),
        pillar: payload.pillar || 'GEO',
        intent: payload.intent || 'Informational',
        type: payload.type || 'Unbranded',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard');
    return { success: true, data: prompt };
  } catch (err: any) {
    console.error('createPrompt error:', err);
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
    revalidatePath('/dashboard');
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
    revalidatePath('/dashboard');
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

    const rows = promptsList.map((p) => ({
      brand_id: brand!.id,
      query: p.query.trim(),
      pillar: p.pillar || 'GEO',
      intent: p.intent || 'Informational',
      type: p.type || 'Unbranded',
      is_active: true,
    }));

    const { data, error } = await admin.from('prompts').insert(rows).select();

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard');
    return { success: true, count: data?.length || 0 };
  } catch (err: any) {
    console.error('batchCreatePrompts error:', err);
    return { success: false, count: 0, error: err.message };
  }
}
