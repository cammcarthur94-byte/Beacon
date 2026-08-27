import { AIEngine, EngineMeta } from '@/types/geo';

export const AI_ENGINES: Record<AIEngine, EngineMeta> = {
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    model: 'GPT-4o',
    color: '#10a37f',
    iconName: 'Bot',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity Pro',
    model: 'Sonar Large',
    color: '#22b3a8',
    iconName: 'Search',
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
    model: 'Gemini 1.5 Flash',
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
