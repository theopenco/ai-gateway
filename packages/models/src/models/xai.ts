import type { ModelDefinition } from "@llmgateway/models";

export const xaiModels = [
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
				requestPrice: 0,
				contextSize: 131072,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 131072,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 131072,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 131072,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 131072,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				imageInputPrice: 2.0 / 1e6,
				contextSize: 32768,
				streaming: true,
				vision: false,
			},
		],
		jsonOutput: true,
	},
] as const satisfies ModelDefinition[];
