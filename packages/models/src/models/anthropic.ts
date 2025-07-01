import type { ModelDefinition } from "@llmgateway/models";

export const anthropicModels = [
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
			},
		],
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
				reasoning: true,
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
			},
		],
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
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
				requestPrice: 0,
				contextSize: 200000,
				streaming: true,
				vision: false,
			},
		],
	},
] as const satisfies ModelDefinition[];
