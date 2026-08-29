import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function clearAllProjects() {
  console.log('=== Cleaning all projects / brands and associated data across all accounts ===');

  // 1. Delete citations
  const { error: citErr } = await supabase
    .from('citations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted citations:', citErr ? citErr.message : 'OK');

  // 2. Delete engine_responses
  const { error: respErr } = await supabase
    .from('engine_responses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted engine_responses:', respErr ? respErr.message : 'OK');

  // 3. Delete runs
  const { error: runsErr } = await supabase
    .from('runs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted runs:', runsErr ? runsErr.message : 'OK');

  // 4. Delete action_recommendations
  const { error: actErr } = await supabase
    .from('action_recommendations')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted action_recommendations:', actErr ? actErr.message : 'OK');

  // 5. Delete prompts
  const { error: promptErr } = await supabase
    .from('prompts')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted prompts:', promptErr ? promptErr.message : 'OK');

  // 6. Delete brands / projects
  const { error: brandErr } = await supabase
    .from('brands')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('Deleted brands:', brandErr ? brandErr.message : 'OK');

  // 7. Verify remaining counts
  const { data: remainingBrands } = await supabase.from('brands').select('id, brand_name');
  const { data: remainingPrompts } = await supabase.from('prompts').select('id');
  const { data: remainingRuns } = await supabase.from('runs').select('id');
  const { data: remainingResponses } = await supabase.from('engine_responses').select('id');
  const { data: remainingCitations } = await supabase.from('citations').select('id');

  console.log('--- Verification Summary ---');
  console.log('Remaining Brands/Projects:', remainingBrands?.length ?? 0);
  console.log('Remaining Prompts:', remainingPrompts?.length ?? 0);
  console.log('Remaining Runs:', remainingRuns?.length ?? 0);
  console.log('Remaining Engine Responses:', remainingResponses?.length ?? 0);
  console.log('Remaining Citations:', remainingCitations?.length ?? 0);
  console.log('=== Cleanup complete! ===');
}

clearAllProjects().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});
