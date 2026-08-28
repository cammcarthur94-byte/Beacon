-- 0005_audit_schedules.sql
-- Migration: Add target_engines to prompts and create audit_schedules table

-- 1. Extend prompts table with target_engines array
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS target_engines TEXT[] DEFAULT ARRAY['ChatGPT', 'Perplexity', 'Gemini', 'Claude', 'Copilot'];

-- 2. Create audit_schedules table
CREATE TABLE IF NOT EXISTS public.audit_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_brand_schedule UNIQUE (brand_id)
);

-- Indexing for fast cron polling
CREATE INDEX IF NOT EXISTS idx_audit_schedules_next_run 
ON public.audit_schedules(is_enabled, next_run_at);
