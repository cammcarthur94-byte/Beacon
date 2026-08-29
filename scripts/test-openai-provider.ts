import * as fs from 'fs';
import * as path from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
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

async function testOpenAI() {
  const openAIKey = process.env.OPENAI_API_KEY;
  console.log('Testing OpenAI key:', openAIKey?.substring(0, 10));

  try {
    const openaiProvider = createOpenAI({
      apiKey: openAIKey,
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
      model: openaiProvider('gpt-4o-mini'),
      schema: ReportNarrativeSchema,
      prompt: `Analyze the following GEO metrics for Acme Sync (acmelabs.com):
${JSON.stringify(rawMetrics, null, 2)}
Generate an executive summary, critical areas of concern, and actionable recommendations.`,
    });

    console.log('✅ Successfully generated AI narrative via OpenAI provider:');
    console.log(JSON.stringify(object, null, 2));
  } catch (err: any) {
    console.error('❌ OpenAI error:', err.message);
  }
}

testOpenAI();
