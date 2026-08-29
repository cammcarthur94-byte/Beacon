-- ============================================================================
-- Migration: 20260829_audit_reports_and_branding.sql
-- Description: Creates audit_reports table and adds white-label branding columns
-- ============================================================================

-- 1. Create audit_reports table for automated white-labeled PDF generation
CREATE TABLE IF NOT EXISTS public.audit_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID,
  raw_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_narrative JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by workspace and created_at
CREATE INDEX IF NOT EXISTS idx_audit_reports_workspace_id ON public.audit_reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_reports_created_at ON public.audit_reports(created_at DESC);

-- Enable RLS on audit_reports
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and service roles access
CREATE POLICY "Allow public select on audit_reports"
  ON public.audit_reports FOR SELECT
  USING (true);

CREATE POLICY "Allow service and authenticated insert on audit_reports"
  ON public.audit_reports FOR INSERT
  WITH CHECK (true);

-- 2. Update existing workspaces table (and brands table) for white-label branding
DO $$
BEGIN
  -- Check and add columns to workspaces if table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workspaces') THEN
    ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS logo_url TEXT;
    ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5';
    ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS company_name TEXT;
  END IF;

  -- Also ensure brands table has white-label columns
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'brands') THEN
    ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
    ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#4f46e5';
    ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS company_name TEXT;
  END IF;
END $$;

-- 3. Seed Sample Audit Report for testing print and PDF generator endpoints
INSERT INTO public.audit_reports (id, raw_metrics, ai_narrative, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '{
    "brand_name": "Acme Sync",
    "domain": "acmelabs.com",
    "period": "Past 7 Days",
    "global_visibility_score": 74.2,
    "total_citations": 1428,
    "share_of_voice": {
      "Acme Sync": 44,
      "OmniSync": 28,
      "Nexus AI": 18,
      "Apex Platform": 10
    },
    "engine_scores": {
      "chatgpt": 84,
      "perplexity": 86,
      "gemini": 72,
      "claude": 69,
      "copilot": 70
    },
    "blind_spots_count": 2,
    "prompts_evaluated": 18
  }'::jsonb,
  '{
    "executive_summary": "Acme Sync maintained a commanding 74.2% global AI visibility score over the past 7 days, capturing 1,428 high-authority publisher citations. Perplexity and ChatGPT remain the primary traffic and citation drivers, while Gemini and Claude demonstrate untapped expansion opportunities in technical change data capture queries.",
    "areas_of_concern": [
      "Gemini citation frequency lags by 14% on complex SQL streaming prompts due to missing Schema.org TechArticle markup.",
      "Claude Haiku frequently references rival OmniSync on pricing comparisons where tabular benchmarks are absent from public documentation.",
      "Direct API reference pages at /api/v2/streaming lack structured JSON-LD schemas, causing partial answer engine attribution."
    ],
    "recommendations": [
      {
        "title": "Deploy Schema.org TechArticle & SoftwareApplication JSON-LD",
        "impact": "CRITICAL",
        "action": "Inject structured JSON-LD schemas on all API documentation pages to increase Gemini and Copilot knowledge graph indexing.",
        "target_engine": "Gemini & Copilot"
      },
      {
        "title": "Publish Head-to-Head Comparative Architecture Whitepaper",
        "impact": "HIGH",
        "action": "Deploy verified latency and throughput benchmark tables comparing Acme Sync vs. OmniSync to resolve Claude comparison blind spots.",
        "target_engine": "Claude"
      },
      {
        "title": "Expand High-Authority Technical PR Placements",
        "impact": "MEDIUM",
        "action": "Syndicate multi-cloud data streaming articles across InfoQ and HackerNoon to solidify Perplexity Sonar Pro citations.",
        "target_engine": "Perplexity"
      }
    ]
  }'::jsonb,
  now()
)
ON CONFLICT (id) DO NOTHING;
