-- 0003_action_recommendations.sql
-- Migration: AI Action Recommendations & Optimization Playbook

-- 1. Create action_recommendations table
CREATE TABLE IF NOT EXISTS public.action_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
    engine_name TEXT NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN ('Content Gap', 'Competitor Edge', 'Sentiment')),
    title TEXT NOT NULL,
    explanation TEXT NOT NULL,
    drafted_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes for performance and query optimization
CREATE INDEX IF NOT EXISTS idx_action_recommendations_brand_id ON public.action_recommendations(brand_id);
CREATE INDEX IF NOT EXISTS idx_action_recommendations_prompt_id ON public.action_recommendations(prompt_id);
CREATE INDEX IF NOT EXISTS idx_action_recommendations_status ON public.action_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_action_recommendations_created_at ON public.action_recommendations(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.action_recommendations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Users can only view, insert, update, or delete recommendations for brands they own)
CREATE POLICY "Users can view recommendations for own brands"
    ON public.action_recommendations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = action_recommendations.brand_id
              AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recommendations for own brands"
    ON public.action_recommendations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = action_recommendations.brand_id
              AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update recommendations for own brands"
    ON public.action_recommendations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = action_recommendations.brand_id
              AND brands.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = action_recommendations.brand_id
              AND brands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete recommendations for own brands"
    ON public.action_recommendations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.brands
            WHERE brands.id = action_recommendations.brand_id
              AND brands.user_id = auth.uid()
        )
    );
