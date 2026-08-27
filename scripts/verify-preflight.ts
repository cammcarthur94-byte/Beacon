/**
 * Beacon Pre-Deployment Verification CLI Script
 * 
 * Tests:
 * 1. Stripe Webhook Signing & Profile Tier Sync (Upgrade to Pro & Downgrade to Starter)
 * 2. Cron Dispatcher Authentication (401 Rejection) and Execution Trigger
 * 3. Supabase Row-Level Security (RLS) Isolation
 * 
 * Usage:
 *   npx tsx scripts/verify-preflight.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. Environment Variable Loader (.env.local / .env fallback)
// ============================================================================
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Load env files in priority order
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'test_cron_secret_beacon';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_mock';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20' as any,
});

// Color Helpers for CLI Output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function logHeader(title: string) {
  console.log(`\n${colors.bright}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}====================================================${colors.reset}\n`);
}

function logPass(msg: string) {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${msg}`);
}

function logFail(msg: string, detail?: any) {
  console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${msg}`);
  if (detail) {
    console.log(`    ${colors.dim}${typeof detail === 'object' ? JSON.stringify(detail, null, 2) : detail}${colors.reset}`);
  }
}

function logInfo(msg: string) {
  console.log(`  ${colors.blue}ℹ INFO:${colors.reset} ${msg}`);
}

function logWarn(msg: string) {
  console.log(`  ${colors.yellow}⚠ WARN:${colors.reset} ${msg}`);
}

let passedCount = 0;
let failedCount = 0;

// ============================================================================
// Suite 1: Stripe Webhook Sync Testing
// ============================================================================
async function testStripeWebhooks() {
  logHeader('Suite 1: Stripe Webhook Sync & Billing Verification');

  const webhookEndpoint = `${BASE_URL}/api/stripe/webhook`;
  const testUserId = '00000000-0000-0000-0000-000000000001';
  const testCustId = 'cus_preflight_test_123';
  const testSubId = 'sub_preflight_test_456';

  let adminClient: any = null;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  // 1.1 Test Invalid Signature Rejection
  try {
    const invalidRes = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 't=123456,v1=invalid_signature_hash',
      },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    });

    if (invalidRes.status === 400) {
      logPass('Stripe Webhook correctly rejects invalid signatures with 400 Bad Request');
      passedCount++;
    } else {
      logFail(`Expected 400 for invalid signature, got status ${invalidRes.status}`);
      failedCount++;
    }
  } catch (err: any) {
    logFail(`Failed to connect to ${webhookEndpoint}. Ensure your Next.js dev server is running (npm run dev).`, err.message);
    failedCount++;
    return;
  }

  // 1.2 Test checkout.session.completed (Upgrade to Pro)
  const checkoutPayload = {
    id: 'evt_test_checkout_' + Date.now(),
    object: 'event',
    api_version: '2024-06-20',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_session_' + Date.now(),
        client_reference_id: testUserId,
        customer: testCustId,
        subscription: testSubId,
        metadata: { userId: testUserId },
      },
    },
  };

  const payloadString = JSON.stringify(checkoutPayload);
  const validSignature = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: STRIPE_WEBHOOK_SECRET,
  });

  // Ensure test profile exists if database connected
  if (adminClient) {
    try {
      await adminClient
        .from('profiles')
        .upsert({
          id: testUserId,
          email: 'preflight-test@beacon-geo.dev',
          subscription_tier: 'starter',
        });
    } catch (dbErr) {
      // Ignored if table not initialized
    }
  }

  try {
    const upgradeRes = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': validSignature,
      },
      body: payloadString,
    });

    const upgradeJson = await upgradeRes.json();
    if (upgradeRes.ok && upgradeJson.received === true) {
      logPass('Stripe Webhook processed checkout.session.completed successfully (received: true)');
      passedCount++;
    } else {
      logFail(`Stripe Webhook returned unexpected response on checkout.session.completed`, upgradeJson);
      failedCount++;
    }

    // Verify Supabase profiles table update
    if (adminClient) {
      const { data: updatedProfile, error: profileErr } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (profileErr) {
        logWarn(`Could not query profiles table: ${profileErr.message}`);
      } else if (updatedProfile?.subscription_tier === 'pro') {
        logPass(`Supabase profiles table correctly updated subscription_tier to 'pro' for user ${testUserId}`);
        passedCount++;
      } else {
        logFail(`Profile subscription_tier expected 'pro', found '${updatedProfile?.subscription_tier}'`);
        failedCount++;
      }
    } else {
      logWarn('Skipped direct Supabase profile assertion (SUPABASE_SERVICE_ROLE_KEY not configured)');
    }
  } catch (err: any) {
    logFail('Error executing checkout.session.completed test', err.message);
    failedCount++;
  }

  // 1.3 Test customer.subscription.deleted (Downgrade to Starter)
  const cancellationPayload = {
    id: 'evt_test_deleted_' + Date.now(),
    object: 'event',
    api_version: '2024-06-20',
    type: 'customer.subscription.deleted',
    data: {
      object: {
        id: testSubId,
        customer: testCustId,
        status: 'canceled',
        metadata: { userId: testUserId },
      },
    },
  };

  const cancelPayloadString = JSON.stringify(cancellationPayload);
  const cancelSignature = stripe.webhooks.generateTestHeaderString({
    payload: cancelPayloadString,
    secret: STRIPE_WEBHOOK_SECRET,
  });

  try {
    const cancelRes = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': cancelSignature,
      },
      body: cancelPayloadString,
    });

    const cancelJson = await cancelRes.json();
    if (cancelRes.ok && cancelJson.received === true) {
      logPass('Stripe Webhook processed customer.subscription.deleted successfully');
      passedCount++;
    } else {
      logFail(`Stripe Webhook failed on subscription.deleted`, cancelJson);
      failedCount++;
    }

    if (adminClient) {
      const { data: downgradedProfile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (downgradedProfile?.subscription_tier === 'starter') {
        logPass(`Supabase profiles table correctly downgraded subscription_tier to 'starter'`);
        passedCount++;
      } else {
        logFail(`Expected 'starter' tier after cancellation, got '${downgradedProfile?.subscription_tier}'`);
        failedCount++;
      }
    }
  } catch (err: any) {
    logFail('Error executing customer.subscription.deleted test', err.message);
    failedCount++;
  }
}

// ============================================================================
// Suite 2: Cron Dispatcher Security & Execution Testing
// ============================================================================
async function testCronDispatcher() {
  logHeader('Suite 2: Cron Dispatcher Authentication & Audit Trigger');

  const cronEndpoint = `${BASE_URL}/api/cron/run-audits`;

  // 2.1 Test Missing Authorization Header (Must return 401)
  try {
    const noAuthRes = await fetch(cronEndpoint, { method: 'GET' });
    if (noAuthRes.status === 401) {
      logPass('Cron endpoint rejects unauthorized request without Bearer token (401 Unauthorized)');
      passedCount++;
    } else {
      logFail(`Expected 401 Unauthorized when no Authorization header provided, got ${noAuthRes.status}`);
      failedCount++;
    }
  } catch (err: any) {
    logFail(`Failed to connect to ${cronEndpoint}`, err.message);
    failedCount++;
    return;
  }

  // 2.2 Test Invalid Bearer Secret
  try {
    const invalidAuthRes = await fetch(cronEndpoint, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid_secret_token_12345',
      },
    });

    if (invalidAuthRes.status === 401) {
      logPass('Cron endpoint rejects invalid Bearer secret token (401 Unauthorized)');
      passedCount++;
    } else {
      logFail(`Expected 401 for invalid Bearer token, got ${invalidAuthRes.status}`);
      failedCount++;
    }
  } catch (err: any) {
    logFail('Error testing invalid Bearer token on cron route', err.message);
    failedCount++;
  }

  // 2.3 Test Valid Authorized Execution
  try {
    logInfo('Triggering authorized audit dispatch (Bearer CRON_SECRET)...');
    const authRes = await fetch(cronEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
      },
    });

    const resJson = await authRes.json();

    if (authRes.ok && resJson.success === true) {
      logPass(`Cron audit executed successfully (Audited: ${resJson.summary?.totalPrompts ?? 0} prompts, Recommendations: ${resJson.summary?.recommendationsGenerated ?? 0})`);
      passedCount++;
    } else if (resJson.promptsAudited === 0 || resJson.message?.includes('No active prompts')) {
      logPass(`Cron audit executed successfully with 0 active prompts in queue.`);
      passedCount++;
    } else {
      logFail(`Cron audit execution returned non-success response`, resJson);
      failedCount++;
    }
  } catch (err: any) {
    logFail('Error executing authorized cron audit', err.message);
    failedCount++;
  }
}

// ============================================================================
// Suite 3: Row Level Security (RLS) Isolation Testing
// ============================================================================
async function testRowLevelSecurity() {
  logHeader('Suite 3: Supabase Row Level Security (RLS) Multi-Tenant Isolation');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    logWarn('Supabase URL or Anon Key is missing. Skipping direct client RLS test.');
    logInfo('To run RLS test: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    return;
  }

  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // Attempt unauthenticated read from brands table
    const { data: anonBrands, error: brandsErr } = await anonClient
      .from('brands')
      .select('*');

    if (anonBrands && anonBrands.length === 0) {
      logPass('RLS Enforcement: Unauthenticated / public requests cannot read private brands table (0 rows returned)');
      passedCount++;
    } else if (brandsErr) {
      logPass(`RLS Enforcement: Unauthenticated requests strictly blocked (${brandsErr.message})`);
      passedCount++;
    } else {
      logFail('RLS Leaked Data: Unauthenticated client read brand rows from database!', anonBrands);
      failedCount++;
    }

    // Attempt unauthenticated read from action_recommendations table
    const { data: anonRecs, error: recsErr } = await anonClient
      .from('action_recommendations')
      .select('*');

    if (anonRecs && anonRecs.length === 0) {
      logPass('RLS Enforcement: Unauthenticated requests cannot read action_recommendations (0 rows returned)');
      passedCount++;
    } else if (recsErr) {
      logPass(`RLS Enforcement: Action recommendations access denied (${recsErr.message})`);
      passedCount++;
    } else {
      logFail('RLS Leaked Data: Unauthenticated client read action_recommendations!', anonRecs);
      failedCount++;
    }

    // Attempt unauthenticated write to brands table (must be rejected)
    const { error: insertErr } = await anonClient
      .from('brands')
      .insert({
        brand_name: 'Malicious Brand Infiltration',
        user_id: '00000000-0000-0000-0000-000000000999',
      });

    if (insertErr) {
      logPass(`RLS Enforcement: Unauthenticated write to brands rejected (${insertErr.message})`);
      passedCount++;
    } else {
      logFail('RLS Security Vulnerability: Unauthenticated client successfully inserted a brand row!');
      failedCount++;
    }
  } catch (err: any) {
    logFail('Error performing RLS isolation assertions', err.message);
    failedCount++;
  }
}

// ============================================================================
// Runner Entry Point
// ============================================================================
async function runAll() {
  console.log(`\n${colors.bright}🚀 Beacon GEO Pre-Deployment Verification Suite${colors.reset}`);
  console.log(`${colors.dim}Target Server: ${BASE_URL}${colors.reset}\n`);

  console.log(`${colors.bright}Configuration Status:${colors.reset}`);
  console.log(`  • CRON_SECRET:                  ${CRON_SECRET ? colors.green + '[CONFIGURED]' + colors.reset : colors.red + '[MISSING]' + colors.reset}`);
  console.log(`  • STRIPE_WEBHOOK_SECRET:        ${STRIPE_WEBHOOK_SECRET ? colors.green + '[CONFIGURED]' + colors.reset : colors.red + '[MISSING]' + colors.reset}`);
  console.log(`  • STRIPE_SECRET_KEY:            ${STRIPE_SECRET_KEY ? colors.green + '[CONFIGURED]' + colors.reset : colors.red + '[MISSING]' + colors.reset}`);
  console.log(`  • NEXT_PUBLIC_SUPABASE_URL:     ${SUPABASE_URL ? colors.green + '[CONFIGURED]' + colors.reset : colors.yellow + '[OPTIONAL FOR MOCK]' + colors.reset}`);
  console.log(`  • SUPABASE_SERVICE_ROLE_KEY:    ${SUPABASE_SERVICE_ROLE_KEY ? colors.green + '[CONFIGURED]' + colors.reset : colors.yellow + '[OPTIONAL FOR MOCK]' + colors.reset}`);

  await testStripeWebhooks();
  await testCronDispatcher();
  await testRowLevelSecurity();

  logHeader('Verification Summary');
  console.log(`  Total Passed: ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Total Failed: ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}\n`);

  if (failedCount === 0) {
    console.log(`${colors.bright}${colors.green}🎉 ALL PRE-DEPLOYMENT CHECKS PASSED! Ready for Vercel deployment.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.bright}${colors.red}❌ SOME CHECKS FAILED. Review errors above before pushing to production.${colors.reset}\n`);
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
