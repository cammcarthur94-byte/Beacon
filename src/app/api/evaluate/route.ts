import { NextRequest, NextResponse } from 'next/server';
import { evaluateEngineResponse } from '@/lib/ai/dispatcher';

export const dynamic = 'force-dynamic';

/**
 * POST /api/evaluate
 *
 * Evaluates raw AI engine response against strict AEO rubrics.
 *
 * Expected Request Body:
 * {
 *   "target_brand": string (or "targetBrand" / "brand_name"),
 *   "brand_domain"?: string (or "brandDomain"),
 *   "competitors"?: string[],
 *   "ai_response": string (or "aiResponse" / "raw_text" / "text")
 * }
 *
 * Returns:
 * {
 *   "sentiment": "Positive" | "Neutral" | "Negative" | "Omitted",
 *   "visibility_score": 100 | 75 | 50 | 25 | 0,
 *   "citations": [
 *     {
 *       "url": string,
 *       "domain": string,
 *       "is_target_brand": boolean
 *     }
 *   ],
 *   "competitors_mentioned": string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const targetBrand =
      body.target_brand ||
      body.targetBrand ||
      body.brand_name ||
      body.brandName ||
      body.brand;
    const brandDomain = body.brand_domain || body.brandDomain;
    const rawCompetitors = body.competitors || [];
    const competitors: string[] = Array.isArray(rawCompetitors)
      ? rawCompetitors.map((c: unknown) => String(c).trim()).filter(Boolean)
      : [];
    const aiResponse =
      body.ai_response ||
      body.aiResponse ||
      body.raw_text ||
      body.rawText ||
      body.text;

    if (!targetBrand || typeof targetBrand !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: "target_brand" must be a non-empty string.' },
        { status: 400 }
      );
    }

    if (!aiResponse || typeof aiResponse !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: "ai_response" must be a non-empty string.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateEngineResponse(
      aiResponse,
      targetBrand,
      competitors,
      brandDomain
    );

    // Return the strict JSON output format
    return NextResponse.json({
      sentiment: evaluation.sentiment,
      visibility_score: evaluation.visibility_score,
      citations: evaluation.citations,
      competitors_mentioned: evaluation.competitors_mentioned,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/evaluate:', errorMsg);
    return NextResponse.json(
      { error: `Evaluation processing failed: ${errorMsg}` },
      { status: 500 }
    );
  }
}
