export type EngineType = 'ChatGPT' | 'Perplexity' | 'Gemini' | 'Claude' | 'Copilot' | 'Google AIO';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'Omitted';

export interface CitationItem {
  id?: string;
  url: string;
  domain: string;
  title?: string;
  snippet?: string;
  position: number;
}

export interface CompetitorMention {
  name: string;
  rank: number;
  sentiment?: SentimentType;
}

export interface AuditRunItem {
  id: string;
  runId: string;
  promptId: string;
  prompt: string;
  pillar: 'GEO' | 'AEO' | 'AIO';
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  engine: EngineType;
  rawResponse: string;
  isBrandCited: boolean;
  mentionRank: number | null; // 1, 2, 3... or null if unranked
  visibilityScore: number; // 0 - 100
  sentiment: SentimentType;
  citations: CitationItem[];
  competitorsMentioned: CompetitorMention[];
  timestamp: string; // ISO 8601
  timeAgo: string;
  executionType: 'manual' | 'scheduled_cron' | 'api_eval';
  modelVersion?: string;
  durationMs?: number;
}

export interface TimelineDataPoint {
  date: string; // e.g. 'Aug 01'
  ChatGPT: number;
  Perplexity: number;
  Gemini: number;
  Claude: number;
  Copilot: number;
}

export interface EngineDistributionItem {
  name: EngineType;
  value: number;
  citationsCount: number;
  percentage: number;
  color: string;
}
