import type { ModelDefinition } from "@llmgateway/models";

export const mistralModels = [
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
				requestPrice: 0,
				contextSize: 128000,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: false,
	},
] as const satisfies ModelDefinition[];
