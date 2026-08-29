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

async function inspectSchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const supabase = createClient(supabaseUrl!, serviceRoleKey!, { auth: { persistSession: false } });

  // Test insert into runs
  const { data: runs, error: rErr } = await supabase.from('runs').select('*').limit(3);
  console.log('Runs sample:', runs, 'Error:', rErr);

  if (runs && runs.length > 0) {
    const runId = runs[0].id;
    const testResp = {
      run_id: runId,
      engine_name: 'Claude',
      visibility_score: 100,
      sentiment: 'Positive',
      raw_text: 'Test Claude response text',
      created_at: new Date().toISOString(),
    };

    const { data: insertedResp, error: insertErr } = await supabase
      .from('engine_responses')
      .insert(testResp)
      .select();

    console.log('Inserted response test:', insertedResp, 'Error:', insertErr);
  }
}

inspectSchema();
