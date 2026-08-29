import { NextRequest, NextResponse } from 'next/server';
import { detectBrandNiche } from '@/lib/actions/brand-niche-detection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandName, domain } = body;

    if (!brandName && !domain) {
      return NextResponse.json(
        { error: 'brandName or domain is required' },
        { status: 400 }
      );
    }

    const result = await detectBrandNiche({ brandName, domain });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/brand/detect-niche] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect market niche' },
      { status: 500 }
    );
  }
}
