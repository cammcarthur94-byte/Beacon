import { EngineType } from '@/types/responses';

export type ActionSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type ActionStatus = 'pending' | 'approved' | 'dismissed';

export type ActionFixType = 'Comparison Table' | 'AEO FAQ' | 'Entity Paragraph' | 'Schema Markup';

export interface CompetitorInsight {
  competitorName: string;
  competitorUrl: string;
  semanticGap: string;
}

export interface OptimizationAction {
  id: string;
  promptId: string;
  promptQuery: string;
  engine: EngineType;
  severity: ActionSeverity;
  status: ActionStatus;
  whyExplanation: string;
  competitorInsight: CompetitorInsight;
  targetSourceUrl: string;
  draftedContent: string;
  fixType: ActionFixType;
  createdAt: string;
  timeAgo: string;
}

export interface CmsDestination {
  id: 'webflow' | 'wordpress' | 'shopify' | 'nextjs_webhook';
  name: string;
  iconName: string;
  description: string;
}
