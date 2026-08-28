'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export interface DbAuditSchedule {
  id: string;
  user_id: string;
  brand_id: string;
  frequency: ScheduleFrequency;
  is_enabled: boolean;
  last_run_at: string | null;
  next_run_at: string;
  created_at: string;
  updated_at: string;
}

export async function getAuditSchedule(brandId?: string): Promise<{
  success: boolean;
  data?: DbAuditSchedule | null;
  error?: string;
}> {
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
        return { success: true, data: null };
      }
      targetBrandId = brand.id;
    }

    const { data, error } = await admin
      .from('audit_schedules')
      .select('*')
      .eq('brand_id', targetBrandId)
      .maybeSingle();

    if (error) {
      console.warn('[getAuditSchedule] Warning querying audit_schedules:', error.message);
      // Fallback default if table not yet populated
      return {
        success: true,
        data: {
          id: 'temp-sched',
          user_id: userId,
          brand_id: targetBrandId || 'default-brand',
          frequency: 'weekly',
          is_enabled: true,
          last_run_at: null,
          next_run_at: new Date(Date.now() + 7 * 86400000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }


    return { success: true, data: data || null };
  } catch (err: any) {
    console.error('[getAuditSchedule] Exception:', err);
    return { success: false, error: err.message };
  }
}

export async function saveAuditSchedule(payload: {
  brand_id?: string;
  frequency: ScheduleFrequency;
  is_enabled: boolean;
}): Promise<{
  success: boolean;
  data?: DbAuditSchedule;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    let targetBrandId = payload.brand_id;
    if (!targetBrandId) {
      const { data: brand } = await admin
        .from('brands')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!brand) {
        throw new Error('No brand found to attach audit schedule.');
      }
      targetBrandId = brand.id;
    }

    // Calculate initial next_run_at based on frequency
    const now = new Date();
    const nextRun = new Date(now);
    if (payload.frequency === 'daily') {
      nextRun.setDate(nextRun.getDate() + 1);
    } else if (payload.frequency === 'weekly') {
      nextRun.setDate(nextRun.getDate() + 7);
    } else if (payload.frequency === 'monthly') {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    const { data, error } = await admin
      .from('audit_schedules')
      .upsert(
        {
          user_id: userId,
          brand_id: targetBrandId,
          frequency: payload.frequency,
          is_enabled: payload.is_enabled,
          next_run_at: nextRun.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'brand_id' }
      )
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/prompts');
    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (err: any) {
    console.error('[saveAuditSchedule] Error:', err);
    return { success: false, error: err.message };
  }
}
