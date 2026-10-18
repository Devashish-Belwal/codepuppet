// model-catalog.ts

export type SeedProvider = {
    providerId: string;
    displayName: string;
    description: string;
    documentationUrl: string;
    isDefault: boolean;
    models: SeedModel[]
};

export type SeedModel = {
    providerId: string;
    modelId: string;
    displayName: string;
    description: string;
    supportsTools: boolean;
    contextWindow: number;
    maxOutputTokens: number;
    inputCostPer1M: number;
    outputCostPer1M: number;
    enabled: boolean;
    isDefault: boolean;
};

export const openaiModelCatalogSeed: SeedModel[] = [{
    providerId: "openai",
    modelId: "gpt-5.5-pro",
    displayName: "GPT-5.5 Pro",
    description: "OpenAI's highest-end reasoning model for complex coding and long-horizon engineering tasks.",
    supportsTools: true,
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputCostPer1M: 30,
    outputCostPer1M: 180,
    enabled: true,
    isDefault: true,
},

{
    providerId: "openai",
    modelId: "gpt-5.5",
    displayName: "GPT-5.5",
    description: "General-purpose OpenAI flagship model suitable for coding, reasoning, and agentic workloads.",
    supportsTools: true,
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputCostPer1M: 5,
    outputCostPer1M: 30,
    enabled: true,
    isDefault: false,
},

{
    providerId: "openai",
    modelId: "gpt-5.4",
    displayName: "GPT-5.4",
    description: "High-performance OpenAI reasoning model for software engineering and agent workflows.",
    supportsTools: true,
    contextWindow: 1_050_000,
    maxOutputTokens: 128_000,
    inputCostPer1M: 2.5,
    outputCostPer1M: 15,
    enabled: true,
    isDefault: false,
},

{
    providerId: "openai",
    modelId: "gpt-5.4-mini",
    displayName: "GPT-5.4 Mini",
    description: "Fast, low-cost OpenAI model for quick edits, simple tool use, and latency-sensitive agent turns.",
    supportsTools: true,
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
    inputCostPer1M: 0.25,
    outputCostPer1M: 2,
    enabled: true,
    isDefault: false,
},

{
    providerId: "openai",
    modelId: "gpt-5.3-codex",
    displayName: "GPT-5.3 Codex",
    description: "OpenAI coding-focused model optimized for software engineering and autonomous coding agents.",
    supportsTools: true,
    contextWindow: 400_000,
    maxOutputTokens: 128_000,
    inputCostPer1M: 1.75,
    outputCostPer1M: 14,
    enabled: true,
    isDefault: false,
},
] as const

export const googleModelCatalogSeed: SeedModel[] = [

    {
        providerId: "google",
        modelId: "gemini-3.1-pro-preview",
        displayName: "Gemini 3.1 Pro Preview",
        description: "Google's advanced reasoning model for complex coding, analysis, and long-context agent workflows.",
        supportsTools: true,
        contextWindow: 1_048_576,
        maxOutputTokens: 65_536,
        inputCostPer1M: 2,
        outputCostPer1M: 12,
        enabled: true,
        isDefault: true,
    },

    {
        providerId: "google",
        modelId: "gemini-3-pro-preview",
        displayName: "Gemini 3 Pro Preview",
        description: "Advanced Gemini model suitable for software development, reasoning, and multimodal coding workflows.",
        supportsTools: true,
        contextWindow: 1_048_576,
        maxOutputTokens: 65_536,
        inputCostPer1M: 2,
        outputCostPer1M: 12,
        enabled: true,
        isDefault: false,
    },

    {
        providerId: "google",
        modelId: "gemini-3.5-flash",
        displayName: "Gemini 3.5 Flash",
        description: "Fast Gemini model balancing coding capability, reasoning, tool use, and inference cost.",
        supportsTools: true,
        contextWindow: 1_048_576,
        maxOutputTokens: 65_536,
        inputCostPer1M: 1.5,
        outputCostPer1M: 9,
        enabled: true,
        isDefault: false,
    },

    {
        providerId: "google",
        modelId: "gemini-2.5-pro",
        displayName: "Gemini 2.5 Pro",
        description: "Strong long-context reasoning model suitable for repository analysis and complex coding tasks.",
        supportsTools: true,
        contextWindow: 1_048_576,
        maxOutputTokens: 65_536,
        inputCostPer1M: 1.25,
        outputCostPer1M: 10,
        enabled: true,
        isDefault: false,
    }

] as const

export const anthropicModelCatalogSeed: SeedModel[] = [

    {
        providerId: "anthropic",
        modelId: "claude-opus-4-7",
        displayName: "Claude Opus 4.7",
        description: "Anthropic's strongest model for advanced software engineering, complex reasoning, and long-running agents.",
        supportsTools: true,
        contextWindow: 1_000_000,
        maxOutputTokens: 128_000,
        inputCostPer1M: 5,
        outputCostPer1M: 25,
        enabled: true,
        isDefault: true,
    },

    {
        providerId: "anthropic",
        modelId: "claude-opus-4-6",
        displayName: "Claude Opus 4.6",
        description: "High-end Claude reasoning model suited for difficult coding and long-horizon engineering tasks.",
        supportsTools: true,
        contextWindow: 1_000_000,
        maxOutputTokens: 128_000,
        inputCostPer1M: 5,
        outputCostPer1M: 25,
        enabled: true,
        isDefault: false,
    },

    {
        providerId: "anthropic",
        modelId: "claude-sonnet-4-6",
        displayName: "Claude Sonnet 4.6",
        description: "Balanced Claude model offering strong coding, reasoning, and agentic performance with lower cost than Opus.",
        supportsTools: true,
        contextWindow: 1_000_000,
        maxOutputTokens: 64_000,
        inputCostPer1M: 3,
        outputCostPer1M: 15,
        enabled: true,
        isDefault: false,
    },

    {
        providerId: "anthropic",
        modelId: "claude-haiku-4-5",
        displayName: "Claude Haiku 4.5",
        description: "Fast and cost-efficient Claude model for coding assistance and high-throughput agent tasks.",
        supportsTools: true,
        contextWindow: 200_000,
        maxOutputTokens: 64_000,
        inputCostPer1M: 1,
        outputCostPer1M: 5,
        enabled: true,
        isDefault: false,
    },

] as const;

export const openrouterModelCatalogSeed: SeedModel[] = [
    {
        providerId: "openrouter",
        modelId: "openrouter/free",
        displayName: "OpenRouter Free Router",
        description: "Automatically routes requests to the best available free model on OpenRouter with tool support.",
        supportsTools: true,
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "openrouter/auto",
        displayName: "OpenRouter Auto Router",
        description: "Automatically selects the best model for your prompt across all available OpenRouter models.",
        supportsTools: true,
        contextWindow: 128_000,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "meta-llama/llama-3.3-70b-instruct:free",
        displayName: "Llama 3.3 70B Instruct (Free)",
        description: "Meta's flagship open-weights model served completely free on OpenRouter.",
        supportsTools: true,
        contextWindow: 131_072,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "deepseek/deepseek-r1:free",
        displayName: "DeepSeek R1 (Free)",
        description: "Open-weights reasoning model with chain-of-thought capabilities on OpenRouter Free tier.",
        supportsTools: true,
        contextWindow: 164_000,
        maxOutputTokens: 16_384,
        inputCostPer1M: 0,
        outputCostPer1M: 0,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "anthropic/claude-3.5-sonnet",
        displayName: "Claude 3.5 Sonnet (OpenRouter)",
        description: "Anthropic's premier intelligent model for coding and complex agent workflows via OpenRouter.",
        supportsTools: true,
        contextWindow: 200_000,
        maxOutputTokens: 8_192,
        inputCostPer1M: 3,
        outputCostPer1M: 15,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "deepseek/deepseek-r1",
        displayName: "DeepSeek R1 (OpenRouter)",
        description: "Open-weights reasoning flagship model with powerful chain-of-thought capabilities.",
        supportsTools: true,
        contextWindow: 164_000,
        maxOutputTokens: 16_384,
        inputCostPer1M: 0.55,
        outputCostPer1M: 2.19,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "deepseek/deepseek-chat",
        displayName: "DeepSeek V3 (OpenRouter)",
        description: "High performance, versatile open-weights model excellent for code generation and refactoring.",
        supportsTools: true,
        contextWindow: 164_000,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0.14,
        outputCostPer1M: 0.28,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "openai/gpt-4o",
        displayName: "GPT-4o (OpenRouter)",
        description: "OpenAI's flagship multimodal model via OpenRouter API.",
        supportsTools: true,
        contextWindow: 128_000,
        maxOutputTokens: 16_384,
        inputCostPer1M: 2.5,
        outputCostPer1M: 10,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "meta-llama/llama-3.3-70b-instruct",
        displayName: "Llama 3.3 70B Instruct (OpenRouter)",
        description: "State-of-the-art open source model from Meta, rivaling closed flagships.",
        supportsTools: true,
        contextWindow: 131_072,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0.12,
        outputCostPer1M: 0.3,
        enabled: true,
        isDefault: false,
    },
    {
        providerId: "openrouter",
        modelId: "google/gemini-2.0-flash-001",
        displayName: "Gemini 2.0 Flash (OpenRouter)",
        description: "Google's next-gen multimodal workhorse model with high speed and large context.",
        supportsTools: true,
        contextWindow: 1_048_576,
        maxOutputTokens: 8_192,
        inputCostPer1M: 0.1,
        outputCostPer1M: 0.4,
        enabled: true,
        isDefault: false,
    },
];

export const providers: SeedProvider[] = [
    {
        providerId: "openai",
        displayName: "OpenAI",
        description: "OpenAI API models",
        documentationUrl: "https://platform.openai.com/docs/models",
        isDefault: true,
        models: openaiModelCatalogSeed
    },
    {
        providerId: "anthropic",
        displayName: "Anthropic",
        description: "Anthropic API models",
        documentationUrl: "https://docs.anthropic.com/en/docs/about-claude/models",
        isDefault: false,
        models: anthropicModelCatalogSeed
    },
    {
        providerId: "google",
        displayName: "Google",
        description: "Google Gemini API models",
        documentationUrl: "https://ai.google.dev/gemini-api/docs/models",
        isDefault: false,
        models: googleModelCatalogSeed
    },
    {
        providerId: "openrouter",
        displayName: "OpenRouter",
        description: "Unified API for 300+ AI models including Claude, DeepSeek, Llama, and GPT",
        documentationUrl: "https://openrouter.ai/docs",
        isDefault: false,
        models: openrouterModelCatalogSeed
    },
] as const

