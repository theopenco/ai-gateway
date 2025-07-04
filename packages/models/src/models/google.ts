import type { ModelDefinition } from "@llmgateway/models";

export const googleModels = [
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: true,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: false,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
		],
	},
	{
		model: "gemma-3-4b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemma-3-4b-it",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				reasoning: true,
				vision: false,
			},
		],
	},
	{
		model: "gemma-3-12b-it",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "google-ai-studio",
				modelName: "gemma-3-12b-it",
				inputPrice: 0.075 / 1e6,
				outputPrice: 0.3 / 1e6,
				requestPrice: 0,
				contextSize: 1000000,
				maxOutput: undefined,
				streaming: true,
				reasoning: true,
				vision: false,
			},
		],
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
				requestPrice: 0,
				contextSize: 8129,
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: true,
	},
] as const satisfies ModelDefinition[];
