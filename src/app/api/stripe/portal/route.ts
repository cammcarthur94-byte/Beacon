import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUserId } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileErr || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active Stripe billing customer found for this account.' },
        { status: 404 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      req.headers.get('referer') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const cleanOrigin = origin.replace(/\/+$/, '');

    const stripe = getStripeServer();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${cleanOrigin}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('[STRIPE_PORTAL_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create customer portal session.' },
      { status: 500 }
    );
  }
}
