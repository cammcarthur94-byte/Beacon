-- 0001_initial_schema.sql
-- Initial schema migration for GEO tracking platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    subscription_tier TEXT NOT NULL DEFAULT 'starter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, subscription_tier)
    VALUES (
        NEW.id,
        NEW.email,
        'starter'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. BRANDS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    competitors TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 3. PROMPTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 4. RUNS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. ENGINE RESPONSES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.engine_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.runs(id) ON DELETE CASCADE,
    engine_name TEXT NOT NULL,
    visibility_score INTEGER,
    sentiment TEXT,
    raw_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 6. CITATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.engine_responses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT,
    is_target_brand BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & RLS QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_brand_id ON public.prompts(brand_id);
CREATE INDEX IF NOT EXISTS idx_runs_prompt_id ON public.runs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_engine_responses_run_id ON public.engine_responses(run_id);
CREATE INDEX IF NOT EXISTS idx_citations_response_id ON public.citations(response_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engine_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 2. Brands Policies
CREATE POLICY "Users can manage own brands"
    ON public.brands FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Prompts Policies (Cascading via brands)
CREATE POLICY "Users can manage prompts for own brands"
    ON public.prompts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = prompts.brand_id
              AND brands.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = prompts.brand_id
              AND brands.user_id = auth.uid()
        )
    );

-- 4. Runs Policies (Cascading via prompts -> brands)
CREATE POLICY "Users can manage runs for own prompts"
    ON public.runs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.prompts
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE prompts.id = runs.prompt_id
              AND brands.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE prompts.id = runs.prompt_id
              AND brands.user_id = auth.uid()
        )
    );

-- 5. Engine Responses Policies (Cascading via runs -> prompts -> brands)
CREATE POLICY "Users can manage engine responses for own runs"
    ON public.engine_responses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.runs
            JOIN public.prompts ON prompts.id = runs.prompt_id
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE runs.id = engine_responses.run_id
              AND brands.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.runs
            JOIN public.prompts ON prompts.id = runs.prompt_id
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE runs.id = engine_responses.run_id
              AND brands.user_id = auth.uid()
        )
    );

-- 6. Citations Policies (Cascading via engine_responses -> runs -> prompts -> brands)
CREATE POLICY "Users can manage citations for own engine responses"
    ON public.citations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.engine_responses
            JOIN public.runs ON runs.id = engine_responses.run_id
            JOIN public.prompts ON prompts.id = runs.prompt_id
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE engine_responses.id = citations.response_id
              AND brands.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.engine_responses
            JOIN public.runs ON runs.id = engine_responses.run_id
            JOIN public.prompts ON prompts.id = runs.prompt_id
            JOIN public.brands ON brands.id = prompts.brand_id
            WHERE engine_responses.id = citations.response_id
              AND brands.user_id = auth.uid()
        )
    );
