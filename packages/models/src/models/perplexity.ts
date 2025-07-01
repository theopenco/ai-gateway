import type { ModelDefinition } from "@llmgateway/models";

export const perplexityModels = [
	{
		model: "sonar-pro",
		deprecatedAt: undefined,
		deactivatedAt: undefined,
		providers: [
			{
				providerId: "perplexity",
				modelName: "sonar-pro",
				inputPrice: 1.0 / 1e6,
				outputPrice: 1.0 / 1e6,
				contextSize: 127072,
				streaming: false,
				vision: false,
			},
		],
		jsonOutput: false,
	},
] as const satisfies ModelDefinition[];
