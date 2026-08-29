import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local variables
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0) {
          process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch (e) {}

async function runLiveAuditTest() {
  console.log('========================================================================');
  console.log('🚀 BEACON LIVE E2E TEST: ACCOUNT -> BRAND -> PROMPTS -> CLAUDE AUDIT');
  console.log('========================================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials missing in environment.');
  }

  if (!anthropicKey) {
    throw new Error('ANTHROPIC_API_KEY is missing in environment.');
  }

  console.log('✅ Supabase URL:', supabaseUrl);
  console.log('✅ Anthropic API Key present (prefix:', anthropicKey.substring(0, 14) + '...)\n');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // ---------------------------------------------------------------------------
  // STEP 1: CREATE REAL ACCOUNT (AUTH USER & PROFILE)
  // ---------------------------------------------------------------------------
  const timestamp = Date.now();
  const testEmail = `claude-auditor-${timestamp}@beacon-eval.com`;
  const testPassword = `BeaconPass${timestamp}!`;

  console.log(`[1/4] Creating Real Account: ${testEmail}...`);
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }

  const userId = authUser.user.id;
  console.log(`✅ Account Created Successfully! User ID: ${userId}`);

  // Create Profile record
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: testEmail,
      subscription_tier: 'enterprise',
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.warn('Note on profiles upsert:', profileError.message);
  } else {
    console.log(`✅ Profile Configured (Enterprise Tier)`);
  }

  // ---------------------------------------------------------------------------
  // STEP 2: CREATE REAL BRAND / PROJECT
  // ---------------------------------------------------------------------------
  console.log('\n[2/4] Creating Brand / Project: "VectorScale AI"...');
  const brandPayload = {
    user_id: userId,
    brand_name: 'VectorScale AI',
    domain: 'vectorscale.ai',
    industry: 'Enterprise AI & Distributed Databases',
    description: 'Ultra-low latency distributed vector database designed for high-concurrency enterprise RAG pipelines and hybrid sparse-dense neural search.',
    competitors: ['Pinecone', 'Weaviate', 'Qdrant'],
  };

  const { data: createdBrand, error: brandError } = await supabase
    .from('brands')
    .insert(brandPayload)
    .select()
    .single();

  if (brandError || !createdBrand) {
    throw new Error(`Failed to create brand: ${brandError?.message}`);
  }

  const brandId = createdBrand.id;
  console.log(`✅ Brand Created! ID: ${brandId}`);
  console.log(`   Brand Name: ${createdBrand.brand_name}`);
  console.log(`   Domain: ${createdBrand.domain}`);
  console.log(`   Competitors: ${JSON.stringify(createdBrand.competitors)}`);

  // ---------------------------------------------------------------------------
  // STEP 3: CREATE PROMPTS COVERING ALL PILLARS & BRANDED / UNBRANDED
  // ---------------------------------------------------------------------------
  console.log('\n[3/4] Creating Prompts covering all Pillars (GEO, AEO, AIO) & Types (Branded, Unbranded)...');

  const promptsToCreate = [
    // 1. GEO - Branded
    {
      brand_id: brandId,
      query: 'VectorScale AI enterprise throughput latency and indexing benchmarks for high-dimensional vector search',
      pillar: 'GEO',
      intent: 'Informational',
      type: 'Branded',
      is_active: true,
    },
    // 2. GEO - Unbranded
    {
      brand_id: brandId,
      query: 'Best enterprise vector database solutions with sub-millisecond hybrid search latency in 2026',
      pillar: 'GEO',
      intent: 'Commercial',
      type: 'Unbranded',
      is_active: true,
    },
    // 3. AEO - Branded
    {
      brand_id: brandId,
      query: 'How does VectorScale AI compare against Pinecone and Weaviate for multi-tenant RAG architectures?',
      pillar: 'AEO',
      intent: 'Commercial',
      type: 'Branded',
      is_active: true,
    },
    // 4. AEO - Unbranded
    {
      brand_id: brandId,
      query: 'Top alternatives to Pinecone for high-concurrency vector search with built-in metadata filtering',
      pillar: 'AEO',
      intent: 'Informational',
      type: 'Unbranded',
      is_active: true,
    },
    // 5. AIO - Branded
    {
      brand_id: brandId,
      query: 'How to deploy VectorScale AI distributed cluster with GPU acceleration on Kubernetes',
      pillar: 'AIO',
      intent: 'Navigational',
      type: 'Branded',
      is_active: true,
    },
    // 6. AIO - Unbranded
    {
      brand_id: brandId,
      query: 'Architecture best practices for real-time document chunking and vector embedding pipelines',
      pillar: 'AIO',
      intent: 'Informational',
      type: 'Unbranded',
      is_active: true,
    },
  ];

  const createdPromptRows: any[] = [];
  for (const p of promptsToCreate) {
    const { data: promptRow, error: pErr } = await supabase
      .from('prompts')
      .insert(p)
      .select()
      .single();

    if (pErr) {
      console.error(`Error inserting prompt "${p.query}":`, pErr.message);
    } else {
      createdPromptRows.push(promptRow);
      console.log(`   + [${p.pillar} | ${p.type}] "${p.query.substring(0, 55)}..." (ID: ${promptRow.id})`);
    }
  }

  console.log(`✅ ${createdPromptRows.length} Prompts Created in Database`);

  // ---------------------------------------------------------------------------
  // STEP 4: RUN REAL AUDIT AGAINST CLAUDE IN PARALLEL (NO MOCK DATA)
  // ---------------------------------------------------------------------------
  console.log('\n[4/4] Executing Concurrent Live Audit against Anthropic Claude API for each prompt...');
  console.log('------------------------------------------------------------------------');

  const { dispatchAuditForPrompt } = await import('../src/lib/ai/dispatcher');

  const parallelAuditPromises = createdPromptRows.map(async (prompt, index) => {
    const promptWithBrand = {
      ...prompt,
      engines_tracked: ['claude'], // STRICTLY TARGET CLAUDE MODEL ONLY
      brands: {
        id: createdBrand.id,
        name: createdBrand.brand_name,
        domain: createdBrand.domain,
        competitors: (createdBrand.competitors || []).map((c: string) => ({ name: c, domain: `${c.toLowerCase()}.com` })),
        subscription_tier: 'enterprise',
      },
    };

    const startTime = Date.now();
    const result = await dispatchAuditForPrompt(supabase, promptWithBrand as any);
    const duration = Date.now() - startTime;

    return { prompt, result, duration, index: index + 1 };
  });

  const completedAudits = await Promise.all(parallelAuditPromises);

  completedAudits.sort((a, b) => a.index - b.index);

  for (const item of completedAudits) {
    const { prompt, result, duration, index } = item;
    console.log(`\n========================================================================`);
    console.log(`🔍 [PROMPT ${index}/${createdPromptRows.length}] Pillar: ${prompt.pillar} | Type: ${prompt.type}`);
    console.log(`Query: "${prompt.query}"`);
    console.log(`⏱️ Audit Completed in ${duration}ms (Status: ${result.status})`);
    console.log(`========================================================================`);

    result.engineResults.forEach((er) => {
      console.log(`🤖 Engine: ${er.engine.toUpperCase()} | Model: ${er.model}`);
      console.log(`📊 Visibility Tier Score: ${er.evaluation.visibility_score}%`);
      console.log(`🎯 Sentiment: ${er.evaluation.sentiment}`);
      console.log(`🏆 Target Brand Mentioned: ${er.evaluation.brand_mentioned ? 'YES' : 'NO'}`);
      console.log(`🥇 Ranking Position: ${er.evaluation.ranking_position !== null ? `#${er.evaluation.ranking_position}` : 'Unranked'}`);
      console.log(`⚔️ Competitors Mentioned: ${er.evaluation.competitors_mentioned?.length ? er.evaluation.competitors_mentioned.join(', ') : 'None'}`);
      console.log(`🔗 Citations Extracted (${er.evaluation.citations?.length || 0}):`);
      if (er.evaluation.citations && er.evaluation.citations.length > 0) {
        er.evaluation.citations.forEach((c) => {
          console.log(`   - [${c.domain}] ${c.url} (Target Brand: ${c.is_target_brand ? 'YES' : 'NO'})`);
        });
      } else {
        console.log(`   - No explicit URLs cited`);
      }
      console.log(`\n📝 Full Claude Raw Response Output:`);
      console.log(`------------------------------------------------------------------------`);
      console.log(er.rawText.trim());
      console.log(`------------------------------------------------------------------------`);
    });
  }

  // ---------------------------------------------------------------------------
  // STEP 5: VERIFY PERSISTENCE IN SUPABASE
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('📊 DATABASE VERIFICATION & AUDIT TELEMETRY SUMMARY');
  console.log('========================================================================');

  const { data: dbRuns } = await supabase
    .from('runs')
    .select('id, prompt_id, status, created_at')
    .in('prompt_id', createdPromptRows.map((p) => p.id));

  console.log(`✅ Total Audit Runs Created: ${dbRuns?.length || 0}`);

  const { data: dbResponses } = await supabase
    .from('engine_responses')
    .select('id, engine_name, model, visibility_score, sentiment, created_at')
    .in('run_id', (dbRuns || []).map((r) => r.id));

  console.log(`✅ Total Engine Responses Recorded in Supabase: ${dbResponses?.length || 0}`);
  (dbResponses || []).forEach((r, i) => {
    console.log(`   ${i + 1}. [${r.engine_name} - ${r.model}] Score: ${r.visibility_score}% | Sentiment: ${r.sentiment}`);
  });

  const { data: dbCitations } = await supabase
    .from('citations')
    .select('id, url, domain, is_target_brand, created_at')
    .in('response_id', (dbResponses || []).map((r) => r.id));

  console.log(`✅ Total Citations Extracted & Indexed in Supabase: ${dbCitations?.length || 0}`);

  console.log('\n========================================================================');
  console.log('🎉 FULL LIVE AUDIT TEST COMPLETE: ALL REAL DATA FROM ANTHROPIC CLAUDE');
  console.log('========================================================================');
}

runLiveAuditTest().catch((err) => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
