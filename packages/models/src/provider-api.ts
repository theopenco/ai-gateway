import { models } from "./models";

import type { ProviderId } from "./providers";

/**
 * Get the appropriate headers for a given provider API call
 */
export function getProviderHeaders(
	provider: ProviderId,
	token: string,
): Record<string, string> {
	switch (provider) {
		case "anthropic":
			return {
				"x-api-key": token,
				"anthropic-version": "2023-06-01",
			};
		case "google-ai-studio":
			return {};
		case "google-vertex":
		case "kluster.ai":
		case "openai":
		case "inference.net":
		case "xai":
		case "groq":
		case "deepseek":
		default:
			return {
				Authorization: `Bearer ${token}`,
			};
	}
}

/**
 * Prepares the request body for different providers
 */
export function prepareRequestBody(
	usedProvider: ProviderId,
	usedModel: string,
	messages: any[],
	stream: boolean,
	temperature: number | undefined,
	max_tokens: number | undefined,
	top_p: number | undefined,
	frequency_penalty: number | undefined,
	presence_penalty: number | undefined,
	response_format: any,
	tools?: any[],
	tool_choice?: string | { type: string; function: { name: string } },
) {
	const requestBody: any = {
		model: usedModel,
		messages,
		stream: stream,
	};

	// Add tools and tool_choice if provided
	if (tools && tools.length > 0) {
		requestBody.tools = tools;
	}

	if (tool_choice) {
		requestBody.tool_choice = tool_choice;
	}

	// transform messages.content from array to string
	requestBody.messages = messages.map((m) => ({
		role: m.role,
		content: Array.isArray(m.content)
			? m.content.map((c: any) => c.text).join(" ")
			: m.content,
	}));

	switch (usedProvider) {
		case "openai":
		case "xai":
		case "groq":
		case "deepseek": {
			if (stream) {
				requestBody.stream_options = {
					include_usage: true,
				};
			}
			if (response_format) {
				requestBody.response_format = response_format;
			}

			// Add optional parameters if they are provided
			if (temperature !== undefined) {
				requestBody.temperature = temperature;
			}
			if (max_tokens !== undefined) {
				requestBody.max_tokens = max_tokens;
			}
			if (top_p !== undefined) {
				requestBody.top_p = top_p;
			}
			if (frequency_penalty !== undefined) {
				requestBody.frequency_penalty = frequency_penalty;
			}
			if (presence_penalty !== undefined) {
				requestBody.presence_penalty = presence_penalty;
			}
			break;
		}
		case "anthropic": {
			requestBody.max_tokens = max_tokens || 1024; // Set a default if not provided
			requestBody.messages = messages.map((m) => ({
				role:
					m.role === "assistant"
						? "assistant"
						: m.role === "system"
							? "user"
							: "user",
				content: m.role === "system" ? `System: ${m.content}` : m.content,
			}));

			// Add optional parameters if they are provided
			if (temperature !== undefined) {
				requestBody.temperature = temperature;
			}
			if (top_p !== undefined) {
				requestBody.top_p = top_p;
			}
			if (frequency_penalty !== undefined) {
				requestBody.frequency_penalty = frequency_penalty;
			}
			if (presence_penalty !== undefined) {
				requestBody.presence_penalty = presence_penalty;
			}
			break;
		}
		case "google-vertex":
		case "google-ai-studio": {
			delete requestBody.model; // Not used in body
			delete requestBody.stream; // Handled differently
			delete requestBody.messages; // Not used in body for Google AI Studio

			// Extract system messages and combine with user messages
			const systemMessages = messages.filter((m) => m.role === "system");
			const nonSystemMessages = messages.filter((m) => m.role !== "system");
			const systemContext =
				systemMessages.length > 0
					? systemMessages.map((m) => m.content).join(" ") + " "
					: "";

			requestBody.contents = nonSystemMessages.map((m, index) => ({
				parts: [
					{
						text:
							index === 0 && systemContext
								? systemContext + m.content
								: m.content,
					},
				],
			}));
			requestBody.generationConfig = {};

			// Add optional parameters if they are provided
			if (temperature !== undefined) {
				requestBody.generationConfig.temperature = temperature;
			}
			if (max_tokens !== undefined) {
				requestBody.generationConfig.maxOutputTokens = max_tokens;
			}
			if (top_p !== undefined) {
				requestBody.generationConfig.topP = top_p;
			}

			break;
		}
		case "inference.net":
		case "kluster.ai":
		case "together.ai": {
			if (usedModel.startsWith(`${usedProvider}/`)) {
				requestBody.model = usedModel.substring(usedProvider.length + 1);
			}

			// Add optional parameters if they are provided
			if (temperature !== undefined) {
				requestBody.temperature = temperature;
			}
			if (max_tokens !== undefined) {
				requestBody.max_tokens = max_tokens;
			}
			if (top_p !== undefined) {
				requestBody.top_p = top_p;
			}
			if (frequency_penalty !== undefined) {
				requestBody.frequency_penalty = frequency_penalty;
			}
			if (presence_penalty !== undefined) {
				requestBody.presence_penalty = presence_penalty;
			}
			break;
		}
	}

	return requestBody;
}

/**
 * Get the endpoint URL for a provider API call
 */
export function getProviderEndpoint(
	provider: ProviderId,
	baseUrl?: string,
	model?: string,
	token?: string,
): string {
	let modelName = model;
	if (model && model !== "custom") {
		const modelInfo = models.find((m) => m.model === model);
		if (modelInfo) {
			const providerMapping = modelInfo.providers.find(
				(p) => p.providerId === provider,
			);
			if (providerMapping) {
				modelName = providerMapping.modelName;
			}
		}
	}
	let url: string;

	if (baseUrl) {
		url = baseUrl;
	} else {
		switch (provider) {
			case "llmgateway":
				if (model === "custom" || model === "auto") {
					// For custom model, use a default URL for testing
					url = "https://api.openai.com";
				} else {
					throw new Error(`Provider ${provider} requires a baseUrl`);
				}
				break;
			case "openai":
				url = "https://api.openai.com";
				break;
			case "anthropic":
				url = "https://api.anthropic.com";
				break;
			case "google-vertex":
			case "google-ai-studio":
				url = "https://generativelanguage.googleapis.com";
				break;
			case "inference.net":
				url = "https://api.inference.net";
				break;
			case "kluster.ai":
				url = "https://api.kluster.ai";
				break;
			case "together.ai":
				url = "https://api.together.ai";
				break;
			case "cloudrift":
				url = "https://inference.cloudrift.ai";
				break;
			case "mistral":
				url = "https://api.mistral.ai";
				break;
			case "xai":
				url = "https://api.x.ai";
				break;
			case "groq":
				url = "https://api.groq.com/openai";
				break;
			case "deepseek":
				url = "https://api.deepseek.com";
				break;
			default:
				throw new Error(`Provider ${provider} requires a baseUrl`);
		}
	}

	switch (provider) {
		case "anthropic":
			return `${url}/v1/messages`;
		case "google-vertex":
			if (modelName) {
				return `${url}/v1beta/models/${modelName}:generateContent`;
			}
			return `${url}/v1beta/models/gemini-2.0-flash:generateContent`;
		case "google-ai-studio": {
			const baseEndpoint = modelName
				? `${url}/v1beta/models/${modelName}:generateContent`
				: `${url}/v1beta/models/gemini-2.0-flash:generateContent`;
			return token ? `${baseEndpoint}?key=${token}` : baseEndpoint;
		}
		case "inference.net":
		case "kluster.ai":
		case "openai":
		case "llmgateway":
		case "cloudrift":
		case "xai":
		case "groq":
		case "deepseek":
		default:
			return `${url}/v1/chat/completions`;
	}
}

/**
 * Get the cheapest model for a given provider based on input + output pricing
 */
export function getCheapestModelForProvider(
	provider: ProviderId,
): string | null {
	const availableModels = models
		.filter((model) => model.providers.some((p) => p.providerId === provider))
		.filter((model) => !model.deprecatedAt || new Date() <= model.deprecatedAt)
		.map((model) => ({
			model: model.model,
			provider: model.providers.find((p) => p.providerId === provider)!,
		}))
		.filter(
			({ provider: providerInfo }) =>
				providerInfo.inputPrice !== undefined &&
				providerInfo.outputPrice !== undefined,
		);

	if (availableModels.length === 0) {
		return null;
	}

	let cheapestModel = availableModels[0].provider.modelName;
	let lowestPrice = Number.MAX_VALUE;

	for (const { provider: providerInfo } of availableModels) {
		const totalPrice =
			(providerInfo.inputPrice! + providerInfo.outputPrice!) / 2;
		if (totalPrice < lowestPrice) {
			lowestPrice = totalPrice;
			cheapestModel = providerInfo.modelName;
		}
	}

	return cheapestModel;
}

/**
 * Get the cheapest provider and model from a list of available model providers
 */
export function getCheapestFromAvailableProviders<
	T extends { providerId: string; modelName: string },
>(availableModelProviders: T[], modelWithPricing: any): T | null {
	if (availableModelProviders.length === 0) {
		return null;
	}

	let cheapestProvider = availableModelProviders[0];
	let lowestPrice = Number.MAX_VALUE;

	for (const provider of availableModelProviders) {
		const providerInfo = modelWithPricing.providers.find(
			(p: any) => p.providerId === provider.providerId,
		);
		const totalPrice =
			((providerInfo?.inputPrice || 0) + (providerInfo?.outputPrice || 0)) / 2;

		if (totalPrice < lowestPrice) {
			lowestPrice = totalPrice;
			cheapestProvider = provider;
		}
	}

	return cheapestProvider;
}

/**
 * Validate a provider API key by making a minimal request
 */
export async function validateProviderKey(
	provider: ProviderId,
	token: string,
	baseUrl?: string,
	skipValidation = false,
): Promise<{ valid: boolean; error?: string; statusCode?: number }> {
	// Skip validation if requested (e.g. in test environment)
	if (skipValidation) {
		return { valid: true };
	}

	try {
		const endpoint = getProviderEndpoint(
			provider,
			baseUrl,
			undefined,
			provider === "google-ai-studio" ? token : undefined,
		);

		// Use prepareRequestBody to create the validation payload
		const systemMessage = {
			role: "system",
			content: "You are a helpful assistant.",
		};
		const minimalMessage = { role: "user", content: "Hello" };
		const messages = [systemMessage, minimalMessage];

		const validationModel = getCheapestModelForProvider(provider);

		if (!validationModel) {
			throw new Error(
				`No model with pricing information found for provider ${provider}`,
			);
		}

		const payload = prepareRequestBody(
			provider,
			validationModel,
			messages,
			false, // stream
			undefined, // temperature
			1, // max_tokens - minimal for validation
			undefined, // top_p
			undefined, // frequency_penalty
			undefined, // presence_penalty
			undefined, // response_format
		);

		const headers = getProviderHeaders(provider, token);
		headers["Content-Type"] = "application/json";

		const response = await fetch(endpoint, {
			method: "POST",
			headers,
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errorMessage = `Error from provider: ${response.status} ${response.statusText}`;

			try {
				const errorJson = JSON.parse(errorText);
				if (errorJson.error?.message) {
					errorMessage = errorJson.error.message;
				} else if (errorJson.message) {
					errorMessage = errorJson.message;
				}
			} catch (_err) {}

			if (response.status === 401) {
				return {
					valid: false,
					statusCode: response.status,
				};
			}

			return { valid: false, error: errorMessage, statusCode: response.status };
		}

		return { valid: true };
	} catch (error) {
		return {
			valid: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
