import { AIEngine, EngineMeta } from '@/types/geo';

/**
 * AI Engine & Search Audit Model Configuration Matrix
 * Centralized Single Source of Truth (SSOT) for all search audit AI engines,
 * model identifiers, API provider routing, fallback cascades, and UI metadata.
 */

export interface EngineConfig {
  id: AIEngine;
  name: string;
  provider: string;
  displayModel: string;
  primaryModelId: string;
  candidateModels: string[];
  envModelKey?: string;
  color: string;
  iconName: string;
  description: string;
  badgeStyle: {
    bg: string;
    text: string;
    dot: string;
  };
}

export const AI_ENGINE_CONFIGS: Record<AIEngine, EngineConfig> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    displayModel: 'Claude Haiku 4.5',
    primaryModelId: 'claude-3-5-haiku-20241022',
    candidateModels: [
      'claude-haiku-4-5-20250929',
      'claude-3-5-haiku-latest',
      'claude-3-5-haiku-20241022',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
    ],
    envModelKey: 'ANTHROPIC_MODEL',
    color: '#d97706',
    iconName: 'Sparkles',
    description: 'Anthropic Claude reasoning engine with high-precision citation grounding.',
    badgeStyle: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    displayModel: 'GPT-5.4 nano',
    primaryModelId: 'gpt-5.4-nano',
    candidateModels: [
      'gpt-5.4-nano',
      'gpt-5-mini',
      'gpt-4o-mini',
      'gpt-4o',
    ],
    envModelKey: 'OPENAI_MODEL',
    color: '#10a37f',
    iconName: 'Bot',
    description: 'OpenAI conversational search and recommendation engine.',
    badgeStyle: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
  },
  copilot: {
    id: 'copilot',
    name: 'Copilot',
    provider: 'Microsoft / Azure',
    displayModel: 'GPT-5',
    primaryModelId: 'gpt-5',
    candidateModels: [
      'gpt-5',
      'gpt-5-turbo',
      'gpt-4o',
    ],
    envModelKey: 'AZURE_OPENAI_DEPLOYMENT',
    color: '#6366f1',
    iconName: 'Compass',
    description: 'Microsoft Copilot & Bing Search grounding engine.',
    badgeStyle: {
      bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800/60',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity AI',
    displayModel: 'sonar-pro',
    primaryModelId: 'sonar-pro',
    candidateModels: [
      'sonar-pro',
      'sonar',
      'sonar-reasoning',
    ],
    envModelKey: 'PERPLEXITY_MODEL',
    color: '#22b3a8',
    iconName: 'Search',
    description: 'Perplexity real-time grounded search engine with direct citation references.',
    badgeStyle: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800/60',
      text: 'text-cyan-700 dark:text-cyan-300',
      dot: 'bg-cyan-500',
    },
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    provider: 'Google AI Studio',
    displayModel: 'Gemini 3.1 Flash Lite',
    primaryModelId: 'gemini-3.1-flash-lite',
    candidateModels: [
      'gemini-3.1-flash-lite',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
    envModelKey: 'GEMINI_MODEL',
    color: '#3b82f6',
    iconName: 'Zap',
    description: 'Google multimodal grounding and Gemini web search engine.',
    badgeStyle: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
  },
  google_aio: {
    id: 'google_aio',
    name: 'Google AIO',
    provider: 'Google Search',
    displayModel: 'Google AI Overview',
    primaryModelId: 'google-ai-overview',
    candidateModels: [
      'google-ai-overview',
    ],
    color: '#ea4335',
    iconName: 'Globe',
    description: 'Google AI Overview generative search snapshot.',
    badgeStyle: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
  },
};

/**
 * Returns the candidate model identifiers for an engine, prioritizing
 * environment variable overrides first, followed by the configured cascade.
 */
export function getEngineModelCandidates(engine: AIEngine): string[] {
  const config = AI_ENGINE_CONFIGS[engine];
  if (!config) return [];

  const envOverride = config.envModelKey ? process.env[config.envModelKey] : undefined;
  const list = [envOverride, ...config.candidateModels].filter(Boolean) as string[];
  return Array.from(new Set(list));
}

/**
 * Returns the primary display and configuration metadata for legacy UI components.
 */
export function getEngineMetaMap(): Record<AIEngine, EngineMeta> {
  const map = {} as Record<AIEngine, EngineMeta>;
  for (const [key, val] of Object.entries(AI_ENGINE_CONFIGS)) {
    const k = key as AIEngine;
    map[k] = {
      id: k,
      name: val.name,
      model: val.displayModel,
      color: val.color,
      iconName: val.iconName,
    };
  }
  return map;
}

/**
 * Type-safe array of engine configurations for settings, brand kits, and analytics.
 */
export const ENGINE_AUDITORS_LIST = [
  { key: 'claude', name: 'Claude', model: AI_ENGINE_CONFIGS.claude.displayModel, provider: AI_ENGINE_CONFIGS.claude.provider },
  { key: 'chatgpt', name: 'ChatGPT', model: AI_ENGINE_CONFIGS.chatgpt.displayModel, provider: AI_ENGINE_CONFIGS.chatgpt.provider },
  { key: 'perplexity', name: 'Perplexity', model: AI_ENGINE_CONFIGS.perplexity.displayModel, provider: AI_ENGINE_CONFIGS.perplexity.provider },
  { key: 'gemini', name: 'Gemini', model: AI_ENGINE_CONFIGS.gemini.displayModel, provider: AI_ENGINE_CONFIGS.gemini.provider },
  { key: 'copilot', name: 'Copilot', model: AI_ENGINE_CONFIGS.copilot.displayModel, provider: AI_ENGINE_CONFIGS.copilot.provider },
];
