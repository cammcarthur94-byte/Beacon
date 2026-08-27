import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  ActionRecommendation,
  ActionRecommendationIssueType,
  AIEngine,
  PromptAuditResult,
  PromptWithBrand,
} from '@/types/geo';

// ==============================================================================
// 1. Exact LLM System Prompt (Task 4)
// ==============================================================================
export const GEO_RECOMMENDATION_SYSTEM_PROMPT = `You are an expert Generative Engine Optimization (GEO) Strategist. 
I will provide you with a TARGET_BRAND, a SEARCH_PROMPT, and the AI_RESPONSE that an AI engine generated. The TARGET_BRAND scored poorly in this response.

Your job is to analyze the AI_RESPONSE, figure out what content the TARGET_BRAND is missing that caused the AI to prefer competitors, and draft specific content to fix this gap.

OUTPUT FORMAT: Return ONLY a valid JSON object matching this schema:
{
  "issue_type": "Content Gap" | "Competitor Edge" | "Sentiment",
  "title": "A short, 5-7 word title of the action to take",
  "explanation": "A 2-sentence explanation of why the AI engine ignored the target brand in favor of others.",
  "drafted_content": "A specific, ready-to-publish markdown snippet (like a comparison table, an FAQ, or a feature highlight) that the brand should add to their website to give the AI engine the data it is missing."
}`;

export interface GeneratedRecommendationPayload {
  issue_type: ActionRecommendationIssueType;
  title: string;
  explanation: string;
  drafted_content: string;
}

// ==============================================================================
// 2. Multi-Provider LLM Orchestration (Cascade: GPT-4o -> Claude 3.5 -> Gemini -> Fallback)
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

/**
 * Generates an actionable recommendation using LLM reasoning
 */
export async function generateRecommendationWithLLM(
  targetBrand: string,
  searchPrompt: string,
  aiResponse: string,
  engineName: string
): Promise<GeneratedRecommendationPayload> {
  const userMessage = `TARGET_BRAND: ${targetBrand}
SEARCH_PROMPT: ${searchPrompt}
AI_ENGINE: ${engineName}

AI_RESPONSE:
${aiResponse}`;

  // 1. Try OpenAI GPT-4o (or gpt-4o-mini if gpt-4o rate limited)
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: GEO_RECOMMENDATION_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return sanitizeRecommendation(parsed, targetBrand, searchPrompt);
      }
    } catch (err) {
      console.warn('[RECOMMENDATION_ENGINE] OpenAI gpt-4o failed, trying Claude fallback:', err);
    }
  }

  // 2. Try Anthropic Claude 3.5 Sonnet
  const anthropic = getAnthropicClient();
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: GEO_RECOMMENDATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `${userMessage}\n\nRespond ONLY with a valid JSON object matching the requested schema.`,
          },
        ],
      });

      const contentBlock = response.content[0];
      const text = contentBlock && contentBlock.type === 'text' ? contentBlock.text : '';
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return sanitizeRecommendation(parsed, targetBrand, searchPrompt);
        }
      }
    } catch (err) {
      console.warn('[RECOMMENDATION_ENGINE] Anthropic Claude failed, trying Gemini fallback:', err);
    }
  }

  // 3. Try Google Gemini (1.5 Pro or Flash)
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
        systemInstruction: GEO_RECOMMENDATION_SYSTEM_PROMPT,
      });

      const result = await model.generateContent(userMessage);
      const text = result.response.text();
      if (text) {
        const parsed = JSON.parse(text);
        return sanitizeRecommendation(parsed, targetBrand, searchPrompt);
      }
    } catch (err) {
      console.warn('[RECOMMENDATION_ENGINE] Gemini failed, falling back to smart heuristic:', err);
    }
  }

  // 4. Fallback Heuristic Generator (Offline / Dev resilience)
  return fallbackHeuristicRecommendation(targetBrand, searchPrompt, aiResponse, engineName);
}

function sanitizeRecommendation(
  data: Record<string, unknown>,
  targetBrand: string,
  searchPrompt: string
): GeneratedRecommendationPayload {
  const rawIssue = String(data.issue_type || 'Content Gap');
  const validIssues: ActionRecommendationIssueType[] = ['Content Gap', 'Competitor Edge', 'Sentiment'];
  const issue_type: ActionRecommendationIssueType = validIssues.includes(rawIssue as ActionRecommendationIssueType)
    ? (rawIssue as ActionRecommendationIssueType)
    : 'Content Gap';

  const title = String(data.title || `Publish Dedicated Comparison for "${searchPrompt}"`).trim();
  const explanation = String(
    data.explanation ||
      `The engine cited competing solutions due to missing technical benchmarks and product breakdowns for ${targetBrand}. Publishing direct feature matrices will improve entity attribution.`
  ).trim();
  const drafted_content = String(
    data.drafted_content ||
      `## ${targetBrand} vs Alternatives for ${searchPrompt}\n\n| Feature | ${targetBrand} | Competitors |\n| :--- | :--- | :--- |\n| Deployment Speed | < 5 minutes | 1-2 hours |\n| Real-Time Sync | Native Webhooks | Polling only |\n| Pricing | Transparent usage | Custom quote |`
  ).trim();

  return {
    issue_type,
    title,
    explanation,
    drafted_content,
  };
}

function fallbackHeuristicRecommendation(
  targetBrand: string,
  searchPrompt: string,
  aiResponse: string,
  engineName: string
): GeneratedRecommendationPayload {
  const isCompetitorFocus = aiResponse.toLowerCase().includes('vs') || aiResponse.toLowerCase().includes('alternative');
  const issueType: ActionRecommendationIssueType = isCompetitorFocus ? 'Competitor Edge' : 'Content Gap';

  const title = `Add "${searchPrompt}" Feature Breakdown & Comparison`;
  const explanation = `${engineName} did not surface ${targetBrand} because competitor documentation explicitly targets the intent of "${searchPrompt}". Adding structured comparison data and schema markup will capture this entity query.`;

  const draftedContent = `### Why Choose ${targetBrand} for ${searchPrompt}

When evaluating platforms for **${searchPrompt}**, key architecture and operational capabilities determine total ROI.

| Evaluation Metric | ${targetBrand} | Industry Average |
| :--- | :--- | :--- |
| **Data Throughput** | Up to 100k events/sec | ~25k events/sec |
| **Setup Time** | Under 10 minutes | Multi-day onboarding |
| **Enterprise SLA** | 99.99% uptime guarantee | 99.9% uptime |
| **Pricing Model** | Predictable monthly tier | Opaque seat licensing |

#### Frequently Asked Questions

**How does ${targetBrand} handle ${searchPrompt}?**
${targetBrand} integrates out-of-the-box connectors and automated synchronization routines tailored directly for high-volume enterprise workflows.

**Can I migrate from existing tools?**
Yes, 1-click schema migration and automated ingestion scripts allow seamless transitions with zero downtime.`;

  return {
    issue_type: issueType,
    title,
    explanation,
    drafted_content: draftedContent,
  };
}

// ==============================================================================
// 3. Database Ingestion & Deduplication Handler
// ==============================================================================

export interface RecommendationTriggerInput {
  brandId: string;
  brandName: string;
  promptId: string;
  promptQuery: string;
  engineName: string;
  visibilityScore: number;
  rawResponseText: string;
}

/**
 * Evaluates a low-scoring prompt response (< 50) and generates an action recommendation if not already pending.
 */
export async function evaluateAndSaveRecommendation(
  supabaseAdmin: SupabaseClient,
  input: RecommendationTriggerInput
): Promise<ActionRecommendation | null> {
  const { brandId, brandName, promptId, promptQuery, engineName, visibilityScore, rawResponseText } = input;

  // Only trigger for prompts where visibility score is strictly under 50
  if (visibilityScore >= 50) {
    return null;
  }

  try {
    // 1. Deduplication check: Skip if an active 'pending' recommendation already exists for this brand, prompt & engine
    const { data: existing } = await supabaseAdmin
      .from('action_recommendations')
      .select('id, status')
      .eq('brand_id', brandId)
      .eq('prompt_id', promptId)
      .eq('engine_name', engineName)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      console.log(
        `[RECOMMENDATION_ENGINE] Pending recommendation already exists for brand=${brandId}, prompt=${promptId}, engine=${engineName}. Skipping generation.`
      );
      return null;
    }

    // 2. Generate actionable recommendation via LLM
    const generated = await generateRecommendationWithLLM(
      brandName,
      promptQuery,
      rawResponseText || `No response generated by ${engineName} for query "${promptQuery}".`,
      engineName
    );

    // 3. Insert into action_recommendations table
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('action_recommendations')
      .insert({
        brand_id: brandId,
        prompt_id: promptId,
        engine_name: engineName,
        issue_type: generated.issue_type,
        title: generated.title,
        explanation: generated.explanation,
        drafted_content: generated.drafted_content,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[RECOMMENDATION_ENGINE] Failed to insert recommendation:', insertError.message);
      return null;
    }

    return inserted as ActionRecommendation;
  } catch (err) {
    console.error('[RECOMMENDATION_ENGINE] Error in evaluateAndSaveRecommendation:', err);
    return null;
  }
}

/**
 * Main batch processor called at the end of the run-audits cron job.
 * Scans all audit results for any engine evaluation scoring < 50.
 */
export async function runRecommendationEngineForAuditResults(
  supabaseAdmin: SupabaseClient,
  auditResults: PromptAuditResult[],
  activePrompts: PromptWithBrand[]
): Promise<ActionRecommendation[]> {
  const createdRecommendations: ActionRecommendation[] = [];

  // Create lookup for prompt details
  const promptMap = new Map<string, PromptWithBrand>();
  activePrompts.forEach((p) => promptMap.set(p.id, p));

  for (const audit of auditResults) {
    const promptInfo = promptMap.get(audit.promptId);
    const brandId = promptInfo?.brand_id;
    const brandName = promptInfo?.brands?.name || audit.brandName || 'Target Brand';

    if (!brandId) continue;

    for (const engineResult of audit.engineResults) {
      const score = engineResult.evaluation?.visibility_score ?? 0;
      const engineDisplayName = formatEngineName(engineResult.engine);

      if (score < 50) {
        const rec = await evaluateAndSaveRecommendation(supabaseAdmin, {
          brandId,
          brandName,
          promptId: audit.promptId,
          promptQuery: audit.query,
          engineName: engineDisplayName,
          visibilityScore: score,
          rawResponseText: engineResult.rawText,
        });

        if (rec) {
          createdRecommendations.push(rec);
        }
      }
    }
  }

  return createdRecommendations;
}

function formatEngineName(engine: AIEngine): string {
  switch (engine) {
    case 'chatgpt':
      return 'ChatGPT';
    case 'claude':
      return 'Claude';
    case 'gemini':
      return 'Gemini';
    case 'perplexity':
      return 'Perplexity';
    case 'copilot':
      return 'Bing Copilot';
    case 'google_aio':
      return 'Google AI Overview';
    default:
      return engine;
  }
}
