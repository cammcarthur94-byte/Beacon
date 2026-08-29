'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ActionRecommendation, ActionRecommendationStatus } from '@/types/geo';

export interface ActionCenterState {
  recommendations: ActionRecommendation[];
  pendingCount: number;
  approvedCount: number;
  dismissedCount: number;
  brand: {
    id: string;
    name: string;
    domain: string;
  } | null;
}

/**
 * Fetch action recommendations for the logged-in user's active brand.
 */
export async function getActionRecommendations(
  filterStatus: ActionRecommendationStatus = 'pending'
): Promise<ActionCenterState> {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  // 1. Fetch user's active brand
  let brandRow: any = null;
  try {
    const { data, error } = await admin
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[RECOMMENDATION_ACTION] Brands fetch warning:', error.message);
    }
    brandRow = data;
  } catch (err) {
    console.warn('[RECOMMENDATION_ACTION] Failed to query brands:', err);
  }

  const brand = brandRow
    ? {
        id: brandRow.id,
        name: brandRow.brand_name || 'My Brand',
        domain: brandRow.domain || `${brandRow.brand_name?.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      }
    : null;

  // 2. Fetch action recommendations from Supabase
  let recommendations: ActionRecommendation[] = [];
  let counts = { pending: 0, approved: 0, dismissed: 0 };

  if (brandRow?.id) {
    try {
      const { data: recRows, error: recError } = await admin
        .from('action_recommendations')
        .select(`
          id,
          brand_id,
          prompt_id,
          engine_name,
          issue_type,
          title,
          explanation,
          drafted_content,
          status,
          created_at,
          prompts (
            id,
            query,
            category
          ),
          brands (
            id,
            brand_name,
            domain
          )
        `)
        .eq('brand_id', brandRow.id)
        .order('created_at', { ascending: false });

      if (recError) {
        console.warn('[RECOMMENDATION_ACTION] action_recommendations query warning:', recError.message);
      } else if (recRows) {
        recRows.forEach((r: any) => {
          if (r.status === 'pending') counts.pending++;
          else if (r.status === 'approved') counts.approved++;
          else if (r.status === 'dismissed') counts.dismissed++;
        });

        recommendations = recRows
          .filter((r: any) => r.status === filterStatus)
          .map((r: any) => ({
            id: r.id,
            brand_id: r.brand_id,
            prompt_id: r.prompt_id,
            engine_name: r.engine_name,
            issue_type: r.issue_type,
            title: r.title,
            explanation: r.explanation,
            drafted_content: r.drafted_content,
            status: r.status,
            created_at: r.created_at,
            prompts: r.prompts,
            brands: r.brands,
          }));
      }
    } catch (fetchErr) {
      console.warn('[RECOMMENDATION_ACTION] Table fetch error:', fetchErr);
    }
  }

  return {
    recommendations,
    pendingCount: counts.pending,
    approvedCount: counts.approved,
    dismissedCount: counts.dismissed,
    brand,
  };
}

/**
 * Update the status of a recommendation (Approve as 'approved' / Dismiss as 'dismissed')
 */
export async function updateRecommendationStatus(
  id: string,
  newStatus: 'approved' | 'dismissed'
): Promise<{ success: boolean; id: string; status: string; error?: string }> {
  try {
    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from('action_recommendations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.warn(`[RECOMMENDATION_ACTION] DB update error for id=${id}:`, error.message);
      return { success: false, id, status: newStatus, error: error.message };
    }

    revalidatePath('/dashboard/actions');
    revalidatePath('/dashboard');
    return { success: true, id, status: newStatus };
  } catch (err: any) {
    console.error('[RECOMMENDATION_ACTION] update error:', err);
    return { success: false, id, status: newStatus, error: err?.message };
  }
}
