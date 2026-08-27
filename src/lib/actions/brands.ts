'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export interface DbBrand {
  id: string;
  name: string;
  domain: string;
  industry: string;
  description: string;
  competitors: { id: string; name: string; domain: string; visibilityScore: number }[];
  created_at: string;
}

export async function getUserBrands(): Promise<{ success: boolean; data: DbBrand[]; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    const { data: rows, error } = await admin
      .from('brands')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const brands: DbBrand[] = (rows || []).map((b) => {
      const rawComps = Array.isArray(b.competitors) ? b.competitors : [];
      const competitors = rawComps.map((c: any, idx: number) => {
        if (typeof c === 'string') {
          return {
            id: `comp-${idx}`,
            name: c,
            domain: `${c.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            visibilityScore: 65,
          };
        }
        return c;
      });

      return {
        id: b.id,
        name: b.brand_name || 'My Brand',
        domain: b.domain || 'mybrand.com',
        industry: b.industry || 'Technology / SaaS',
        description: b.description || '',
        competitors,
        created_at: b.created_at,
      };
    });

    return { success: true, data: brands };
  } catch (err: any) {
    console.error('getUserBrands error:', err);
    return { success: false, data: [], error: err.message };
  }
}

export async function saveBrandProfile(payload: {
  id?: string;
  brand_name: string;
  domain?: string;
  industry?: string;
  description?: string;
  competitors?: string[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const admin = getSupabaseAdmin();

    if (payload.id) {
      const { data, error } = await admin
        .from('brands')
        .update({
          brand_name: payload.brand_name.trim(),
          domain: payload.domain?.trim() || null,
          industry: payload.industry?.trim() || null,
          description: payload.description?.trim() || null,
          competitors: payload.competitors || [],
        })
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      revalidatePath('/brand-kit');
      revalidatePath('/dashboard');
      return { success: true, data };
    } else {
      const { data, error } = await admin
        .from('brands')
        .insert({
          user_id: userId,
          brand_name: payload.brand_name.trim(),
          domain: payload.domain?.trim() || 'mybrand.com',
          industry: payload.industry?.trim() || 'Technology / SaaS',
          description: payload.description?.trim() || '',
          competitors: payload.competitors || [],
        })
        .select()
        .single();

      if (error) throw error;
      revalidatePath('/brand-kit');
      revalidatePath('/dashboard');
      return { success: true, data };
    }
  } catch (err: any) {
    console.error('saveBrandProfile error:', err);
    return { success: false, error: err.message };
  }
}
