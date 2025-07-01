import type { ModelDefinition } from "@llmgateway/models";

export const perplexityModels = [
	{
		model: "sonar-reasoning-pro",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "perplexity",
				modelName: "sonar-reasoning-pro",
				inputPrice: 0.000003,
				outputPrice: 0.00001,
				requestPrice: 0,
				imageInputPrice: 0,
				contextSize: 128000,
				streaming: false,
				vision: false,
			},
		],
		jsonOutput: false,
	},
	{
		model: "sonar-pro",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "perplexity",
				modelName: "sonar-pro",
				inputPrice: 0.000003,
				outputPrice: 0.000015,
				requestPrice: 0,
				imageInputPrice: 0,
				contextSize: 200000,
				streaming: false,
				vision: false,
			},
		],
		jsonOutput: false,
	},
	{
		model: "sonar",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "perplexity",
				modelName: "sonar",
				inputPrice: 0.000001,
				outputPrice: 0.000001,
				requestPrice: 5.0 / 1000,
				imageInputPrice: 0,
				contextSize: 130000,
				streaming: false,
				vision: false,
			},
		],
		jsonOutput: false,
	},
] as const satisfies ModelDefinition[];
