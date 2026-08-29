import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

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

const ReportNarrativeSchema = z.object({
  executive_summary: z.string(),
  areas_of_concern: z.array(z.string()),
  recommendations: z.array(
    z.object({
      title: z.string(),
      impact: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']),
      action: z.string(),
      target_engine: z.string(),
    })
  ),
});

async function main() {
  console.log('=== TEST REPORT GENERATION ===\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('1. Checking Supabase Credentials:');
  console.log('   URL:', supabaseUrl ? 'Found (' + supabaseUrl + ')' : 'Missing');
  console.log('   Key:', supabaseKey ? 'Found' : 'Missing');

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // Test 1: Check audit_reports table in Supabase
  console.log('\n2. Testing audit_reports table in Supabase...');
  const { data: reports, error: reportErr } = await supabase
    .from('audit_reports')
    .select('*')
    .limit(5);

  if (reportErr) {
    console.error('   ❌ Error querying audit_reports table:', reportErr.message);
    console.log('   (Note: Table might not exist yet in remote Supabase if migration SQL has not been executed in Supabase SQL editor)');
  } else {
    console.log('   ✅ Successfully queried audit_reports. Found', reports.length, 'records.');
    if (reports.length > 0) {
      console.log('   Latest report ID:', reports[0].id);
    }
  }

  // Test 2: Check workspaces/brands table
  console.log('\n3. Testing brands/workspaces table...');
  const { data: brands, error: brandErr } = await supabase
    .from('brands')
    .select('id, name, domain, primary_color, logo_url')
    .limit(5);

  if (brandErr) {
    console.error('   ❌ Error querying brands table:', brandErr.message);
  } else {
    console.log('   ✅ Successfully queried brands table. Found', brands.length, 'records:');
    brands.forEach((b) => console.log(`      - ${b.name} (${b.domain}) [color: ${b.primary_color || 'none'}, logo: ${b.logo_url || 'none'}]`));
  }

  // Test 3: Test Gemini AI SDK generation
  console.log('\n4. Testing Gemini AI Narrative Generation...');
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log('   Gemini Key configured:', geminiKey ? 'Yes (starts with ' + geminiKey.substring(0, 8) + '...)' : 'No');

  if (!geminiKey) {
    console.warn('   ⚠️ GEMINI_API_KEY is not set.');
  } else {
    try {
      const googleProvider = createGoogleGenerativeAI({
        apiKey: geminiKey,
      });

      const rawMetrics = {
        brand_name: 'Acme Sync',
        domain: 'acmelabs.com',
        period: 'Last 7 Days',
        global_visibility_score: 74.2,
        total_citations: 1428,
        share_of_voice: {
          'Acme Sync': 44,
          OmniSync: 28,
          'Nexus AI': 18,
          'Apex Platform': 10,
        },
        engine_scores: {
          chatgpt: 84,
          perplexity: 86,
          gemini: 72,
          claude: 69,
          copilot: 70,
        },
        blind_spots_count: 2,
        prompts_evaluated: 18,
      };

      const { object } = await generateObject({
        model: googleProvider('gemini-1.5-pro'),
        schema: ReportNarrativeSchema,
        prompt: `Analyze the following GEO metrics for Acme Sync (acmelabs.com):
${JSON.stringify(rawMetrics, null, 2)}
Generate an executive summary, critical areas of concern, and actionable recommendations.`,
      });

      console.log('   ✅ Successfully generated structured AI narrative!');
      console.log('   Executive Summary preview:', object.executive_summary.substring(0, 120) + '...');
      console.log('   Areas of Concern count:', object.areas_of_concern.length);
      console.log('   Recommendations count:', object.recommendations.length);
    } catch (aiErr: any) {
      console.error('   ❌ Gemini AI SDK Error:', aiErr.message);
    }
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

main().catch(console.error);
