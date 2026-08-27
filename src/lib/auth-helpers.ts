import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Fallback demo user UUID for local development when no auth cookies are present
export const DEV_DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Retrieves the current authenticated user ID.
 * If running in development and no user session is present,
 * it ensures a fallback demo profile exists in Supabase profiles table
 * and returns the demo user ID.
 */
export async function getCurrentUserId(): Promise<string> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      return user.id;
    }
  } catch (err) {
    console.warn('[AUTH_HELPER] Supabase auth check failed or unconfigured cookies:', err);
  }

  // Ensure dev demo profile exists in profiles table so foreign key constraints pass
  try {
    const admin = getSupabaseAdmin();
    await admin.from('profiles').upsert(
      {
        id: DEV_DEMO_USER_ID,
        email: 'demo@beacon-geo.local',
        subscription_tier: 'enterprise',
      },
      { onConflict: 'id' }
    );
  } catch (profileErr) {
    console.warn('[AUTH_HELPER] Failed to ensure dev demo profile:', profileErr);
  }

  return DEV_DEMO_USER_ID;
}
