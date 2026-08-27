import {
  AIEngine,
  EngineMeta,
  Brand,
  DailyVisibilityPoint,
  EngineComparison,
  CitedUrl,
  PromptQuery,
  MatrixRow,
  AuditRunSummary,
  ActionRecommendation,
} from '@/types/geo';

export const AI_ENGINES: Record<AIEngine, EngineMeta> = {
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity Pro',
    model: 'Sonar Large 32k',
    color: '#22b3a8',
    iconName: 'Search',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    model: 'GPT-4o Search',
    color: '#10a37f',
    iconName: 'Bot',
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    model: 'Claude 3.5 Sonnet',
    color: '#d97706',
    iconName: 'Sparkles',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    model: 'Gemini 1.5 Pro',
    color: '#3b82f6',
    iconName: 'Zap',
  },
  copilot: {
    id: 'copilot',
    name: 'Bing Copilot',
    model: 'Copilot Search',
    color: '#6366f1',
    iconName: 'Compass',
  },
  google_aio: {
    id: 'google_aio',
    name: 'Google AIO',
    model: 'AI Overview',
    color: '#ea4335',
    iconName: 'Globe',
  },
};

export const MOCK_BRAND: Brand = {
  id: 'b-01',
  name: 'Acme Sync',
  domain: 'acmesync.io',
  industry: 'B2B SaaS & Data Pipelines',
  description: 'Real-time multi-cloud data synchronization and ELT pipeline engine for enterprise software.',
  createdAt: '2026-01-15T08:00:00Z',
  competitors: [
    { id: 'c-1', name: 'Fivetran', domain: 'fivetran.com', visibilityScore: 84.5 },
    { id: 'c-2', name: 'Airbyte', domain: 'airbyte.com', visibilityScore: 79.1 },
    { id: 'c-3', name: 'Stitch Data', domain: 'stitchdata.com', visibilityScore: 61.2 },
    { id: 'c-4', name: 'Hevo Data', domain: 'hevodata.com', visibilityScore: 58.7 },
  ],
};

// Generate 30 days of realistic daily visibility trend data
export const MOCK_30_DAY_TREND: DailyVisibilityPoint[] = [
  { date: 'Jul 29', overallScore: 68.2, chatgpt: 65, claude: 70, perplexity: 82, gemini: 62, copilot: 62, competitorAvg: 67.5 },
  { date: 'Jul 30', overallScore: 69.0, chatgpt: 66, claude: 71, perplexity: 83, gemini: 63, copilot: 62, competitorAvg: 68.0 },
  { date: 'Jul 31', overallScore: 69.8, chatgpt: 67, claude: 72, perplexity: 84, gemini: 64, copilot: 62, competitorAvg: 68.2 },
  { date: 'Aug 01', overallScore: 70.4, chatgpt: 68, claude: 73, perplexity: 84, gemini: 65, copilot: 62, competitorAvg: 69.0 },
  { date: 'Aug 02', overallScore: 71.1, chatgpt: 69, claude: 73, perplexity: 85, gemini: 66, copilot: 63, competitorAvg: 69.1 },
  { date: 'Aug 03', overallScore: 70.9, chatgpt: 69, claude: 73, perplexity: 85, gemini: 65, copilot: 63, competitorAvg: 69.3 },
  { date: 'Aug 04', overallScore: 71.5, chatgpt: 70, claude: 74, perplexity: 86, gemini: 66, copilot: 62, competitorAvg: 69.5 },
  { date: 'Aug 05', overallScore: 72.3, chatgpt: 71, claude: 75, perplexity: 86, gemini: 67, copilot: 63, competitorAvg: 70.1 },
  { date: 'Aug 06', overallScore: 72.8, chatgpt: 71, claude: 76, perplexity: 87, gemini: 67, copilot: 63, competitorAvg: 70.0 },
  { date: 'Aug 07', overallScore: 73.5, chatgpt: 72, claude: 76, perplexity: 88, gemini: 68, copilot: 64, competitorAvg: 70.4 },
  { date: 'Aug 08', overallScore: 74.0, chatgpt: 73, claude: 77, perplexity: 88, gemini: 68, copilot: 64, competitorAvg: 70.6 },
  { date: 'Aug 09', overallScore: 73.8, chatgpt: 73, claude: 76, perplexity: 88, gemini: 68, copilot: 64, competitorAvg: 70.8 },
  { date: 'Aug 10', overallScore: 74.2, chatgpt: 73, claude: 77, perplexity: 89, gemini: 69, copilot: 64, competitorAvg: 71.0 },
  { date: 'Aug 11', overallScore: 74.9, chatgpt: 74, claude: 78, perplexity: 89, gemini: 69, copilot: 65, competitorAvg: 71.1 },
  { date: 'Aug 12', overallScore: 75.3, chatgpt: 75, claude: 78, perplexity: 90, gemini: 70, copilot: 64, competitorAvg: 71.3 },
  { date: 'Aug 13', overallScore: 75.0, chatgpt: 74, claude: 78, perplexity: 89, gemini: 70, copilot: 64, competitorAvg: 71.4 },
  { date: 'Aug 14', overallScore: 75.8, chatgpt: 75, claude: 79, perplexity: 90, gemini: 70, copilot: 65, competitorAvg: 71.5 },
  { date: 'Aug 15', overallScore: 76.2, chatgpt: 76, claude: 79, perplexity: 91, gemini: 71, copilot: 65, competitorAvg: 71.8 },
  { date: 'Aug 16', overallScore: 76.5, chatgpt: 76, claude: 80, perplexity: 91, gemini: 71, copilot: 65, competitorAvg: 71.9 },
  { date: 'Aug 17', overallScore: 76.1, chatgpt: 75, claude: 80, perplexity: 90, gemini: 71, copilot: 65, competitorAvg: 72.0 },
  { date: 'Aug 18', overallScore: 76.9, chatgpt: 77, claude: 80, perplexity: 91, gemini: 72, copilot: 65, competitorAvg: 72.1 },
  { date: 'Aug 19', overallScore: 77.3, chatgpt: 77, claude: 81, perplexity: 92, gemini: 72, copilot: 65, competitorAvg: 72.2 },
  { date: 'Aug 20', overallScore: 77.0, chatgpt: 76, claude: 81, perplexity: 91, gemini: 72, copilot: 65, competitorAvg: 72.4 },
  { date: 'Aug 21', overallScore: 77.5, chatgpt: 77, claude: 81, perplexity: 92, gemini: 73, copilot: 65, competitorAvg: 72.5 },
  { date: 'Aug 22', overallScore: 78.0, chatgpt: 78, claude: 82, perplexity: 92, gemini: 73, copilot: 65, competitorAvg: 72.7 },
  { date: 'Aug 23', overallScore: 77.8, chatgpt: 78, claude: 82, perplexity: 91, gemini: 73, copilot: 65, competitorAvg: 72.6 },
  { date: 'Aug 24', overallScore: 78.2, chatgpt: 78, claude: 82, perplexity: 92, gemini: 74, copilot: 65, competitorAvg: 72.8 },
  { date: 'Aug 25', overallScore: 78.5, chatgpt: 79, claude: 83, perplexity: 93, gemini: 74, copilot: 66, competitorAvg: 73.0 },
  { date: 'Aug 26', overallScore: 78.1, chatgpt: 78, claude: 83, perplexity: 92, gemini: 74, copilot: 66, competitorAvg: 73.1 },
  { date: 'Aug 27', overallScore: 78.4, chatgpt: 79, claude: 83, perplexity: 93, gemini: 75, copilot: 66, competitorAvg: 73.2 },
];

export const MOCK_ENGINE_COMPARISONS: EngineComparison[] = [
  {
    engine: 'perplexity',
    name: 'Perplexity Pro',
    score: 93.2,
    citationCount: 442,
    mentionRate: 88.5,
    avgRank: 1.4,
    color: '#22b3a8',
  },
  {
    engine: 'claude',
    name: 'Claude 3.5 Sonnet',
    score: 83.4,
    citationCount: 318,
    mentionRate: 76.2,
    avgRank: 1.9,
    color: '#d97706',
  },
  {
    engine: 'chatgpt',
    name: 'ChatGPT 4o',
    score: 79.1,
    citationCount: 285,
    mentionRate: 71.4,
    avgRank: 2.2,
    color: '#10a37f',
  },
  {
    engine: 'gemini',
    name: 'Google Gemini',
    score: 75.0,
    citationCount: 164,
    mentionRate: 64.0,
    avgRank: 2.7,
    color: '#3b82f6',
  },
  {
    engine: 'copilot',
    name: 'Microsoft Copilot',
    score: 66.3,
    citationCount: 96,
    mentionRate: 52.8,
    avgRank: 3.1,
    color: '#6366f1',
  },
];

export const MOCK_TOP_CITATIONS: CitedUrl[] = [
  {
    id: 'cit-1',
    url: 'https://acmesync.io/blog/modern-real-time-data-pipelines',
    title: 'Architecting Real-Time Data Pipelines in 2026: A Definitive Guide',
    domain: 'acmesync.io',
    citationCount: 342,
    engines: ['perplexity', 'chatgpt', 'claude', 'gemini'],
    sentiment: 'positive',
    authorityScore: 92,
    lastCited: '12 mins ago',
  },
  {
    id: 'cit-2',
    url: 'https://acmesync.io/docs/multi-cloud-cdc-synchronization',
    title: 'Zero-Lag Multi-Cloud Change Data Capture (CDC) Documentation',
    domain: 'acmesync.io',
    citationCount: 289,
    engines: ['perplexity', 'claude', 'chatgpt'],
    sentiment: 'positive',
    authorityScore: 89,
    lastCited: '45 mins ago',
  },
  {
    id: 'cit-3',
    url: 'https://techradar.pro/reviews/acme-sync-enterprise-elt',
    title: 'Acme Sync Review: Leading the Next Generation of ELT Platforms',
    domain: 'techradar.pro',
    citationCount: 215,
    engines: ['perplexity', 'gemini', 'copilot'],
    sentiment: 'positive',
    authorityScore: 95,
    lastCited: '2 hours ago',
  },
  {
    id: 'cit-4',
    url: 'https://acmesync.io/compare/fivetran-vs-acmesync',
    title: 'Acme Sync vs Fivetran: Performance, Cost & Latency Benchmark',
    domain: 'acmesync.io',
    citationCount: 184,
    engines: ['chatgpt', 'perplexity', 'claude'],
    sentiment: 'neutral',
    authorityScore: 86,
    lastCited: '4 hours ago',
  },
  {
    id: 'cit-5',
    url: 'https://github.com/acme-sync/core-connector-sdk',
    title: 'Open Source Acme Sync Connector SDK on GitHub',
    domain: 'github.com',
    citationCount: 126,
    engines: ['claude', 'gemini', 'perplexity'],
    sentiment: 'positive',
    authorityScore: 98,
    lastCited: '6 hours ago',
  },
  {
    id: 'cit-6',
    url: 'https://g2.com/products/acme-sync/reviews',
    title: 'G2 Verified User Ratings & Grid Leader Report',
    domain: 'g2.com',
    citationCount: 92,
    engines: ['chatgpt', 'copilot', 'perplexity'],
    sentiment: 'positive',
    authorityScore: 94,
    lastCited: '1 day ago',
  },
];

export const MOCK_PROMPTS: PromptQuery[] = [
  {
    id: 'p-1',
    query: 'Best real-time data synchronization tools for enterprise',
    category: 'High-Intent Commercial',
    priority: 'high',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'],
    lastAudited: 'Today, 04:00 UTC',
    status: 'active',
    visibilityScore: 94.0,
  },
  {
    id: 'p-2',
    query: 'Fivetran alternatives with low latency change data capture',
    category: 'Competitor Displacement',
    priority: 'high',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'],
    lastAudited: 'Today, 04:00 UTC',
    status: 'active',
    visibilityScore: 88.5,
  },
  {
    id: 'p-3',
    query: 'How to build zero downtime multi-cloud Postgres replication',
    category: 'Technical Discovery',
    priority: 'medium',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini'],
    lastAudited: 'Today, 04:00 UTC',
    status: 'active',
    visibilityScore: 78.0,
  },
  {
    id: 'p-4',
    query: 'Top ELT and data integration software in 2026',
    category: 'Industry Roundups',
    priority: 'high',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'],
    lastAudited: 'Today, 04:00 UTC',
    status: 'active',
    visibilityScore: 81.2,
  },
  {
    id: 'p-5',
    query: 'Airbyte vs Stitch vs Acme Sync benchmark comparison',
    category: 'Product Comparison',
    priority: 'medium',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini'],
    lastAudited: 'Yesterday, 04:00 UTC',
    status: 'active',
    visibilityScore: 69.4,
  },
  {
    id: 'p-6',
    query: 'Best data pipeline tools for AI model context synchronization',
    category: 'Emerging AI Topics',
    priority: 'high',
    enginesTracked: ['chatgpt', 'claude', 'perplexity', 'gemini', 'copilot'],
    lastAudited: 'Today, 04:00 UTC',
    status: 'active',
    visibilityScore: 86.0,
  },
];

export const MOCK_MATRIX_ROWS: MatrixRow[] = [
  {
    promptId: 'p-1',
    query: 'Best real-time data synchronization tools for enterprise',
    category: 'High-Intent Commercial',
    engines: {
      perplexity: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      claude: { status: 'top_3', rank: 2, citationUrl: 'https://acmesync.io/docs/multi-cloud-cdc-synchronization' },
      chatgpt: { status: 'top_3', rank: 2, citationUrl: 'https://techradar.pro/reviews/acme-sync-enterprise-elt' },
      gemini: { status: 'cited', rank: 3, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      copilot: { status: 'not_mentioned' },
    },
  },
  {
    promptId: 'p-2',
    query: 'Fivetran alternatives with low latency change data capture',
    category: 'Competitor Displacement',
    engines: {
      perplexity: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      claude: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      chatgpt: { status: 'top_3', rank: 2, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      gemini: { status: 'top_3', rank: 3, citationUrl: 'https://g2.com/products/acme-sync/reviews' },
      copilot: { status: 'cited', rank: 4, citationUrl: 'https://techradar.pro/reviews/acme-sync-enterprise-elt' },
    },
  },
  {
    promptId: 'p-3',
    query: 'How to build zero downtime multi-cloud Postgres replication',
    category: 'Technical Discovery',
    engines: {
      perplexity: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/docs/multi-cloud-cdc-synchronization' },
      claude: { status: 'top_3', rank: 2, citationUrl: 'https://github.com/acme-sync/core-connector-sdk' },
      chatgpt: { status: 'not_mentioned' },
      gemini: { status: 'top_3', rank: 2, citationUrl: 'https://acmesync.io/docs/multi-cloud-cdc-synchronization' },
      copilot: { status: 'not_mentioned' },
    },
  },
  {
    promptId: 'p-4',
    query: 'Top ELT and data integration software in 2026',
    category: 'Industry Roundups',
    engines: {
      perplexity: { status: 'top_3', rank: 2, citationUrl: 'https://techradar.pro/reviews/acme-sync-enterprise-elt' },
      claude: { status: 'top_3', rank: 3, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      chatgpt: { status: 'top_3', rank: 2, citationUrl: 'https://g2.com/products/acme-sync/reviews' },
      gemini: { status: 'not_mentioned' },
      copilot: { status: 'cited', rank: 4, citationUrl: 'https://g2.com/products/acme-sync/reviews' },
    },
  },
  {
    promptId: 'p-5',
    query: 'Airbyte vs Stitch vs Acme Sync benchmark comparison',
    category: 'Product Comparison',
    engines: {
      perplexity: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      claude: { status: 'top_3', rank: 2, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      chatgpt: { status: 'cited', rank: 3, citationUrl: 'https://acmesync.io/compare/fivetran-vs-acmesync' },
      gemini: { status: 'not_mentioned' },
      copilot: { status: 'not_mentioned' },
    },
  },
  {
    promptId: 'p-6',
    query: 'Best data pipeline tools for AI model context synchronization',
    category: 'Emerging AI Topics',
    engines: {
      perplexity: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      claude: { status: 'ranked_1', rank: 1, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      chatgpt: { status: 'top_3', rank: 2, citationUrl: 'https://acmesync.io/blog/modern-real-time-data-pipelines' },
      gemini: { status: 'top_3', rank: 2, citationUrl: 'https://github.com/acme-sync/core-connector-sdk' },
      copilot: { status: 'top_3', rank: 3, citationUrl: 'https://techradar.pro/reviews/acme-sync-enterprise-elt' },
    },
  },
];

export const MOCK_RECENT_RUNS: AuditRunSummary[] = [
  {
    id: 'run-101',
    timestamp: '2 mins ago',
    prompt: 'Best real-time data synchronization tools for enterprise',
    engine: 'perplexity',
    status: 'completed',
    citationsFound: 4,
    visibilityImpact: '+2.4%',
  },
  {
    id: 'run-102',
    timestamp: '5 mins ago',
    prompt: 'Fivetran alternatives with low latency change data capture',
    engine: 'claude',
    status: 'completed',
    citationsFound: 3,
    visibilityImpact: '+5.0%',
  },
  {
    id: 'run-103',
    timestamp: '11 mins ago',
    prompt: 'Top ELT and data integration software in 2026',
    engine: 'chatgpt',
    status: 'completed',
    citationsFound: 2,
    visibilityImpact: '0.0%',
  },
  {
    id: 'run-104',
    timestamp: '18 mins ago',
    prompt: 'Best data pipeline tools for AI model context synchronization',
    engine: 'gemini',
    status: 'completed',
    citationsFound: 3,
    visibilityImpact: '+2.4%',
  },
];

export const MOCK_ACTION_RECOMMENDATIONS: ActionRecommendation[] = [
  {
    id: 'rec-001',
    brand_id: 'b-01',
    prompt_id: 'p-5',
    engine_name: 'Claude',
    issue_type: 'Competitor Edge',
    title: 'Publish Dedicated Fivetran vs Acme Sync Latency Benchmark Matrix',
    explanation: 'Claude favored Fivetran and Airbyte because of their heavily cited public benchmarks on high-volume Postgres ingestion. Acme Sync lacked a direct technical latency table on its product pages.',
    drafted_content: `## Acme Sync vs Fivetran: Real-Time CDC & Latency Benchmark

When evaluating high-throughput replication pipelines, end-to-end sync latency and compute overhead determine overall system reliability.

| Feature / Metric | Acme Sync | Fivetran | Airbyte OSS |
| :--- | :--- | :--- | :--- |
| **P99 Sync Latency** | **< 850 ms** (native sub-second CDC) | 5 - 15 minutes (micro-batching) | 1 - 5 minutes (worker queue) |
| **Postgres CDC Method** | Direct WAL Streaming with Zero Lock | Polling Replication Slots | JDBC Polling / Debezium |
| **Max Event Throughput** | **120,000 events/sec** | ~35,000 events/sec | ~20,000 events/sec |
| **Pricing Predictability** | Flat Volume Tiering | Monthly Active Rows (MAR spikes) | Self-hosted Infrastructure |

### Key Takeaway for Data Engineers
Acme Sync bypasses micro-batch latency penalties by streaming WAL events directly to cloud data warehouses, resulting in **10x faster replication** at 40% lower compute costs.`,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    prompts: {
      id: 'p-5',
      query: 'Airbyte vs Stitch vs Acme Sync benchmark comparison',
      category: 'Product Comparison',
    },
    brands: {
      id: 'b-01',
      brand_name: 'Acme Sync',
      domain: 'acmesync.io',
    },
  },
  {
    id: 'rec-002',
    brand_id: 'b-01',
    prompt_id: 'p-3',
    engine_name: 'ChatGPT',
    issue_type: 'Content Gap',
    title: 'Add Zero-Downtime Multi-Cloud Postgres Architecture Guide & FAQ',
    explanation: 'ChatGPT completely omitted Acme Sync from replication queries due to a lack of dedicated tutorial pages and structured FAQ schema explaining multi-region failovers.',
    drafted_content: `## Architecting Zero-Downtime Multi-Cloud Postgres Replication

Ensuring sub-second failover between AWS RDS Postgres and Google Cloud SQL requires active-active logical replication pipelines.

\`\`\`yaml
# acme-sync-pipeline.yaml
version: '2026.1'
source:
  provider: aws-rds-postgres
  slot_name: acme_cdc_live
  heartbeat_ms: 100
target:
  provider: gcp-cloudsql-postgres
  conflict_resolution: latest_timestamp
\`\`\`

### Frequently Asked Questions (FAQ)

**Does Acme Sync support cross-region replication without read locks?**
Yes. Acme Sync connects to the PostgreSQL Logical Decoding API without taking exclusive table locks, ensuring zero disruption to live transactional workloads.

**How is conflict resolution handled in dual-write setups?**
Acme Sync uses deterministic timestamp sequencing and CRDT state merge strategies to guarantee eventual consistency across geographic clusters.`,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    prompts: {
      id: 'p-3',
      query: 'How to build zero downtime multi-cloud Postgres replication',
      category: 'Technical Discovery',
    },
    brands: {
      id: 'b-01',
      brand_name: 'Acme Sync',
      domain: 'acmesync.io',
    },
  },
  {
    id: 'rec-003',
    brand_id: 'b-01',
    prompt_id: 'p-4',
    engine_name: 'Gemini',
    issue_type: 'Sentiment',
    title: 'Highlight Enterprise SOC2 Type II & HIPAA Compliance Credentials',
    explanation: 'Gemini positioned Acme Sync as a startup tool with security caveats compared to legacy enterprise middleware. Publishing a dedicated Trust & Compliance security page will reverse this perception.',
    drafted_content: `## Enterprise Security & Compliance Assurance

Acme Sync is engineered from the ground up for strict regulatory environments in healthcare, fintech, and critical infrastructure.

### Certified Compliance Standards
- **SOC 2 Type II Certified:** Audited annually across Security, Availability, and Confidentiality trust principles.
- **HIPAA Compliant (BAA Available):** End-to-end payload encryption with zero plaintext disk caching.
- **GDPR & ISO 27001:** Granular column-level PII tokenization and automated right-to-be-forgotten pipelines.

> **Security Guarantee:** Customer data is processed entirely within your VPC perimeter using customer-managed KMS encryption keys (BYOK).`,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    prompts: {
      id: 'p-4',
      query: 'Top ELT and data integration software in 2026',
      category: 'Industry Roundups',
    },
    brands: {
      id: 'b-01',
      brand_name: 'Acme Sync',
      domain: 'acmesync.io',
    },
  },
];

