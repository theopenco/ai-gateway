import type { ModelDefinition } from "@llmgateway/models";

export const metaModels = [
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
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
			{
				providerId: "kluster.ai",
				modelName: "klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
				inputPrice: 0.07 / 1e6,
				outputPrice: 0.33 / 1e6,
				contextSize: 128000,
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
			{
				providerId: "together.ai",
				modelName: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
				inputPrice: 0.88 / 1e6,
				outputPrice: 0.88 / 1e6,
				contextSize: 128000,
				maxOutput: undefined,
				streaming: false,
				vision: false,
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
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
		],
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
				vision: false,
			},
		],
	},
	{
		model: "llama-guard-4-12b",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "groq",
				modelName: "meta-llama/llama-guard-4-12b",
				inputPrice: 0.2 / 1e6,
				outputPrice: 0.2 / 1e6,
				contextSize: 131072,
				maxOutput: undefined,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: true,
	},
] as const satisfies ModelDefinition[];
