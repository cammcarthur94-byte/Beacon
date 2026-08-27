export type AIEngine = 'chatgpt' | 'claude' | 'perplexity' | 'gemini' | 'copilot' | 'google_aio';

export interface EngineMeta {
  id: AIEngine;
  name: string;
  model: string;
  color: string;
  iconName: string;
}

export interface Brand {
  id: string;
  name: string;
  domain: string;
  industry: string;
  description: string;
  competitors: Competitor[];
  createdAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  visibilityScore: number;
}

export interface PromptQuery {
  id: string;
  query: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  enginesTracked: AIEngine[];
  lastAudited: string;
  status: 'active' | 'paused';
  visibilityScore: number;
}

export interface DailyVisibilityPoint {
  date: string;
  overallScore: number;
  chatgpt: number;
  claude: number;
  perplexity: number;
  gemini: number;
  copilot: number;
  google_aio?: number;
  competitorAvg: number;
}

export interface EngineComparison {
  engine: AIEngine;
  name: string;
  score: number;
  citationCount: number;
  mentionRate: number; // percentage of prompts where brand is mentioned
  avgRank: number; // average ranking position when mentioned
  color: string;
}

export interface CitedUrl {
  id: string;
  url: string;
  title: string;
  domain: string;
  citationCount: number;
  engines: AIEngine[];
  sentiment: 'positive' | 'neutral' | 'negative';
  authorityScore: number;
  lastCited: string;
  isTargetBrand?: boolean;
}

export interface MatrixRow {
  promptId: string;
  query: string;
  category: string;
  engines: Partial<{
    [key in AIEngine]: {
      status: 'ranked_1' | 'top_3' | 'cited' | 'not_mentioned';
      rank?: number;
      citationUrl?: string;
    };
  }>;
}

export interface AuditRunSummary {
  id: string;
  timestamp: string;
  prompt: string;
  engine: AIEngine;
  status: 'completed' | 'running' | 'failed';
  citationsFound: number;
  visibilityImpact: '+2.4%' | '-1.1%' | '0.0%' | '+5.0%';
}

export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'Omitted';
export type VisibilityTierScore = 0 | 25 | 50 | 75 | 100;

export interface EvaluatedCitation {
  url: string;
  domain: string;
  is_target_brand: boolean;
}

export interface EngineEvaluationResult {
  sentiment: SentimentType;
  visibility_score: number;
  citations: EvaluatedCitation[];
  competitors_mentioned: string[];
  brand_mentioned?: boolean;
  ranking_position?: number | null;
  summary?: string;
}

export interface EngineDispatchResult {
  engine: AIEngine;
  model: string;
  rawText: string;
  evaluation: EngineEvaluationResult;
  durationMs: number;
  error?: string;
}

export interface PromptAuditResult {
  promptId: string;
  query: string;
  brandName: string;
  engineResults: EngineDispatchResult[];
  status: 'completed' | 'partial' | 'failed';
  error?: string;
}

export interface PromptWithBrand {
  id: string;
  brand_id: string;
  query: string;
  category?: string;
  priority?: string;
  engines_tracked?: AIEngine[];
  is_active: boolean;
  subscription_tier?: string;
  brands?: {
    id: string;
    name: string;
    domain: string;
    industry?: string;
    description?: string;
    subscription_tier?: string;
    user_id?: string;
    profiles?: {
      subscription_tier: string;
    } | null;
    competitors?: {
      id: string;
      name: string;
      domain: string;
    }[];
  } | null;
}

export type ActionRecommendationIssueType = 'Content Gap' | 'Competitor Edge' | 'Sentiment';
export type ActionRecommendationStatus = 'pending' | 'approved' | 'dismissed';

export interface ActionRecommendation {
  id: string;
  brand_id: string;
  prompt_id?: string | null;
  engine_name: string;
  issue_type: ActionRecommendationIssueType;
  title: string;
  explanation: string;
  drafted_content: string;
  status: ActionRecommendationStatus;
  created_at: string;
  // Joined fields for UI convenience
  prompts?: {
    id: string;
    query: string;
    category?: string;
  } | null;
  brands?: {
    id: string;
    name?: string;
    brand_name?: string;
    domain?: string;
  } | null;
}

export interface PromptAuditResult {
  promptId: string;
  query: string;
  brandName: string;
  engineResults: EngineDispatchResult[];
  status: 'completed' | 'partial' | 'failed';
  error?: string;
}



