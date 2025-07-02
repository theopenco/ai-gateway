import { anthropicModels } from "./models/anthropic";
import { deepseekModels } from "./models/deepseek";
import { googleModels } from "./models/google";
import { llmgatewayModels } from "./models/llmgateway";
import { metaModels } from "./models/meta";
import { mistralModels } from "./models/mistral";
import { openaiModels } from "./models/openai";
import { perplexityModels } from "./models/perplexity";
import { xaiModels } from "./models/xai";

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
	 * Price per request in USD
	 */
	requestPrice?: number;
	/**
	 * Maximum context window size in tokens
	 */
	contextSize?: number;
	/**
	 * Maximum output size in tokens
	 */
	maxOutput?: number;
	/**
	 * Whether this specific model supports streaming for this provider
	 */
	streaming: boolean;
	/**
	 * Whether this specific model supports vision (image inputs) for this provider
	 */
	vision?: boolean;
	/**
	 * Whether this model supports reasoning mode
	 */
	reasoning?: boolean;
	/**
	 * Test skip/only functionality
	 */
	test?: "skip" | "only";
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

export const models = [
	...llmgatewayModels,
	...openaiModels,
	...anthropicModels,
	...googleModels,
	...perplexityModels,
	...xaiModels,
	...metaModels,
	...deepseekModels,
	...mistralModels,
] as const satisfies ModelDefinition[];
