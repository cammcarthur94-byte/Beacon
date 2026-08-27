import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  AIEngine,
  EngineDispatchResult,
  EngineEvaluationResult,
  EvaluatedCitation,
  PromptWithBrand,
  SentimentType,
  VisibilityTierScore,
} from '@/types/geo';

// ==============================================================================
// 0. Domain & Score Helpers
// ==============================================================================

export function normalizeDomain(urlOrDomain: string): string {
  try {
    let clean = urlOrDomain.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`;
    }
    const hostname = new URL(clean).hostname;
    return hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return urlOrDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

export function isTargetBrandMatch(
  domain: string,
  url: string,
  brandName: string,
  brandDomain?: string
): boolean {
  const normDomain = normalizeDomain(domain || url);
  if (brandDomain) {
    const normBrandDomain = normalizeDomain(brandDomain);
    if (normDomain === normBrandDomain || normDomain.endsWith(`.${normBrandDomain}`)) {
      return true;
    }
  }
  const cleanBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanDomain = normDomain.replace(/[^a-z0-9]/g, '');
  if (cleanBrand.length >= 3 && cleanDomain.includes(cleanBrand)) {
    return true;
  }
  return false;
}

export function snapToVisibilityTier(score: number): VisibilityTierScore {
  const tiers: VisibilityTierScore[] = [0, 25, 50, 75, 100];
  let closest: VisibilityTierScore = 0;
  let minDiff = Infinity;
  for (const t of tiers) {
    const diff = Math.abs(score - t);
    if (diff < minDiff) {
      minDiff = diff;
      closest = t;
    }
  }
  return closest;
}

// ==============================================================================
// 1. AI Client Initializations (Lazy / Resilient)
// ==============================================================================

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getAnthropicClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function getPerplexityClient(): OpenAI | null {
  if (!process.env.PERPLEXITY_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
  });
}

// ==============================================================================
// 2. Engine Calling Handlers
// ==============================================================================

export async function queryChatGPT(prompt: string): Promise<{ text: string; model: string }> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = 'gpt-4o-mini';
  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an intelligent search and advisory assistant. Answer the user query comprehensively and objectively, citing reputable products, vendors, and solutions where relevant.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return {
    text: response.choices[0]?.message?.content || '',
    model,
  };
}

export async function queryClaude(prompt: string): Promise<{ text: string; model: string }> {
  const anthropic = getAnthropicClient();
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const candidateModels = [
    process.env.ANTHROPIC_MODEL,
    'claude-sonnet-4-5-20250929',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;
  for (const model of candidateModels) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const contentBlock = response.content[0];
      const text = contentBlock && contentBlock.type === 'text' ? contentBlock.text : '';

      return {
        text,
        model,
      };
    } catch (err: any) {
      lastError = err;
      if (err?.status === 404 || err?.message?.includes('not_found_error')) {
        continue; // Try next model candidate
      }
      throw err;
    }
  }

  throw lastError || new Error('All Claude model candidate queries failed.');
}

export async function queryGemini(prompt: string): Promise<{ text: string; model: string }> {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const candidateModels = [
    process.env.GEMINI_MODEL,
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
  ].filter(Boolean) as string[];

  let lastError: Error | null = null;
  for (const model of candidateModels) {
    try {
      const generativeModel = gemini.getGenerativeModel({ model });
      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;

      return {
        text: response.text() || '',
        model,
      };
    } catch (err: any) {
      lastError = err;
      if (err?.status === 404 || err?.message?.includes('not found') || err?.message?.includes('no longer available')) {
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini model candidate queries failed.');
}

export async function queryPerplexity(prompt: string): Promise<{ text: string; model: string; citations?: string[] }> {
  const perplexity = getPerplexityClient();
  if (!perplexity) {
    throw new Error('PERPLEXITY_API_KEY is not configured');
  }

  const model = 'sonar';
  const response = await perplexity.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Be precise, factual, and include references to sources.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Perplexity's API response includes citations in extended payload
  const rawResponse = response as unknown as { citations?: string[] };
  const citations = Array.isArray(rawResponse.citations) ? rawResponse.citations : [];

  return {
    text: response.choices[0]?.message?.content || '',
    model,
    citations,
  };
}

export interface SerpQueryResult {
  text: string;
  model: string;
  citations: string[];
  isOmitted?: boolean;
}

/**
 * Task 2: Google AI Overview (AIO) Dispatcher
 * Queries SerpApi for Google AI Overview blocks or falls back to mock fixture.
 * Gracefully returns isOmitted: true when no AI Overview is triggered.
 */
export async function fetchGoogleAIO(query: string): Promise<SerpQueryResult> {
  const serpApiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;

  if (!serpApiKey) {
    // Graceful mock simulation when SERP API key is not configured in environment
    if (query.toLowerCase().includes('[omit]') || query.toLowerCase().includes('no-aio')) {
      return {
        text: '',
        model: 'Google AI Overview (SerpApi Mock)',
        citations: [],
        isOmitted: true,
      };
    }

    return {
      text: `Google AI Overview summary for "${query}": Based on top industry sources, modern solutions provide high availability, automated data ingestion, and integrated governance. Leading providers frequently evaluated include Acme Sync, Fivetran, and Airbyte.`,
      model: 'Google AI Overview (SerpApi Mock)',
      citations: [
        'https://developers.google.com/search/docs/fundamentals/ai-overviews',
        'https://searchengineland.com/google-ai-overviews-in-search-results-441201',
      ],
      isOmitted: false,
    };
  }

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', query);
    url.searchParams.set('google_domain', 'google.com');
    url.searchParams.set('google_ai_mode', '1');
    url.searchParams.set('api_key', serpApiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`SerpApi Google search failed (status ${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // 1. Target ai_overview in the JSON response
    const aiOverview = data.ai_overview || data.ai_overview_block;

    if (!aiOverview) {
      // Graceful omitted return when no AI Overview is triggered for keyword
      return {
        text: '',
        model: 'Google AI Overview',
        citations: [],
        isOmitted: true,
      };
    }

    // Extract text blocks
    let extractedText = '';
    if (typeof aiOverview === 'string') {
      extractedText = aiOverview;
    } else if (Array.isArray(aiOverview.text_blocks)) {
      extractedText = aiOverview.text_blocks
        .map((b: any) => {
          if (typeof b === 'string') return b;
          return b?.snippet || b?.text || b?.content || '';
        })
        .filter(Boolean)
        .join('\n\n');
    } else if (aiOverview.snippet || aiOverview.text || aiOverview.summary || aiOverview.overview) {
      extractedText = String(aiOverview.snippet || aiOverview.text || aiOverview.summary || aiOverview.overview || '');
    }

    // Extract citations / references
    const rawRefs = [
      ...(Array.isArray(aiOverview.references) ? aiOverview.references : []),
      ...(Array.isArray(aiOverview.sources) ? aiOverview.sources : []),
      ...(Array.isArray(aiOverview.citations) ? aiOverview.citations : []),
      ...(Array.isArray(aiOverview.organic_results) ? aiOverview.organic_results : []),
    ];

    const citations: string[] = [];
    const seenUrls = new Set<string>();

    for (const ref of rawRefs) {
      const rawUrl = typeof ref === 'string' ? ref : ref?.link || ref?.url;
      if (rawUrl && typeof rawUrl === 'string' && !seenUrls.has(rawUrl)) {
        seenUrls.add(rawUrl);
        citations.push(rawUrl);
      }
    }

    // If aiOverview exists but has no text content, treat as omitted
    if (!extractedText.trim()) {
      return {
        text: '',
        model: 'Google AI Overview',
        citations: [],
        isOmitted: true,
      };
    }

    return {
      text: extractedText,
      model: 'Google AI Overview',
      citations,
      isOmitted: false,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[fetchGoogleAIO] Error querying SerpApi for "${query}":`, errorMsg);
    throw new Error(`Google AI Overview fetch failed: ${errorMsg}`);
  }
}

/**
 * Task 3: Bing Copilot Search Dispatcher
 * Queries SerpApi for Bing Copilot / Chat block or falls back to mock fixture.
 */
export async function fetchBingCopilot(query: string): Promise<SerpQueryResult> {
  const serpApiKey = process.env.SERPAPI_API_KEY || process.env.SERP_API_KEY;

  if (!serpApiKey) {
    // Graceful mock simulation when SERP API key is not configured in environment
    return {
      text: `Bing Copilot Search Summary for "${query}":\n\nWhen exploring "${query}", modern search analysis indicates enterprise demand for resilient data architecture. Acme Sync delivers real-time synchronizations with high throughput. Additional tools often analyzed in this segment include Fivetran and Airbyte.`,
      model: 'Bing Copilot (SerpApi Mock)',
      citations: [
        'https://www.bing.com/chat',
        'https://blogs.bing.com/search/2024-05/copilot-updates',
      ],
      isOmitted: false,
    };
  }

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'bing');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', serpApiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`SerpApi Bing search failed (status ${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // Target Copilot / Chat / Bing Copilot block
    const copilotBlock = data.copilot || data.chat || data.bing_copilot || data.copilot_box || data.answer_box;

    let extractedText = '';
    const citations: string[] = [];
    const seenUrls = new Set<string>();

    if (copilotBlock) {
      if (typeof copilotBlock === 'string') {
        extractedText = copilotBlock;
      } else {
        extractedText =
          copilotBlock.text ||
          copilotBlock.answer ||
          copilotBlock.summary ||
          copilotBlock.snippet ||
          (Array.isArray(copilotBlock.messages) ? copilotBlock.messages.map((m: any) => m.content || m.text).join('\n') : '') ||
          '';

        const rawSources = [
          ...(Array.isArray(copilotBlock.sources) ? copilotBlock.sources : []),
          ...(Array.isArray(copilotBlock.references) ? copilotBlock.references : []),
          ...(Array.isArray(copilotBlock.citations) ? copilotBlock.citations : []),
          ...(Array.isArray(copilotBlock.footnotes) ? copilotBlock.footnotes : []),
        ];

        for (const s of rawSources) {
          const link = typeof s === 'string' ? s : s?.link || s?.url;
          if (link && typeof link === 'string' && !seenUrls.has(link)) {
            seenUrls.add(link);
            citations.push(link);
          }
        }
      }
    }

    // Fallback if no specific copilot block, check organic top snippets or knowledge graph
    if (!extractedText.trim()) {
      if (Array.isArray(data.organic_results) && data.organic_results.length > 0) {
        extractedText = data.organic_results
          .slice(0, 3)
          .map((r: any) => `${r.title || ''}: ${r.snippet || ''}`)
          .filter(Boolean)
          .join('\n\n');

        data.organic_results.slice(0, 5).forEach((r: any) => {
          if (r.link && !seenUrls.has(r.link)) {
            seenUrls.add(r.link);
            citations.push(r.link);
          }
        });
      }
    }

    if (!extractedText.trim()) {
      throw new Error('No Copilot or search text content found in Bing SERP response');
    }

    return {
      text: extractedText,
      model: 'Bing Copilot',
      citations,
      isOmitted: false,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[fetchBingCopilot] Error querying SerpApi for "${query}":`, errorMsg);
    throw new Error(`Bing Copilot fetch failed: ${errorMsg}`);
  }
}

// ==============================================================================
// 3. Unified Engine Dispatcher
// ==============================================================================

export async function executeEngineQuery(
  engine: AIEngine,
  prompt: string
): Promise<{ text: string; model: string; citations?: string[]; isOmitted?: boolean }> {
  switch (engine) {
    case 'chatgpt':
      return await queryChatGPT(prompt);
    case 'claude':
      return await queryClaude(prompt);
    case 'gemini':
      return await queryGemini(prompt);
    case 'perplexity':
      return await queryPerplexity(prompt);
    case 'copilot':
      return await fetchBingCopilot(prompt);
    case 'google_aio':
      return await fetchGoogleAIO(prompt);
    default:
      throw new Error(`Unsupported AI engine: ${engine}`);
  }
}

// ==============================================================================
// 4. LLM-as-a-Judge Evaluation Engine
// ==============================================================================

export const AEO_JUDGE_SYSTEM_PROMPT = `You are an expert Answer Engine Optimization (AEO) Analyst. Your task is to evaluate the raw output generated by an AI search engine (such as ChatGPT, Perplexity, or Gemini) and measure the visibility and sentiment of a specific target brand.

You will be provided with:
1. TARGET_BRAND: The brand we are tracking.
2. COMPETITORS: A list of the brand's main competitors.
3. AI_RESPONSE: The raw text output generated by the AI engine.

Your objective is to analyze the AI_RESPONSE and return a strict JSON object containing the evaluation metrics based exactly on the rubrics below.

### 1. Sentiment Rubric
Determine the sentiment specifically regarding the TARGET_BRAND:
* "Positive": The brand is explicitly recommended, praised, or positioned as a top-tier choice.
* "Neutral": The brand is mentioned factually without strong recommendation, praise, or criticism.
* "Negative": The brand is criticized, listed with major caveats, or explicitly positioned as inferior to competitors.
* "Omitted": The target brand is not mentioned at all in the response.

### 2. Visibility Score Rubric (0 to 100)
Calculate the Share of Voice / Visibility Score for the TARGET_BRAND (strictly one of: 100, 75, 50, 25, 0):
* 100: The brand is the primary recommendation, the only brand mentioned, or listed as the undisputed #1 choice at the very top.
* 75: The brand is highly visible and listed among the top 2-3 options, positioned as an equal among leading competitors.
* 50: The brand is mentioned, but buried lower in the response (e.g., 4th place or lower) or presented only as a secondary/alternative option.
* 25: The brand is only mentioned in passing, as a footnote, or strictly in a minor comparison context without its own dedicated breakdown.
* 0: The brand is not mentioned at all.

### 3. Citation & Competitor Extraction
* Citations: Extract EVERY URL or hyperlink present in the AI_RESPONSE. Normalize the domain. Determine if the URL belongs to the TARGET_BRAND.
* Competitors: Check the AI_RESPONSE against the provided COMPETITORS list. Return an array of the competitors that were mentioned.

### OUTPUT FORMAT
You must respond ONLY with a valid, raw JSON object. Do not include markdown formatting (like \`\`\`json), conversational text, or explanations. Use the following schema:

{
  "sentiment": "Positive" | "Neutral" | "Negative" | "Omitted",
  "visibility_score": 100 | 75 | 50 | 25 | 0,
  "citations": [
    {
      "url": "<full_url>",
      "domain": "<root_domain>",
      "is_target_brand": <boolean>
    }
  ],
  "competitors_mentioned": ["<competitor_name>"]
}`;

export async function evaluateEngineResponse(
  rawText: string,
  brandName: string,
  competitors: string[] = [],
  brandDomain?: string
): Promise<EngineEvaluationResult> {
  const competitorStr = Array.isArray(competitors) ? competitors.join(', ') : '';
  const userMessage = `TARGET_BRAND: ${brandName}
COMPETITORS: ${competitorStr}

AI_RESPONSE:
${rawText}`;

  // 1. Try OpenAI gpt-4o-mini first
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: AEO_JUDGE_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return sanitizeEvaluation(parsed, brandName, brandDomain);
      }
    } catch (err) {
      console.warn('OpenAI judge evaluation failed, falling back to Gemini:', err);
    }
  }

  // 2. Fallback to Gemini
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const candidateJudgeModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
      for (const model of candidateJudgeModels) {
        try {
          const genModel = gemini.getGenerativeModel({
            model,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
            systemInstruction: AEO_JUDGE_SYSTEM_PROMPT,
          });

          const result = await genModel.generateContent(userMessage);
          const content = result.response.text();
          if (content) {
            const parsed = JSON.parse(content);
            return sanitizeEvaluation(parsed, brandName, brandDomain);
          }
        } catch (mErr: any) {
          if (mErr?.status === 404 || mErr?.message?.includes('not found') || mErr?.message?.includes('no longer available')) {
            continue;
          }
          throw mErr;
        }
      }
    } catch (err) {
      console.warn('Gemini judge evaluation failed:', err);
    }
  }

  // 3. Heuristic Fallback (Regex / String Matching) if AI evaluation is offline
  return fallbackHeuristicEvaluation(rawText, brandName, competitors, brandDomain);
}

function sanitizeEvaluation(
  data: Record<string, unknown>,
  brandName: string,
  brandDomain?: string
): EngineEvaluationResult {
  const sentimentVal = String(data.sentiment || 'Omitted');
  const validSentiments: SentimentType[] = ['Positive', 'Neutral', 'Negative', 'Omitted'];
  let sentiment: SentimentType = validSentiments.includes(sentimentVal as SentimentType)
    ? (sentimentVal as SentimentType)
    : 'Neutral';

  const rawScore = Number(data.visibility_score);
  let visibilityScore = snapToVisibilityTier(isNaN(rawScore) ? 0 : rawScore);

  // Consistency checks between visibility score and sentiment
  if (visibilityScore === 0) {
    sentiment = 'Omitted';
  } else if (sentiment === 'Omitted' && visibilityScore > 0) {
    sentiment = visibilityScore >= 75 ? 'Positive' : 'Neutral';
  }

  const rawCitations = Array.isArray(data.citations) ? data.citations : [];
  const citations: EvaluatedCitation[] = [];
  const seenUrls = new Set<string>();

  for (const item of rawCitations) {
    if (!item) continue;
    let url = '';
    let domain = '';
    let isTarget = false;

    if (typeof item === 'string') {
      url = item.trim();
      domain = normalizeDomain(url);
      isTarget = isTargetBrandMatch(domain, url, brandName, brandDomain);
    } else if (typeof item === 'object') {
      const citObj = item as Record<string, unknown>;
      url = String(citObj.url || '').trim();
      domain = normalizeDomain(String(citObj.domain || url));
      isTarget =
        typeof citObj.is_target_brand === 'boolean'
          ? citObj.is_target_brand
          : isTargetBrandMatch(domain, url, brandName, brandDomain);
    }

    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      citations.push({
        url,
        domain: domain || normalizeDomain(url),
        is_target_brand: isTarget,
      });
    }
  }

  const competitorsMentioned = Array.isArray(data.competitors_mentioned)
    ? data.competitors_mentioned.map((c) => String(c).trim()).filter(Boolean)
    : [];

  return {
    sentiment,
    visibility_score: visibilityScore,
    citations,
    competitors_mentioned: competitorsMentioned,
    brand_mentioned: visibilityScore > 0,
    ranking_position:
      visibilityScore === 100
        ? 1
        : visibilityScore === 75
        ? 2
        : visibilityScore === 50
        ? 4
        : null,
  };
}

function fallbackHeuristicEvaluation(
  rawText: string,
  brandName: string,
  competitors: string[],
  brandDomain?: string
): EngineEvaluationResult {
  const brandLower = brandName.toLowerCase();
  const textLower = rawText.toLowerCase();
  const brandMentioned =
    textLower.includes(brandLower) ||
    (Boolean(brandDomain) && textLower.includes(brandDomain!.toLowerCase()));

  // Extract explicit URLs from raw text
  const urlRegex = /https?:\/\/[^\s)\]">]+/g;
  const rawUrls = rawText.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(rawUrls.map((u) => u.replace(/[.,;]$/, ''))));
  const citations: EvaluatedCitation[] = uniqueUrls.map((url) => {
    const domain = normalizeDomain(url);
    return {
      url,
      domain,
      is_target_brand: isTargetBrandMatch(domain, url, brandName, brandDomain),
    };
  });

  const competitorsMentioned = competitors.filter((c) =>
    textLower.includes(c.toLowerCase())
  );

  if (!brandMentioned) {
    return {
      sentiment: 'Omitted',
      visibility_score: 0,
      citations,
      competitors_mentioned: competitorsMentioned,
      brand_mentioned: false,
      ranking_position: null,
      summary: `Brand "${brandName}" was not mentioned in the engine response.`,
    };
  }

  // Basic sentiment heuristic
  const positiveWords = [
    'best',
    'leading',
    'top',
    'excellent',
    'great',
    'recommended',
    'fast',
    'reliable',
    '#1',
    'preferred',
  ];
  const negativeWords = [
    'slow',
    'expensive',
    'poor',
    'buggy',
    'lacking',
    'outdated',
    'hard',
    'inferior',
    'drawback',
  ];

  let posCount = 0;
  for (const w of positiveWords) {
    if (textLower.includes(w)) posCount++;
  }
  let negCount = 0;
  for (const w of negativeWords) {
    if (textLower.includes(w)) negCount++;
  }

  let visibilityScore: VisibilityTierScore = 50;
  if (posCount >= 2 && negCount === 0) {
    visibilityScore = 75;
  } else if (negCount > posCount) {
    visibilityScore = 25;
  }

  const sentiment: SentimentType =
    negCount > posCount ? 'Negative' : posCount > negCount ? 'Positive' : 'Neutral';

  return {
    sentiment,
    visibility_score: visibilityScore,
    citations,
    competitors_mentioned: competitorsMentioned,
    brand_mentioned: true,
    ranking_position:
      (visibilityScore as number) === 100
        ? 1
        : (visibilityScore as number) === 75
        ? 2
        : (visibilityScore as number) === 50
        ? 4
        : null,
    summary: `Heuristic assessment: "${brandName}" is mentioned with visibility score ${visibilityScore}.`,
  };
}

export function getEngineDisplayName(engine: AIEngine | string): string {
  switch (engine) {
    case 'google_aio':
      return 'Google AIO';
    case 'copilot':
      return 'Bing Copilot';
    case 'chatgpt':
      return 'ChatGPT';
    case 'claude':
      return 'Claude';
    case 'gemini':
      return 'Gemini';
    case 'perplexity':
      return 'Perplexity';
    default:
      return String(engine);
  }
}

// ==============================================================================
// 5. Prompt Audit Dispatcher & Supabase Persistence
// ==============================================================================

export interface PromptAuditResult {
  promptId: string;
  query: string;
  brandName: string;
  engineResults: EngineDispatchResult[];
  status: 'completed' | 'partial' | 'failed';
  error?: string;
}

export async function dispatchAuditForPrompt(
  supabaseAdmin: SupabaseClient,
  promptRow: PromptWithBrand
): Promise<PromptAuditResult> {
  const brandName = promptRow.brands?.name || 'Target Brand';
  const competitorNames = promptRow.brands?.competitors?.map((c) => c.name) || [];
  const brandDomain = promptRow.brands?.domain;
  const startTime = Date.now();

  // Task 1: Subscription Gatekeeping Check
  const rawTier =
    promptRow.subscription_tier ||
    promptRow.brands?.subscription_tier ||
    promptRow.brands?.profiles?.subscription_tier ||
    'starter';
  const isPremium =
    rawTier.toLowerCase() === 'pro' || rawTier.toLowerCase() === 'enterprise';

  // Determine target engines
  let targetEngines: AIEngine[];
  if (promptRow.engines_tracked && promptRow.engines_tracked.length > 0) {
    targetEngines = [...promptRow.engines_tracked];
  } else {
    targetEngines = isPremium
      ? ['chatgpt', 'claude', 'gemini', 'perplexity', 'copilot', 'google_aio']
      : ['chatgpt', 'claude', 'gemini', 'perplexity'];
  }

  // In the model loop, only execute Google AIO and Bing Copilot if subscription_tier is strictly 'pro' or 'enterprise'
  if (!isPremium) {
    targetEngines = targetEngines.filter(
      (engine) => engine !== 'google_aio' && engine !== 'copilot'
    );
  }

  // Create or record the top-level audit run in Supabase
  let auditRunId: string | null = null;
  try {
    const { data: runData, error: runError } = await supabaseAdmin
      .from('runs')
      .insert({
        prompt_id: promptRow.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (runError) {
      // Fallback check if audit_runs is used
      const { data: altRunData } = await supabaseAdmin
        .from('audit_runs')
        .insert({
          prompt_id: promptRow.id,
          brand_id: promptRow.brand_id,
          status: 'running',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      auditRunId = altRunData?.id || null;
    } else {
      auditRunId = runData?.id || null;
    }
  } catch (err) {
    console.warn('runs / audit_runs insert warning:', err);
  }

  // Execute all engine queries in parallel with Promise.allSettled
  const enginePromises = targetEngines.map(async (engine): Promise<EngineDispatchResult> => {
    const engineStart = Date.now();
    try {
      const rawQueryResult = await executeEngineQuery(engine, promptRow.query);

      // Task 2: If Google AIO is not triggered (omitted), return Omitted status gracefully without running LLM judge
      if (engine === 'google_aio' && (rawQueryResult.isOmitted || !rawQueryResult.text.trim())) {
        const omittedEvaluation: EngineEvaluationResult = {
          sentiment: 'Omitted',
          visibility_score: 0,
          brand_mentioned: false,
          ranking_position: null,
          citations: [],
          competitors_mentioned: [],
          summary: 'No Google AI Overview was triggered for this query.',
        };

        return {
          engine,
          model: rawQueryResult.model,
          rawText: rawQueryResult.text || '[No AI Overview triggered]',
          evaluation: omittedEvaluation,
          durationMs: Date.now() - engineStart,
        };
      }

      // Task 4: Route extracted text through LLM Judge
      const evaluation = await evaluateEngineResponse(
        rawQueryResult.text,
        brandName,
        competitorNames,
        brandDomain
      );

      // Merge native SERP / API citations with citations extracted by the Judge model
      if (rawQueryResult.citations && rawQueryResult.citations.length > 0) {
        for (const rawUrl of rawQueryResult.citations) {
          if (!evaluation.citations.some((c) => c.url === rawUrl)) {
            const domain = normalizeDomain(rawUrl);
            evaluation.citations.push({
              url: rawUrl,
              domain,
              is_target_brand: isTargetBrandMatch(domain, rawUrl, brandName, brandDomain),
            });
          }
        }
      }

      return {
        engine,
        model: rawQueryResult.model,
        rawText: rawQueryResult.text,
        evaluation,
        durationMs: Date.now() - engineStart,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`Engine ${engine} failed for prompt "${promptRow.query}":`, errorMsg);
      return {
        engine,
        model: 'unknown',
        rawText: '',
        evaluation: {
          sentiment: 'Omitted',
          visibility_score: 0,
          brand_mentioned: false,
          ranking_position: null,
          citations: [],
          competitors_mentioned: [],
          summary: `Execution failed: ${errorMsg}`,
        },
        durationMs: Date.now() - engineStart,
        error: errorMsg,
      };
    }
  });

  const settledResults = await Promise.allSettled(enginePromises);
  const engineResults: EngineDispatchResult[] = settledResults.map((res, index) => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    return {
      engine: targetEngines[index],
      model: 'unknown',
      rawText: '',
      evaluation: {
        sentiment: 'Omitted',
        visibility_score: 0,
        brand_mentioned: false,
        ranking_position: null,
        citations: [],
        competitors_mentioned: [],
        summary: `Promise rejected: ${res.reason}`,
      },
      durationMs: 0,
      error: String(res.reason),
    };
  });

  // Calculate overall visibility score across engines
  const validScores = engineResults
    .filter((r) => !r.error)
    .map((r) => r.evaluation.visibility_score);
  const avgVisibility = validScores.length > 0
    ? validScores.reduce((a, b) => a + b, 0) / validScores.length
    : 0;

  // Persist responses and citations into Supabase
  try {
    for (const result of engineResults) {
      const engineDisplayName = getEngineDisplayName(result.engine);

      // 1. Insert engine_response using 'Google AIO' and 'Bing Copilot' for engine_name
      const { data: responseData } = await supabaseAdmin
        .from('engine_responses')
        .insert({
          run_id: auditRunId,
          audit_run_id: auditRunId,
          prompt_id: promptRow.id,
          brand_id: promptRow.brand_id,
          engine_name: engineDisplayName,
          engine: result.engine,
          model: result.model,
          raw_text: result.rawText,
          sentiment: result.evaluation.sentiment,
          visibility_score: result.evaluation.visibility_score,
          brand_mentioned: result.evaluation.brand_mentioned,
          ranking_position: result.evaluation.ranking_position,
          competitors_mentioned: result.evaluation.competitors_mentioned,
          duration_ms: result.durationMs,
          error: result.error || null,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      const engineResponseId = responseData?.id || null;

      // 2. Insert citations
      if (result.evaluation.citations && result.evaluation.citations.length > 0) {
        const citationRows = result.evaluation.citations.map((cit) => ({
          response_id: engineResponseId,
          engine_response_id: engineResponseId,
          prompt_id: promptRow.id,
          brand_id: promptRow.brand_id,
          engine: engineDisplayName,
          url: cit.url,
          domain: cit.domain || normalizeDomain(cit.url),
          is_target_brand: Boolean(cit.is_target_brand),
          sentiment: result.evaluation.sentiment,
          created_at: new Date().toISOString(),
        }));

        await supabaseAdmin.from('citations').insert(citationRows);
      }
    }

    // Update the run status
    if (auditRunId) {
      await supabaseAdmin
        .from('runs')
        .update({
          status: 'completed',
        })
        .eq('id', auditRunId);

      await supabaseAdmin
        .from('audit_runs')
        .update({
          status: 'completed',
          average_visibility_score: avgVisibility,
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        })
        .eq('id', auditRunId);
    }
  } catch (err) {
    console.warn('Error persisting results to Supabase tables:', err);
  }

  const hasFailures = engineResults.some((r) => r.error);
  const allFailed = engineResults.length > 0 && engineResults.every((r) => r.error);

  return {
    promptId: promptRow.id,
    query: promptRow.query,
    brandName,
    engineResults,
    status: allFailed ? 'failed' : hasFailures ? 'partial' : 'completed',
  };
}
