import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Server-side Stripe client singleton.
 * Throws a descriptive error if STRIPE_SECRET_KEY is missing when invoked in production.
 */
export function getStripeServer(): Stripe {
  if (stripeInstance) {
    return stripeInstance;
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.warn(
      '[STRIPE_SERVER] Missing STRIPE_SECRET_KEY. Using mock placeholder key for local development builds.'
    );
  }

  stripeInstance = new Stripe(apiKey || 'sk_test_mock_placeholder_key', {
    typescript: true,
    appInfo: {
      name: 'Beacon GEO Platform',
      version: '1.0.0',
    },
  });

  return stripeInstance;
}
