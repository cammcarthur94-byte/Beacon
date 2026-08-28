import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Fallback demo user UUID for local development when no auth cookies are present
export const DEV_DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Retrieves the current authenticated user ID.
 * If running without a session, it finds or provisions a valid user profile
 * in Supabase to ensure all relational foreign keys succeed.
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

  // If no auth session cookie, inspect database for existing valid profile/auth user
  try {
    const admin = getSupabaseAdmin();

    // 0. Check if an existing brand already has a linked user_id in database
    const { data: existingBrand } = await admin
      .from('brands')
      .select('user_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingBrand?.user_id) {
      return existingBrand.user_id;
    }

    // 1. Check if an existing profile exists in profiles table
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingProfile?.id) {
      return existingProfile.id;
    }

    // 2. Check if any auth user exists in auth.users
    const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersData?.users && usersData.users.length > 0) {
      const firstUser = usersData.users[0];
      await admin.from('profiles').upsert(
        {
          id: firstUser.id,
          email: firstUser.email || 'demo@beacon-geo.local',
          subscription_tier: 'enterprise',
        },
        { onConflict: 'id' }
      );
      return firstUser.id;
    }

    // 3. Attempt to provision a demo user in auth.users
    const { data: createdAuthUser } = await admin.auth.admin.createUser({
      email: 'demo@beacon-geo.local',
      password: 'BeaconDemoPassword123!',
      email_confirm: true,
    });

    if (createdAuthUser?.user?.id) {
      await admin.from('profiles').upsert(
        {
          id: createdAuthUser.user.id,
          email: 'demo@beacon-geo.local',
          subscription_tier: 'enterprise',
        },
        { onConflict: 'id' }
      );
      return createdAuthUser.user.id;
    }
  } catch (profileErr) {
    console.warn('[AUTH_HELPER] Failed to resolve auth user from database:', profileErr);
  }

  return DEV_DEMO_USER_ID;
}
