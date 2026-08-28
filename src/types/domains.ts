export type DomainCategoryType =
  | 'Tech Media'
  | 'Review & Aggregator'
  | 'Community & Forum'
  | 'Analyst & Research'
  | 'Official Documentation';

export interface SourceDomain {
  id: string;
  domain: string;
  url: string;
  category: DomainCategoryType;
  domainAuthority: number; // 0 - 100
  totalCitations: number;
  momChange: number; // e.g. +18.4 or -4.2
  enginesFeeding: string[];
  firstSeen: string;
  lastCited: string;
  isBrandDomain?: boolean;
}

export interface CitationCategoryBreakdown {
  category: DomainCategoryType;
  citationsCount: number;
  percentage: number;
  domainsCount: number;
  color: string;
  barColor: string;
}

export interface DomainKpiMetrics {
  totalDomains: number;
  totalDomainsMom: number;
  totalCitations: number;
  totalCitationsMom: number;
  avgDomainAuthority: number;
  avgDomainAuthorityMom: number;
  newThisMonth: number;
  newThisMonthMom: number;
}
