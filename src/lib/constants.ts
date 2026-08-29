import { AIEngine, EngineMeta } from '@/types/geo';
import { getEngineMetaMap, AI_ENGINE_CONFIGS, ENGINE_AUDITORS_LIST } from '@/config/ai-models';

export { AI_ENGINE_CONFIGS, ENGINE_AUDITORS_LIST };

export const AI_ENGINES: Record<AIEngine, EngineMeta> = getEngineMetaMap();

