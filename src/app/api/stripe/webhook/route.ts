import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServer } from '@/lib/stripe/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getTierFromPriceId } from '@/lib/stripe/config';

export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[STRIPE_WEBHOOK] Missing STRIPE_WEBHOOK_SECRET in environment variables.');
    return NextResponse.json(
      { error: 'Webhook secret is not configured.' },
      { status: 500 }
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('[STRIPE_WEBHOOK] Missing stripe-signature header.');
    return NextResponse.json(
      { error: 'Missing stripe-signature header.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[STRIPE_WEBHOOK] Signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  const admin = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        let tier: 'starter' | 'pro' | 'enterprise' = 'pro';

        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items?.data?.[0]?.price?.id;
            tier = getTierFromPriceId(priceId);
          } catch (subErr) {
            console.error('[STRIPE_WEBHOOK] Could not retrieve subscription price ID:', subErr);
          }
        }

        console.log(`[STRIPE_WEBHOOK] Checkout completed for user ${userId || customerId}, tier: ${tier}`);

        if (userId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: tier,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId || null,
            })
            .eq('id', userId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error updating profile on checkout.session.completed:', updateErr);
          }
        } else if (customerId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscriptionId || null,
            })
            .eq('stripe_customer_id', customerId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error updating profile via customerId on checkout.session.completed:', updateErr);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        const userId = subscription.metadata?.userId;
        const priceId = subscription.items?.data?.[0]?.price?.id;

        const isActive =
          subscription.status === 'active' || subscription.status === 'trialing';

        const tier = isActive ? getTierFromPriceId(priceId) : 'starter';

        console.log(
          `[STRIPE_WEBHOOK] Subscription updated (${subscriptionId}), status: ${subscription.status}, mapped tier: ${tier}`
        );

        if (userId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: tier,
              stripe_customer_id: customerId || null,
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error updating profile on subscription.updated by userId:', updateErr);
          }
        } else if (customerId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: tier,
              stripe_subscription_id: subscriptionId,
            })
            .eq('stripe_customer_id', customerId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error updating profile on subscription.updated by customerId:', updateErr);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        const userId = subscription.metadata?.userId;

        console.log(
          `[STRIPE_WEBHOOK] Subscription deleted (${subscriptionId}). Downgrading to starter.`
        );

        if (userId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: 'starter',
              stripe_subscription_id: null,
            })
            .eq('id', userId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error resetting profile tier on subscription.deleted by userId:', updateErr);
          }
        } else if (customerId) {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: 'starter',
              stripe_subscription_id: null,
            })
            .eq('stripe_customer_id', customerId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error resetting profile tier on subscription.deleted by customerId:', updateErr);
          }
        } else {
          const { error: updateErr } = await admin
            .from('profiles')
            .update({
              subscription_tier: 'starter',
              stripe_subscription_id: null,
            })
            .eq('stripe_subscription_id', subscriptionId);

          if (updateErr) {
            console.error('[STRIPE_WEBHOOK] Error resetting profile tier by subscriptionId:', updateErr);
          }
        }
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[STRIPE_WEBHOOK_PROCESSING_ERROR]', err);
    return NextResponse.json(
      { error: 'Error processing webhook event' },
      { status: 500 }
    );
  }
}
