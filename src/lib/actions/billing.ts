'use server';

import { getCurrentUserId } from '@/lib/auth-helpers';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { SubscriptionTier } from '@/lib/stripe/config';

export interface UserBillingProfile {
  userId: string;
  email: string | null;
  subscriptionTier: SubscriptionTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export async function getUserBillingProfile(): Promise<UserBillingProfile> {
  const userId = await getCurrentUserId();
  const admin = getSupabaseAdmin();

  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, email, subscription_tier, stripe_customer_id, stripe_subscription_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[BILLING_ACTION] Error fetching user billing profile:', error);
  }

  const rawTier = (profile?.subscription_tier || 'starter').toLowerCase();
  const subscriptionTier: SubscriptionTier =
    rawTier === 'enterprise' ? 'enterprise' : rawTier === 'pro' ? 'pro' : 'starter';

  return {
    userId,
    email: profile?.email || null,
    subscriptionTier,
    stripeCustomerId: profile?.stripe_customer_id || null,
    stripeSubscriptionId: profile?.stripe_subscription_id || null,
  };
}
