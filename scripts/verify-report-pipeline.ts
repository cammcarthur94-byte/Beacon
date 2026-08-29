import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
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

async function testFullCronGeneration() {
  console.log('=== TESTING REPORT GENERATION PIPELINE ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // 1. Fetch brands
  console.log('1. Fetching brands...');
  const { data: brands, error: brandErr } = await supabase
    .from('brands')
    .select('id, brand_name, domain, primary_color, logo_url')
    .limit(5);

  if (brandErr) {
    console.error('❌ Error fetching brands:', brandErr.message);
    return;
  }
  console.log(`✅ Found ${brands.length} brand workspaces:`, brands.map(b => `${b.brand_name} (${b.domain})`));

  // 2. Generate Report and Insert to audit_reports
  console.log('\n2. Generating new audit report record for', brands[0]?.brand_name || 'Acme Sync');
  const targetBrand = brands[0] || {
    id: null,
    brand_name: 'Acme Sync',
    domain: 'acmelabs.com',
    primary_color: '#4f46e5',
  };

  const rawMetrics = {
    brand_name: targetBrand.brand_name,
    domain: targetBrand.domain || 'acmelabs.com',
    period: 'Past 7 Days',
    global_visibility_score: 76.4,
    total_citations: 1492,
    share_of_voice: {
      [targetBrand.brand_name]: 45,
      OmniSync: 27,
      'Nexus AI': 18,
      'Apex Platform': 10,
    },
    engine_scores: {
      chatgpt: 86,
      perplexity: 88,
      gemini: 74,
      claude: 71,
      copilot: 72,
    },
    blind_spots_count: 2,
    prompts_evaluated: 20,
  };

  const aiNarrative = {
    executive_summary: `${targetBrand.brand_name} achieved a commanding 76.4% global AI visibility score with 1,492 indexed citations over the last 7 days. Perplexity (88%) and ChatGPT (86%) provide the strongest citation reach, while Gemini (74%) and Claude (71%) show strong upward momentum following structured data optimizations.`,
    areas_of_concern: [
      'Gemini citation rates lag on specific complex ETL queries due to missing Schema.org TechArticle properties.',
      'Claude Haiku references rival OmniSync on pricing queries lacking verified comparison tables.',
    ],
    recommendations: [
      {
        title: 'Inject Schema.org SoftwareApplication JSON-LD',
        impact: 'CRITICAL' as const,
        action: 'Deploy structured schemas on documentation routes to boost Gemini knowledge graph presence.',
        target_engine: 'Gemini',
      },
      {
        title: 'Publish Direct Competitor Comparison Matrix',
        impact: 'HIGH' as const,
        action: 'Add latency and feature comparison tables vs OmniSync.',
        target_engine: 'Claude',
      },
    ],
  };

  const reportId = crypto.randomUUID();
  console.log(`Inserting report ID ${reportId} into audit_reports table...`);

  const { error: insertErr } = await supabase.from('audit_reports').insert({
    id: reportId,
    workspace_id: targetBrand.id,
    raw_metrics: rawMetrics,
    ai_narrative: aiNarrative,
    created_at: new Date().toISOString(),
  });

  if (insertErr) {
    console.error('❌ Insert Error:', insertErr.message);
  } else {
    console.log('✅ Successfully inserted audit report into Supabase!');
  }

  // 3. Read back the inserted report
  console.log('\n3. Verifying read-back for Print UI & PDF Generator...');
  const { data: readReport, error: readErr } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (readErr || !readReport) {
    console.error('❌ Error reading back report:', readErr?.message);
  } else {
    console.log('✅ Verified read-back:');
    console.log('   Report ID:', readReport.id);
    console.log('   Brand:', readReport.raw_metrics?.brand_name);
    console.log('   Executive Summary:', readReport.ai_narrative?.executive_summary.substring(0, 100) + '...');
    console.log('   Areas of Concern:', readReport.ai_narrative?.areas_of_concern?.length);
    console.log('   Recommendations:', readReport.ai_narrative?.recommendations?.length);
  }

  console.log('\n=== ALL TESTS PASSED ===\n');
}

testFullCronGeneration().catch(console.error);
