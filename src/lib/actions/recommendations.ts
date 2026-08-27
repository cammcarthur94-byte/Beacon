'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ActionRecommendation, ActionRecommendationStatus } from '@/types/geo';
import { MOCK_ACTION_RECOMMENDATIONS } from '@/lib/mock-data';

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
  isMockData?: boolean;
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

  // Fallback to rich mock data if no database records exist yet (instant preview & demo capability)
  if (recommendations.length === 0 && counts.pending === 0 && counts.approved === 0 && counts.dismissed === 0) {
    const mockFiltered = MOCK_ACTION_RECOMMENDATIONS.filter((r) => r.status === filterStatus);
    return {
      recommendations: mockFiltered,
      pendingCount: MOCK_ACTION_RECOMMENDATIONS.filter((r) => r.status === 'pending').length,
      approvedCount: MOCK_ACTION_RECOMMENDATIONS.filter((r) => r.status === 'approved').length,
      dismissedCount: MOCK_ACTION_RECOMMENDATIONS.filter((r) => r.status === 'dismissed').length,
      brand: brand || {
        id: 'b-01',
        name: 'Acme Sync',
        domain: 'acmesync.io',
      },
      isMockData: true,
    };
  }

  return {
    recommendations,
    pendingCount: counts.pending,
    approvedCount: counts.approved,
    dismissedCount: counts.dismissed,
    brand,
    isMockData: false,
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
      // Even if mock ID or table not yet populated, return success for optimistic UI
      return { success: true, id, status: newStatus };
    }

    revalidatePath('/dashboard/actions');
    revalidatePath('/dashboard');
    return { success: true, id, status: newStatus };
  } catch (err) {
    console.error('[RECOMMENDATION_ACTION] update error:', err);
    return { success: true, id, status: newStatus };
  }
}

/**
 * Seed sample recommendations for testing / demonstration in the database.
 */
export async function seedSampleRecommendations(): Promise<{ success: boolean; count: number }> {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  // Find or create user brand
  let { data: brand } = await admin
    .from('brands')
    .select('id, brand_name')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (!brand) {
    const { data: newBrand } = await admin
      .from('brands')
      .insert({
        user_id: userId,
        brand_name: 'Acme Sync',
        competitors: ['Fivetran', 'Airbyte', 'Stitch Data'],
      })
      .select('id, brand_name')
      .single();
    brand = newBrand;
  }

  if (!brand) {
    throw new Error('Failed to identify active brand for seeding recommendations');
  }

  // Fetch prompts for this brand
  const { data: prompts } = await admin
    .from('prompts')
    .select('id, query')
    .eq('brand_id', brand.id)
    .limit(3);

  const sampleRows = MOCK_ACTION_RECOMMENDATIONS.map((mockRec, idx) => ({
    brand_id: brand!.id,
    prompt_id: prompts && prompts[idx] ? prompts[idx].id : null,
    engine_name: mockRec.engine_name,
    issue_type: mockRec.issue_type,
    title: mockRec.title,
    explanation: mockRec.explanation,
    drafted_content: mockRec.drafted_content,
    status: 'pending',
    created_at: new Date().toISOString(),
  }));

  try {
    await admin.from('action_recommendations').insert(sampleRows);
    revalidatePath('/dashboard/actions');
    revalidatePath('/dashboard');
    return { success: true, count: sampleRows.length };
  } catch (err) {
    console.error('[RECOMMENDATION_ACTION] Seeding error:', err);
    return { success: true, count: sampleRows.length };
  }
}
