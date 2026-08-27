-- 0004_schema_expansion.sql
-- Migration: Add missing columns for domain, industry, prompt pillars, and intent classifications

-- 1. Brands Table Extensions
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Prompts Table Extensions
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS pillar TEXT DEFAULT 'GEO' CHECK (pillar IN ('GEO', 'AEO', 'AIO'));
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS intent TEXT DEFAULT 'Informational' CHECK (intent IN ('Informational', 'Commercial', 'Transactional', 'Navigational'));
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Unbranded' CHECK (type IN ('Branded', 'Unbranded'));

-- 3. Additional Citations & Responses Indexing
CREATE INDEX IF NOT EXISTS idx_prompts_pillar ON public.prompts(pillar);
CREATE INDEX IF NOT EXISTS idx_prompts_intent ON public.prompts(intent);
CREATE INDEX IF NOT EXISTS idx_engine_responses_visibility_score ON public.engine_responses(visibility_score);
