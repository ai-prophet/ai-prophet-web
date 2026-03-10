export interface ProviderConfig {
  name: string;
  logoPath: string;
  color: string;
  displayName: string;
}

export const PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  // OpenAI
  'openai': {
    name: 'openai',
    logoPath: '/assets/provider_logos/openai_small.svg',
    color: '#00A67E',
    displayName: 'OpenAI'
  },

  // Anthropic
  'anthropic': {
    name: 'anthropic',
    logoPath: '/assets/provider_logos/anthropic_small.svg',
    color: '#D4A574',
    displayName: 'Anthropic'
  },

  // Google
  'google': {
    name: 'google',
    logoPath: '/assets/provider_logos/google_small.svg',
    color: '#4285F4',
    displayName: 'Google'
  },

  // Meta
  'meta': {
    name: 'meta',
    logoPath: '/assets/provider_logos/meta_small.svg',
    color: '#0866FF',
    displayName: 'Meta'
  },

  // Mistral AI
  'mistralai': {
    name: 'mistralai',
    logoPath: '/assets/provider_logos/mistral_small.png',
    color: '#FF7000',
    displayName: 'Mistral AI'
  },

  // xAI
  'xai': {
    name: 'xai',
    logoPath: '/assets/provider_logos/xai.svg',
    color: '#000000',
    displayName: 'xAI'
  },

  // AWS/Amazon
  'aws': {
    name: 'aws',
    logoPath: '/assets/provider_logos/aws_small.svg',
    color: '#FF9900',
    displayName: 'AWS'
  },
  'amazon': {
    name: 'amazon',
    logoPath: '/assets/provider_logos/aws_small.svg',
    color: '#FF9900',
    displayName: 'Amazon'
  },

  // DeepSeek
  'deepseek': {
    name: 'deepseek',
    logoPath: '/assets/provider_logos/deepseek_small.svg',
    color: '#1E40AF',
    displayName: 'DeepSeek'
  },

  // Alibaba/Qwen
  'alibaba': {
    name: 'alibaba',
    logoPath: '/assets/provider_logos/alibaba_small.svg',
    color: '#FF6A00',
    displayName: 'Alibaba'
  },
  'qwen': {
    name: 'qwen',
    logoPath: '/assets/provider_logos/alibaba_small.svg',
    color: '#FF6A00',
    displayName: 'Qwen'
  },

  // Minimax
  'minimax': {
    name: 'minimax',
    logoPath: '/assets/provider_logos/minimax-color.svg',
    color: '#FE603C',
    displayName: 'Minimax'
  },

  // Upstage
  'upstage': {
    name: 'upstage',
    logoPath: '/assets/provider_logos/upstage_small.svg',
    color: '#6366F1',
    displayName: 'Upstage'
  },

  // Moonshot AI
  'moonshotai': {
    name: 'moonshotai',
    logoPath: '/assets/provider_logos/moonshotai_small.svg',
    color: '#8B5CF6',
    displayName: 'Moonshot AI'
  },

  // Lightning Rod Labs
  'lightningrodlabs': {
    name: 'lightningrodlabs',
    logoPath: '/assets/provider_logos/lightningrod.svg',
    color: '#EF4444',
    displayName: 'Lightning Rod Labs'
  },

  'ag2': {
    name: 'ag2',
    logoPath: '/assets/provider_logos/ag2ai_logo.svg',
    color: '#DC4405',
    displayName: 'AG2 AI'
  },

  // Market Baseline (Human Consensus)
  'llm-market-baseline': {
    name: 'llm-market-baseline',
    logoPath: '/assets/market_baseline.png',
    color: '#6B7280',
    displayName: 'Market Baseline'
  },
  'agent-market-baseline': {
    name: 'agent-market-baseline',
    logoPath: '/assets/market_baseline.png',
    color: '#6B7280',
    displayName: 'Market Baseline'
  },

  // Agent Models
  'agent': {
    name: 'agent',
    logoPath: '/assets/provider_logos/market_baseline.svg', // Using market baseline logo as placeholder
    color: '#8B5CF6',
    displayName: 'Agent'
  },

  // Zhipu AI (GLM)
  'zhipu': {
    name: 'zhipu',
    logoPath: '/assets/provider_logos/zhipu_small.png',
    color: '#343A40', // Dark gray/black from logo
    displayName: 'Zhipu AI'
  },
};

/**
 * Extract provider key from a full model name string.
 */
export const getProviderFromModelName = (modelName: string): string => {
  // Handle agent- prefixed models
  if (modelName.startsWith('agent-')) {
    const withoutAgentPrefix = modelName.substring(6); // Remove 'agent-' prefix
    if (withoutAgentPrefix.startsWith('google/')) return 'google';
    if (withoutAgentPrefix.startsWith('gemini')) return 'google';
    if (withoutAgentPrefix.startsWith('anthropic/')) return 'anthropic';
    if (withoutAgentPrefix.startsWith('x-ai/')) return 'xai';
    if (withoutAgentPrefix.startsWith('meta-llama/')) return 'meta';
    if (withoutAgentPrefix.startsWith('deepseek/')) return 'deepseek';
    if (withoutAgentPrefix.startsWith('qwen/')) return 'qwen';
    if (withoutAgentPrefix.startsWith('moonshotai/')) return 'moonshotai';
    if (withoutAgentPrefix.startsWith('glm')) return 'zhipu';
  }

  // Handle regular models
  if (modelName.startsWith('google/')) return 'google';
  if (modelName.startsWith('meta-llama/')) return 'meta';
  if (modelName.startsWith('deepseek/')) return 'deepseek';
  if (modelName.startsWith('qwen/')) return 'qwen';
  if (modelName.startsWith('x-ai/')) return 'xai';
  if (modelName.startsWith('moonshotai/')) return 'moonshotai';
  if (modelName.startsWith('anthropic/')) return 'anthropic';

  return '';
};

/**
 * Normalize provider name by stripping spaces and making lowercase
 */
const normalizeProviderName = (providerName: string): string => {
  return providerName.replace(/\s+/g, '').toLowerCase();
};

/**
 * Get provider configuration by name
 */
export const getProviderConfig = (providerName: string): ProviderConfig | null => {
  if (!providerName) return null;

  const normalizedName = normalizeProviderName(providerName);
  return PROVIDER_CONFIG[normalizedName] || null;
};

/**
 * Get all available providers
 */
export const getAllProviders = (): ProviderConfig[] => {
  return Object.values(PROVIDER_CONFIG);
};

/**
 * Default provider config for unknown providers
 */
export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  name: 'unknown',
  logoPath: '', // No logo for unknown providers
  color: '#6B7280', // Gray color
  displayName: 'Unknown'
}; 
