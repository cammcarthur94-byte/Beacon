'use server';

import { queryPerplexity, queryClaude, queryChatGPT } from '@/lib/ai/dispatcher';

export interface BrandNicheDetectionResult {
  success: boolean;
  industry: string;
  targetMarketNiche: string;
  description: string;
  suggestedCompetitors: {
    name: string;
    domain: string;
  }[];
  groundingSources?: string[];
  sourceEngine?: string;
  error?: string;
}

/**
 * Perform live grounded market research on a brand name and optional domain
 * to identify its exact industry, market niche, description, and direct competitors.
 */
export async function detectBrandNiche(payload: {
  brandName: string;
  domain?: string;
}): Promise<BrandNicheDetectionResult> {
  const brandName = payload.brandName?.trim();
  const domain = payload.domain?.trim() || '';

  if (!brandName && !domain) {
    return {
      success: false,
      industry: '',
      targetMarketNiche: '',
      description: '',
      suggestedCompetitors: [],
      error: 'Please provide a brand name or website domain.',
    };
  }

  const querySubject = brandName || domain;
  const domainContext = domain ? ` (official domain: ${domain})` : '';

  // Prompt requesting structured grounded analysis
  const prompt = `You are an expert market intelligence analyst. Perform grounded online research to analyze the following company/product:
Brand Name: "${querySubject}"${domainContext}

Determine:
1. Exact Primary Industry (e.g., "Developer Tools & API Infrastructure", "Enterprise Fintech & Payment Gateway", "AI Infrastructure & Vector Database", "Cybersecurity & Identity Governance", "B2B SaaS / CRM & Marketing Automation").
2. Specific Target Market / Niche (a precise 1-sentence definition of their core offering and buyer persona).
3. Concise Executive Description (2-3 sentences summarizing the product's value proposition, key features, and architecture).
4. Top 3 to 5 Direct Competitor Companies and their domains.

Return ONLY a valid JSON object matching this exact JSON format without markdown code fence wrapper if possible, or inside standard json fences:
{
  "industry": "Specific Industry Category",
  "targetMarketNiche": "Precise niche and audience definition",
  "description": "2-3 sentence executive description of the product",
  "competitors": [
    { "name": "Competitor Name", "domain": "competitor.com" }
  ]
}`;

  let groundedSources: string[] = [];
  let rawText = '';
  let sourceEngine = '';

  // 1. Try Perplexity first (real-time web grounded search model)
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      const pRes = await queryPerplexity(prompt);
      rawText = pRes.text;
      groundedSources = pRes.citations || [];
      sourceEngine = 'Perplexity Online Grounding';
    } catch (err: any) {
      console.warn('[detectBrandNiche] Perplexity query error, falling back:', err.message);
    }
  }

  // 2. Fallback to Claude if Perplexity unavailable or returned empty
  if (!rawText && process.env.ANTHROPIC_API_KEY) {
    try {
      const cRes = await queryClaude(prompt);
      rawText = cRes.text;
      sourceEngine = 'Claude Market Intelligence';
    } catch (err: any) {
      console.warn('[detectBrandNiche] Claude query error, falling back:', err.message);
    }
  }

  // 3. Fallback to ChatGPT
  if (!rawText && process.env.OPENAI_API_KEY) {
    try {
      const gRes = await queryChatGPT(prompt);
      rawText = gRes.text;
      sourceEngine = 'OpenAI Market Analysis';
    } catch (err: any) {
      console.warn('[detectBrandNiche] ChatGPT query error:', err.message);
    }
  }

  if (!rawText) {
    return {
      success: false,
      industry: '',
      targetMarketNiche: '',
      description: '',
      suggestedCompetitors: [],
      error: 'Could not connect to AI search engine. Please check API key configuration.',
    };
  }

  // Parse JSON response
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON structure found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const formattedCompetitors = (Array.isArray(parsed.competitors) ? parsed.competitors : []).map((c: any) => ({
      name: typeof c === 'string' ? c : c.name || '',
      domain: (c.domain || `${(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`).replace(/^https?:\/\//, '').split('/')[0],
    })).filter((c: any) => c.name.trim().length > 0);

    return {
      success: true,
      industry: parsed.industry || 'Technology & B2B SaaS',
      targetMarketNiche: parsed.targetMarketNiche || '',
      description: parsed.description || '',
      suggestedCompetitors: formattedCompetitors,
      groundingSources: groundedSources,
      sourceEngine,
    };
  } catch (err: any) {
    console.error('[detectBrandNiche] Failed to parse AI JSON:', err.message, '\nRaw output:', rawText);
    return {
      success: false,
      industry: '',
      targetMarketNiche: '',
      description: '',
      suggestedCompetitors: [],
      error: 'Failed to parse market intelligence data.',
    };
  }
}
