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

import { detectBrandNiche } from '../src/lib/actions/brand-niche-detection';

async function testGroundedDetection() {
  console.log('Testing grounded niche identification on brand "Pinecone" (pinecone.io)...');
  const result = await detectBrandNiche({
    brandName: 'Pinecone',
    domain: 'pinecone.io',
  });

  console.log('\n--- Grounded Search Result ---');
  console.log('Success:', result.success);
  console.log('Engine:', result.sourceEngine);
  console.log('Industry:', result.industry);
  console.log('Target Market Niche:', result.targetMarketNiche);
  console.log('Description:', result.description);
  console.log('Competitors:', result.suggestedCompetitors);
  console.log('Sources:', result.groundingSources);
}

testGroundedDetection().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
