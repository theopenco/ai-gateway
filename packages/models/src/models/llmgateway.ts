import type { ModelDefinition } from "@llmgateway/models";

export const llmgatewayModels = [
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
				vision: false,
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
				vision: false,
			},
		],
	},
] as const satisfies ModelDefinition[];
