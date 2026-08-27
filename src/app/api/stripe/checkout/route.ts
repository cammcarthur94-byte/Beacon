import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUserId } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upgrade.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing required parameter: priceId' },
        { status: 400 }
      );
    }

    // Retrieve user profile to check for existing stripe_customer_id and email
    const admin = getSupabaseAdmin();
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('id, email, stripe_customer_id, subscription_tier')
      .eq('id', userId)
      .single();

    if (profileErr && profileErr.code !== 'PGRST116') {
      console.error('[STRIPE_CHECKOUT] Error fetching profile:', profileErr);
    }

    const customerEmail = profile?.email || undefined;
    const stripeCustomerId = profile?.stripe_customer_id || undefined;

    // Resolve base origin for redirect URLs
    const origin =
      req.headers.get('origin') ||
      req.headers.get('referer') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const cleanOrigin = origin.replace(/\/+$/, '');

    const stripe = getStripeServer();

    // Create Stripe Checkout Session
    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
      success_url: `${cleanOrigin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanOrigin}/billing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    };

    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to generate checkout session URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating the Stripe checkout session.' },
      { status: 500 }
    );
  }
}
