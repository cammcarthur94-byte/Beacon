export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  price: number;
  interval: string;
  description: string;
  priceId: string | null;
  features: string[];
  highlight?: boolean;
}

export const STRIPE_PLANS: Record<SubscriptionTier, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    description: 'Core generative engine optimization for single brands and exploration.',
    priceId: null,
    features: [
      '1 Tracked Brand',
      '5 Monitored Search Queries',
      'Daily Automated Audits',
      'ChatGPT, Claude & Gemini Tracking',
      'Basic Visibility Score & Sentiment',
      'Standard Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'Most Popular',
    price: 49,
    interval: 'month',
    description: 'Comprehensive multi-engine visibility tracking and competitive intelligence.',
    priceId:
      process.env.STRIPE_PRO_PRICE_ID ||
      process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
      'price_1U97IDAymIx1lrzYBPtJwh9G',
    highlight: true,
    features: [
      '3 Tracked Brands',
      '25 Monitored Search Queries',
      'Daily Automated Audits',
      'All AI Engines + Perplexity Sonar',
      'Competitor Displacement Alerts',
      'Weekly Email Performance Digest',
      'Exportable CSV / PDF Reports',
      'Priority Email Support',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Maximum Power',
    price: 199,
    interval: 'month',
    description: 'Full-scale GEO intelligence, premium SERP scrapers, and custom auditing.',
    priceId:
      process.env.STRIPE_ENTERPRISE_PRICE_ID ||
      process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ||
      'price_1U97IEAymIx1lrzYY2HFYeEB',
    features: [
      'Unlimited Tracked Brands',
      'Unlimited Monitored Search Queries',
      'Hourly & On-Demand Auditing',
      'Google AI Overviews & Copilot Search',
      'Full Raw Citation & Deep Domain Analysis',
      'Custom Webhook & API Access',
      'Dedicated Account Manager',
      '99.9% Uptime SLA & Custom Billing',
    ],
  },
};

/**
 * Maps a Stripe Price ID or Product metadata back to the corresponding internal SubscriptionTier.
 */
export function getTierFromPriceId(priceId: string | null | undefined): SubscriptionTier {
  if (!priceId) return 'starter';

  const proPriceId =
    process.env.STRIPE_PRO_PRICE_ID ||
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
    'price_1U97IDAymIx1lrzYBPtJwh9G';
  const entPriceId =
    process.env.STRIPE_ENTERPRISE_PRICE_ID ||
    process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID ||
    'price_1U97IEAymIx1lrzYY2HFYeEB';

  if (priceId === proPriceId || priceId.toLowerCase().includes('pro')) {
    return 'pro';
  }

  if (priceId === entPriceId || priceId.toLowerCase().includes('enterprise') || priceId.toLowerCase().includes('ent')) {
    return 'enterprise';
  }

  return 'starter';
}
