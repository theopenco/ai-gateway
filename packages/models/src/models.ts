import type { providers } from "./providers";

export type Provider = (typeof providers)[number]["id"];

export type Model = (typeof models)[number]["providers"][number]["modelName"];

export interface ProviderModelMapping {
	providerId: (typeof providers)[number]["id"];
	modelName: string;
	/**
	 * Price per input token in USD
	 */
	inputPrice?: number;
	/**
	 * Price per output token in USD
	 */
	outputPrice?: number;
	/**
	 * Price per image input in USD
	 */
	imageInputPrice?: number;
	/**
	 * Maximum context window size in tokens
	 */
	contextSize?: number;
	/**
	 * Whether this specific model supports streaming for this provider
	 */
	streaming: boolean;
}

export interface ModelDefinition {
	model: string;
	providers: ProviderModelMapping[];
	/**
	 * Whether the model supports JSON output mode
	 */
	jsonOutput?: boolean;
	/**
	 * Date when the model will be deprecated (still usable but filtered from selection algorithms)
	 */
	deprecatedAt?: Date;
	/**
	 * Date when the model will be deactivated (returns error when requested)
	 */
	deactivatedAt?: Date;
}

export let models = [
	{
		model: "custom", // custom provider which expects base URL to be set
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "llmgateway",
				modelName: "custom",
				inputPrice: undefined,
				outputPrice: undefined,
				contextSize: undefined,
				streaming: true,
			},
		],
	},
	{
		model: "auto", // native automatic routing
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "llmgateway",
				modelName: "auto",
				inputPrice: undefined,
				outputPrice: undefined,
				contextSize: undefined,
				streaming: true,
			},
		],
	},
	{
		model: "gpt-4o-mini",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4o-mini",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.6 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gpt-4",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4",
				inputPrice: 30.0 / 1e6,
				outputPrice: 60.0 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
		],
		jsonOutput: false,
	},
	{
		model: "gpt-4o",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4o",
				inputPrice: 2.5 / 1e6,
				outputPrice: 10.0 / 1e6,
				imageInputPrice: 0.00553,
				contextSize: 128000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gpt-3.5-turbo",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-3.5-turbo",
				inputPrice: 0.5 / 1e6,
				outputPrice: 1.5 / 1e6,
				contextSize: 16385,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gpt-4.1",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4.1",
				inputPrice: 2.0 / 1e6,
				outputPrice: 8.0 / 1e6,
				contextSize: 1000000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "o1",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "o1",
				inputPrice: 15.0 / 1e6,
				outputPrice: 60.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gpt-4.1-mini",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4.1-mini",
				inputPrice: 0.4 / 1e6,
				outputPrice: 1.6 / 1e6,
				contextSize: 1000000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gpt-4.1-nano",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4.1-nano",
				inputPrice: 0.1 / 1e6,
				outputPrice: 0.4 / 1e6,
				contextSize: 1000000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "o3",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "o3",
				inputPrice: 2 / 1e6,
				outputPrice: 8 / 1e6,
				contextSize: 200000,
				streaming: false,
			},
		],
		jsonOutput: true,
	},
	{
		model: "o3-mini",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "o3-mini",
				inputPrice: 1.1 / 1e6,
				outputPrice: 4.4 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "claude-3-7-sonnet-20250219",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-3-7-sonnet-20250219",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "claude-3-5-sonnet-20241022",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-3-5-sonnet-20241022",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "gemini-2.0-flash",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.0-flash",
				inputPrice: 0.1 / 1e6,
				outputPrice: 0.4 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gpt-4-turbo",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "openai",
				modelName: "gpt-4-turbo",
				inputPrice: 10.0 / 1e6,
				outputPrice: 30.0 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "claude-2.1",
		deprecatedAt: new Date("2025-06-15T00:00:00Z"),
		deactivatedAt: new Date("2025-07-21T16:00:00Z"),
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-2.1",
				inputPrice: 8.0 / 1e6,
				outputPrice: 24.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "llama-3.1-8b-instruct",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "inference.net",
				modelName: "meta-llama/llama-3.1-8b-instruct/fp-8",
				inputPrice: 0.07 / 1e6,
				outputPrice: 0.33 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
			{
				providerId: "kluster.ai",
				modelName: "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
				inputPrice: 0.07 / 1e6,
				outputPrice: 0.33 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
			{
				providerId: "together.ai",
				modelName: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
				inputPrice: 0.88 / 1e6,
				outputPrice: 0.88 / 1e6,
				contextSize: 128000,
				streaming: false,
			},
		],
	},
	{
		model: "llama-3.1-70b-instruct",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "inference.net",
				modelName: "meta-llama/llama-3.1-70b-instruct/fp-16",
				inputPrice: 0.07 / 1e6,
				outputPrice: 0.33 / 1e6,
				contextSize: 128000,
				streaming: true,
			},
		],
	},
	{
		model: "claude-3-7-sonnet",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-3-7-sonnet-latest",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "claude-sonnet-4-20250514",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-sonnet-4-20250514",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "claude-opus-4-20250514",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-opus-4-20250514",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "claude-3-5-sonnet",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "anthropic",
				modelName: "claude-3-5-sonnet-latest",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 200000,
				streaming: true,
			},
		],
	},
	{
		model: "gemini-2.5-pro",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-pro",
				inputPrice: 1.25 / 1e6,
				outputPrice: 10.0 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-pro-preview-05-06",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-pro-preview-05-06",
				inputPrice: 1.25 / 1e6,
				outputPrice: 10.0 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-pro-preview-06-05",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-pro-preview-06-05",
				inputPrice: 1.25 / 1e6,
				outputPrice: 10.0 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-flash-preview-04-17",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-flash-preview-04-17",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.6 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-flash-preview-05-20",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-flash-preview-05-20",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.6 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-flash",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-flash",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.6 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.5-flash-preview-04-17-thinking",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.5-flash-preview-04-17-thinking",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.6 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-1.5-pro",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-1.5-pro",
				inputPrice: 0.0375 / 1e6,
				outputPrice: 0.15 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-1.5-flash",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-1.5-flash",
				inputPrice: 0.0375 / 1e6,
				outputPrice: 0.15 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-1.5-flash-8b",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-1.5-flash-8b",
				inputPrice: 0.0375 / 1e6,
				outputPrice: 0.15 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemini-2.0-flash-lite",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemini-2.0-flash-lite",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemma-3n-e2b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemma-3n-e2b-it",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemma-3n-e4b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemma-3n-e4b-it",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	{
		model: "gemma-3-1b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemma-3-1b-it",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				contextSize: 1000000,
				streaming: false,
			},
		],
	},
	// {
	// 	model: "gemma-3-4b-it",
	// 	deprecatedAt: undefined,
	// 	deactivatedAt: undefined,
	// 	providers: [
	// 		{
	// 			providerId: "google-ai-studio",
	// 			modelName: "gemma-3-4b-it",
	// 			inputPrice: 0.075 / 1e6,
	// 			outputPrice: 0.3 / 1e6,
	// 			contextSize: 1000000,
	// 			streaming: false,
	// 			thinking: true,
	// 		},
	// 	],
	// },
	// {
	// 	model: "gemma-3-12b-it",
	// 	deprecatedAt: undefined,
	// 	deactivatedAt: undefined,
	// 	providers: [
	// 		{
	// 			providerId: "google-ai-studio",
	// 			modelName: "gemma-3-12b-it",
	// 			inputPrice: 0.075 / 1e6,
	// 			outputPrice: 0.3 / 1e6,
	// 			contextSize: 1000000,
	// 			streaming: false,
	// 			thinking: true,
	// 		},
	// 	],
	// },
	{
		model: "deepseek-v3",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "cloudrift",
				modelName: "deepseek-ai/DeepSeek-V3",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.4 / 1e6,
				contextSize: 163840,
				streaming: true,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-chat",
				inputPrice: 0.27 / 1e6,
				outputPrice: 1.1 / 1e6,
				contextSize: 64000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "deepseek-r1",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "cloudrift",
				modelName: "deepseek-ai/DeepSeek-R1",
				inputPrice: 0.15 / 1e6,
				outputPrice: 0.4 / 1e6,
				contextSize: 163840,
				streaming: true,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-reasoner",
				inputPrice: 0.55 / 1e6,
				outputPrice: 2.19 / 1e6,
				contextSize: 64000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "deepseek-r1-0528",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "cloudrift",
				modelName: "deepseek-ai/DeepSeek-R1-0528",
				inputPrice: 0.25 / 1e6,
				outputPrice: 1 / 1e6,
				contextSize: 32770,
				streaming: true,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-reasoner",
				inputPrice: 0.55 / 1e6,
				outputPrice: 2.19 / 1e6,
				contextSize: 64000,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "llama-4-maverick-17b-128e-instruct",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "cloudrift",
				modelName: "meta-llama/Llama-4-Maverick-17B-128E-Instruct",
				inputPrice: 0.1 / 1e6,
				outputPrice: 0.35 / 1e6,
				contextSize: 1_050_000,
				streaming: true,
			},
		],
	},
	{
		model: "mistral-large-latest",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "mistral",
				modelName: "mistral-large-latest",
				inputPrice: 0.000004,
				outputPrice: 0.000012,
				contextSize: 128000,
				streaming: true,
			},
		],
		jsonOutput: false,
	},
	{
		model: "grok-3",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-3",
				inputPrice: 3.0 / 1e6,
				outputPrice: 15.0 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "grok-3-mini",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-3-mini",
				inputPrice: 0.3 / 1e6,
				outputPrice: 0.5 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "grok-3-fast",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-3-fast",
				inputPrice: 5.0 / 1e6,
				outputPrice: 25.0 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "grok-3-mini-fast",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-3-mini-fast",
				inputPrice: 0.6 / 1e6,
				outputPrice: 4.0 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "grok-2-1212",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-2-1212",
				inputPrice: 2.0 / 1e6,
				outputPrice: 10.0 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "grok-2-vision-1212",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "xai",
				modelName: "grok-2-vision-1212",
				inputPrice: 2.0 / 1e6,
				outputPrice: 10.0 / 1e6,
				imageInputPrice: 2.0 / 1e6,
				contextSize: 32768,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "deepseek-r1-distill-llama-70b",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "groq",
				modelName: "deepseek-r1-distill-llama-70b",
				inputPrice: 0.75 / 1e6,
				outputPrice: 0.99 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "gemma2-9b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "groq",
				modelName: "gemma2-9b-it",
				inputPrice: 0.2 / 1e6,
				outputPrice: 0.2 / 1e6,
				contextSize: 8129,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
	{
		model: "meta-llama/llama-guard-4-12b",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "groq",
				modelName: "meta-llama/llama-guard-4-12b",
				inputPrice: 0.2 / 1e6,
				outputPrice: 0.2 / 1e6,
				contextSize: 131072,
				streaming: true,
			},
		],
		jsonOutput: true,
	},
] as const satisfies ModelDefinition[];
