export interface ModelConfig {
    name: string;
    displayName: string;
    suppress?: boolean;
}

// NOTE: We ONLY display models that are listed here. 
export const MODEL_CONFIG: Record<string, ModelConfig> = {
    'gpt-4o': {
        name: 'gpt-4o',
        displayName: 'GPT-4o',
        suppress: true
    },
    'gpt-4.1': {
        name: 'gpt-4.1',
        displayName: 'GPT-4.1',
        suppress: true
    },
    'o4-mini-high': {
        name: 'o4-mini-high',
        displayName: 'o4 Mini (high)',
        suppress: true
    },
    'o3-mini': {
        name: 'o3-mini',
        displayName: 'o3 Mini',
        suppress: true
    },
    'o3': {
        name: 'o3',
        displayName: 'o3',
        suppress: true
    },
    'gpt-5': {
        name: 'gpt-5-medium',
        displayName: 'GPT-5 (medium)',
        suppress: true
    },
    'gpt-5.1-high': {
        name: 'gpt-5.1-high',
        displayName: 'GPT-5.1 (high)'
    },
    'gpt-5.2-high': {
        name: 'gpt-5.2-high',
        displayName: 'GPT-5.2 (high)'
    },
    'gpt-5.2-none': {
        name: 'gpt-5.2-none',
        displayName: 'GPT-5.2 (none)'
    },
    'gpt-5-high': {
        name: 'gpt-5-high',
        displayName: 'GPT-5 (high)',
        suppress: true
    },
    'gpt-5-minimal': {
        name: 'gpt-5-minimal',
        displayName: 'GPT-5 (minimal)',
        suppress: true
    },
    'meta-llama/llama-4-maverick': {
        name: 'meta-llama/llama-4-maverick',
        displayName: 'Llama 4 Maverick'
    },
    'meta-llama/llama-4-scout': {
        name: 'meta-llama/llama-4-scout',
        displayName: 'Llama 4 Scout',
        suppress: true
    },
    'google/gemini-2.5-pro': {
        name: 'google/gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro'
    },
    'google/gemini-2.5-flash': {
        name: 'google/gemini-2.5-flash',
        displayName: 'Gemini 2.5 Flash',
        suppress: true
    },
    'google/gemini-2.5-flash-reasoning': {
        name: 'google/gemini-2.5-flash-reasoning',
        displayName: 'Gemini 2.5 Flash (Reasoning)',
    },
    'google/gemini-3-pro-preview': {
        name: 'google/gemini-3-pro-preview',
        displayName: 'Gemini 3 Pro (Preview)'
    },
    'gemini-2.0-flash-lite': {
        name: 'gemini-2.0-flash-lite',
        displayName: 'Gemini 2.0 Flash Lite',
        suppress: true
    },
    'gemini-2.0-flash': {
        name: 'gemini-2.0-flash',
        displayName: 'Gemini 2.0 Flash',
        suppress: true
    },
    'deepseek/deepseek-chat-v3-0324': {
        name: 'deepseek/deepseek-chat-v3-0324',
        displayName: 'DeepSeek Chat V3',
        suppress: true
    },
    'deepseek/deepseek-r1-0528': {
        name: 'deepseek/deepseek-r1-0528',
        displayName: 'DeepSeek R1'
    },
    'deepseek/deepseek-v3.2': {
        name: 'deepseek/deepseek-v3.2',
        displayName: 'DeepSeek V3.2'
    },
    'deepseek/deepseek-chat-v3.1': {
        name: 'deepseek/deepseek-chat-v3.1',
        displayName: 'DeepSeek Chat V3.1',
        suppress: true
    },
    'moonshotai/kimi-k2': {
        name: 'moonshotai/kimi-k2',
        displayName: 'Kimi K2',
        suppress: true
    },
    'moonshotai/kimi-k2-thinking': {
        name: 'moonshotai/kimi-k2-thinking',
        displayName: 'Kimi K2 (Thinking)'
    },
    'qwen/qwen3-235b-a22b-2507': {
        name: 'qwen/qwen3-235b-a22b-2507',
        displayName: 'Qwen 3 235B'
    },
    'x-ai/grok-4': {
        name: 'x-ai/grok-4',
        displayName: 'Grok 4'
    },
    'x-ai/grok-4.1-fast': {
        name: 'x-ai/grok-4.1-fast',
        displayName: 'Grok 4.1 Fast'
    },
    'x-ai/grok-3-mini': {
        name: 'x-ai/grok-3-mini',
        displayName: 'Grok 3 Mini',
        suppress: true
    },
    'anthropic/claude-sonnet-4-thinking': {
        name: 'anthropic/claude-sonnet-4-thinking',
        displayName: 'Claude Sonnet 4 (Thinking)',
        suppress: true
    },
    'anthropic/claude-sonnet-4.5': {
        name: 'anthropic/claude-sonnet-4.5',
        displayName: 'Claude Sonnet 4.5',
    },
    'anthropic/claude-opus-4.1': {
        name: 'anthropic/claude-opus-4.1',
        displayName: 'Claude Opus 4.1',
        suppress: true
    },
    'anthropic/claude-opus-4.5': {
        name: 'anthropic/claude-opus-4.5',
        displayName: 'Claude Opus 4.5',
    },
    'foresight-v1': {
        name: 'foresight-v1',
        displayName: 'Foresight V1 32B',
    },
    'minimax/minimax-m2': {
        name: 'minimax/minimax-m2',
        displayName: 'Minimax M2'
    },
    'llm-market-baseline': {
        name: 'llm-market-baseline',
        displayName: 'Market Baseline'
    },
    'agent-market-baseline': {
        name: 'agent-market-baseline',
        displayName: 'Market Baseline'
    },
    // Agent models
    'agent-gpt-5': {
        name: 'agent-gpt-5',
        displayName: 'Agent GPT-5'
    },
    'agent-o3': {
        name: 'agent-o3',
        displayName: 'Agent o3'
    },
    'agent-foresight-v2': {
        name: 'agent-foresight-v2',
        displayName: 'Agent Foresight V2'
    },
    'agent-ag2-gpt4.1': {
        name: 'agent-ag2-gpt4.1',
        displayName: 'Agent AG2 GPT-4.1'
    },
    'agent-ag2-gpt5': {
        name: 'agent-ag2-gpt5',
        displayName: 'Agent AG2 GPT-5'
    },
    'agent-ag2-gpt5.2': {
        name: 'agent-ag2-gpt5.2',
        displayName: 'Agent AG2 GPT-5.2'
    },
    'agent-gemini-3': {
        name: 'agent-gemini-3',
        displayName: 'Agent Gemini 3'
    },
    'agent-gpt-5.2': {
        name: 'agent-gpt-5.2',
        displayName: 'Agent GPT-5.2'
    },
    'agent-multi-agent-gpt5': {
        name: 'agent-multi-agent-gpt5',
        displayName: 'Agent Multi-Agent GPT-5',
        suppress: true
    },
    'agent-glm-4.6': {
        name: 'agent-glm-4.6',
        displayName: 'Agent GLM-4.6'
    },
    'agent-glm-4.7': {
        name: 'agent-glm-4.7',
        displayName: 'Agent GLM-4.7'
    },
}

export const niceName = (s: string) => {
    const modelConfig = MODEL_CONFIG[s];
    return (modelConfig && !modelConfig.suppress) ? modelConfig.displayName : null;
};

export const isModelConfigured = (s: string): boolean => {
    const modelConfig = MODEL_CONFIG[s];
    return modelConfig ? !modelConfig.suppress : false;
};
