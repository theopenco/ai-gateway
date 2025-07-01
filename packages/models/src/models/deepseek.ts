import type { ModelDefinition } from "@llmgateway/models";

export const deepseekModels = [
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
				vision: false,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-chat",
				inputPrice: 0.27 / 1e6,
				outputPrice: 1.1 / 1e6,
				contextSize: 64000,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: false,
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
				vision: false,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-reasoner",
				inputPrice: 0.55 / 1e6,
				outputPrice: 2.19 / 1e6,
				contextSize: 64000,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: false,
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
				vision: false,
			},
			{
				providerId: "deepseek",
				modelName: "deepseek-reasoner",
				inputPrice: 0.55 / 1e6,
				outputPrice: 2.19 / 1e6,
				contextSize: 64000,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: false,
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
				vision: false,
			},
		],
		jsonOutput: true,
	},
] as const satisfies ModelDefinition[];
