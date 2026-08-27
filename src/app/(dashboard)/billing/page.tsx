'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Zap,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { STRIPE_PLANS, SubscriptionTier } from '@/lib/stripe/config';
import { getUserBillingProfile, UserBillingProfile } from '@/lib/actions/billing';
import { cn } from '@/lib/utils';

function BillingContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const [profile, setProfile] = React.useState<UserBillingProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [checkoutLoadingTier, setCheckoutLoadingTier] = React.useState<string | null>(null);
  const [portalLoading, setPortalLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const data = await getUserBillingProfile();
        setProfile(data);
      } catch (err) {
        console.error('Failed to load user billing profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCheckout = async (tier: SubscriptionTier) => {
    const plan = STRIPE_PLANS[tier];
    if (!plan.priceId) return;

    setCheckoutLoadingTier(tier);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initiate Stripe Checkout session.');
      }

      // Redirect user to Stripe hosted checkout page
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Checkout redirect error:', err);
      setErrorMessage(err.message || 'Unable to connect to Stripe Checkout. Please try again.');
      setCheckoutLoadingTier(null);
    }
  };

  const handleOpenCustomerPortal = async () => {
    setPortalLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to open Stripe Billing Portal.');
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error('Customer portal error:', err);
      setErrorMessage(err.message || 'Unable to open billing portal. Please contact support.');
      setPortalLoading(false);
    }
  };

  const currentTier: SubscriptionTier = profile?.subscriptionTier || 'starter';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Subscription</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">Stripe Billing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Plans & Subscription Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Upgrade your Beacon GEO workspace to unlock automated multi-engine monitoring, deep competitor tracking, and real-time alerts.
          </p>
        </div>

        {profile?.stripeCustomerId && (
          <Button
            onClick={handleOpenCustomerPortal}
            disabled={portalLoading}
            variant="outline"
            className="gap-2 text-xs font-medium self-start sm:self-auto shrink-0 border-border/80 hover:border-primary/50"
          >
            {portalLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CreditCard className="w-3.5 h-3.5 text-primary" />
            )}
            <span>Manage Billing & Invoices</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Success / Cancel Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Payment Successful!</div>
            <div className="text-xs text-emerald-400/90 mt-0.5">
              Your subscription has been activated successfully. Your new tier features and audit limits are now live.
            </div>
          </div>
        </div>
      )}

      {canceled && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Checkout Canceled</div>
            <div className="text-xs text-amber-400/90 mt-0.5">
              The checkout process was canceled. No charges were made to your account.
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Checkout Error</div>
            <div className="text-xs text-destructive/90 mt-0.5">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Current Subscription Status Card */}
      <Card className="border-border/80 bg-gradient-to-r from-card/80 via-background to-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-primary shrink-0">
              <Zap className="w-6 h-6 animate-pulse text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Active Workspace Plan:</span>
                <Badge
                  variant={currentTier === 'enterprise' ? 'purple' : currentTier === 'pro' ? 'cyan' : 'outline'}
                  className="uppercase tracking-wider text-[11px] font-bold"
                >
                  {currentTier}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground mt-1">
                {currentTier === 'starter' && 'Free Tier — 1 Brand & 5 Monitored Prompts'}
                {currentTier === 'pro' && 'Pro Subscription — 3 Brands & 25 Prompts with Real-Time Alerts'}
                {currentTier === 'enterprise' && 'Enterprise Intelligence — Unlimited Tracking & Priority Scrapers'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile?.stripeCustomerId ? (
              <Button
                onClick={handleOpenCustomerPortal}
                disabled={portalLoading}
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Manage Payment Method</span>
              </Button>
            ) : currentTier === 'starter' ? (
              <Button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoadingTier !== null}
                variant="glow"
                size="sm"
                className="gap-2 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* 1. Starter Plan */}
        <Card
          className={cn(
            'flex flex-col justify-between border-border/80 transition-all duration-200 hover:border-border',
            currentTier === 'starter' && 'ring-2 ring-primary/40 border-primary/50'
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-foreground">Starter</div>
              {currentTier === 'starter' && (
                <Badge variant="success" className="text-[10px] uppercase font-bold">
                  Current Plan
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">$0</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <CardDescription className="text-xs mt-2 leading-relaxed">
              {STRIPE_PLANS.starter.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pb-6 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground pt-2">
              What&apos;s Included
            </div>
            <ul className="space-y-2.5">
              {STRIPE_PLANS.starter.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50">
            <Button
              disabled={true}
              variant="outline"
              className="w-full text-xs font-semibold"
            >
              {currentTier === 'starter' ? 'Current Plan' : 'Free Tier'}
            </Button>
          </CardFooter>
        </Card>

        {/* 2. Pro Plan */}
        <Card
          className={cn(
            'flex flex-col justify-between relative border-primary/50 bg-gradient-to-b from-card to-background shadow-lg shadow-blue-500/5 transition-all duration-200 hover:border-primary',
            currentTier === 'pro' && 'ring-2 ring-blue-500'
          )}
        >
          {/* Most Popular Ribbon */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md shadow-blue-500/30 border border-blue-400/30">
              Most Popular
            </span>
          </div>

          <CardHeader className="pb-4 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Pro</span>
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              {currentTier === 'pro' && (
                <Badge variant="success" className="text-[10px] uppercase font-bold">
                  Current Plan
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">$49</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <CardDescription className="text-xs mt-2 leading-relaxed">
              {STRIPE_PLANS.pro.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pb-6 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary pt-2">
              Everything in Starter, plus
            </div>
            <ul className="space-y-2.5">
              {STRIPE_PLANS.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                  <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50">
            {currentTier === 'pro' ? (
              <Button
                onClick={handleOpenCustomerPortal}
                disabled={portalLoading}
                variant="outline"
                className="w-full text-xs font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/10"
              >
                {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                <span>Manage Pro Subscription</span>
              </Button>
            ) : (
              <Button
                onClick={() => handleCheckout('pro')}
                disabled={checkoutLoadingTier !== null}
                variant="glow"
                className="w-full text-xs font-semibold gap-2"
              >
                {checkoutLoadingTier === 'pro' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* 3. Enterprise Plan */}
        <Card
          className={cn(
            'flex flex-col justify-between border-border/80 transition-all duration-200 hover:border-purple-500/50 bg-gradient-to-b from-card/80 to-background',
            currentTier === 'enterprise' && 'ring-2 ring-purple-500 border-purple-500'
          )}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Enterprise</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              {currentTier === 'enterprise' ? (
                <Badge variant="success" className="text-[10px] uppercase font-bold">
                  Current Plan
                </Badge>
              ) : (
                <Badge variant="purple" className="text-[10px] uppercase font-bold">
                  Maximum Power
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">$199</span>
              <span className="text-xs text-muted-foreground">/ month</span>
            </div>
            <CardDescription className="text-xs mt-2 leading-relaxed">
              {STRIPE_PLANS.enterprise.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pb-6 flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-400 pt-2">
              Enterprise Exclusives
            </div>
            <ul className="space-y-2.5">
              {STRIPE_PLANS.enterprise.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                  <Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="pt-2 border-t border-border/50">
            {currentTier === 'enterprise' ? (
              <Button
                onClick={handleOpenCustomerPortal}
                disabled={portalLoading}
                variant="outline"
                className="w-full text-xs font-semibold gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                <span>Manage Enterprise Plan</span>
              </Button>
            ) : (
              <Button
                onClick={() => handleCheckout('enterprise')}
                disabled={checkoutLoadingTier !== null}
                variant="secondary"
                className="w-full text-xs font-semibold gap-2 hover:bg-purple-600 hover:text-white transition-all"
              >
                {checkoutLoadingTier === 'enterprise' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upgrade to Enterprise</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* FAQ & Guarantee Banner */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card/40 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Secure Stripe Checkout</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              All transactions are encrypted and processed through Stripe&apos;s Level 1 PCI-compliant infrastructure.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Cancel Anytime</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              No long term contracts. You can upgrade, downgrade, or cancel your subscription at any time with one click.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">Need Custom Volume?</div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Contact support for custom GEO tracking pipelines across hundreds of brands and thousands of localized queries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <BillingContent />
    </React.Suspense>
  );
}
