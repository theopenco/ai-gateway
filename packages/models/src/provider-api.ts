import crypto from "crypto";
import type Redis from "ioredis";

import { models } from "./models";

import type { ProviderId } from "./providers";

async function fetchImageAsBase64(url: string, redisClient?: Redis) {
	// Validate URL for security
	validateImageUrl(url);
	
	// Generate cache key from URL
	const cacheKey = `image:${crypto.createHash("sha256").update(url).digest("hex")}`;

	// Check cache first if Redis client is provided
	if (redisClient) {
		try {
			const cachedData = await redisClient.get(cacheKey);
			if (cachedData) {
				return JSON.parse(cachedData);
			}
		} catch (error) {
			// If Redis fails, continue without caching (graceful degradation)
			console.warn("Redis cache lookup failed for image:", error);
		}
	}

	// Fetch image with timeout and size limits
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
	
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'LLMGateway/1.0'
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch image (${response.status})`);
		}
		
		// Check content length before downloading
		const contentLength = response.headers.get('content-length');
		const maxSize = 10 * 1024 * 1024; // 10MB limit
		if (contentLength && parseInt(contentLength) > maxSize) {
			throw new Error(`Image too large: ${contentLength} bytes (max: ${maxSize})`);
		}
		
		const arrayBuffer = await response.arrayBuffer();
		
		// Double-check actual size
		if (arrayBuffer.byteLength > maxSize) {
			throw new Error(`Image too large: ${arrayBuffer.byteLength} bytes (max: ${maxSize})`);
		}
		
		const data = Buffer.from(arrayBuffer).toString("base64");
		const media_type = response.headers.get("content-type") || "image/png";
		const result = {
			type: "image",
			source: { type: "base64", media_type, data },
		};

		// Cache the result for 5 minutes (300 seconds) if Redis client is provided
		if (redisClient) {
			try {
				await redisClient.set(cacheKey, JSON.stringify(result), "EX", 300);
			} catch (error) {
				// If Redis fails, continue without caching (graceful degradation)
				console.warn("Redis cache set failed for image:", error);
			}
		}

		return result;
	} finally {
		clearTimeout(timeoutId);
	}
}

function validateImageUrl(url: string): void {
	try {
		const parsedUrl = new URL(url);
		
		// Only allow HTTP/HTTPS protocols
		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			throw new Error('Invalid URL protocol. Only HTTP and HTTPS are allowed.');
		}
		
		// Block private/internal IP ranges
		const hostname = parsedUrl.hostname;
		if (
			hostname === 'localhost' ||
			hostname === '127.0.0.1' ||
			hostname === '::1' ||
			hostname.startsWith('10.') ||
			hostname.startsWith('192.168.') ||
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
			hostname.startsWith('169.254.') // AWS metadata endpoint
		) {
			throw new Error('Access to private networks is not allowed.');
		}
	} catch (error) {
		throw new Error(`Invalid URL: ${error.message}`);
	}
}

async function fetchImageForGoogle(url: string, redisClient?: Redis) {
	// Validate URL for security
	validateImageUrl(url);
	
	// Generate cache key for Google format
	const cacheKey = `google-image:${crypto.createHash("sha256").update(url).digest("hex")}`;

	// Check cache first if Redis client is provided
	if (redisClient) {
		try {
			const cachedData = await redisClient.get(cacheKey);
			if (cachedData) {
				return JSON.parse(cachedData);
			}
		} catch (error) {
			// If Redis fails, continue without caching (graceful degradation)
			console.warn("Redis cache lookup failed for Google image:", error);
		}
	}

	// Fetch image with timeout and size limits
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
	
	try {
		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				'User-Agent': 'LLMGateway/1.0'
			}
		});
		
		if (!response.ok) {
			throw new Error(`Failed to fetch image (${response.status})`);
		}
		
		// Check content length before downloading
		const contentLength = response.headers.get('content-length');
		const maxSize = 10 * 1024 * 1024; // 10MB limit
		if (contentLength && parseInt(contentLength) > maxSize) {
			throw new Error(`Image too large: ${contentLength} bytes (max: ${maxSize})`);
		}
		
		const arrayBuffer = await response.arrayBuffer();
		
		// Double-check actual size
		if (arrayBuffer.byteLength > maxSize) {
			throw new Error(`Image too large: ${arrayBuffer.byteLength} bytes (max: ${maxSize})`);
		}
		
		const data = Buffer.from(arrayBuffer).toString("base64");
		const mimeType = response.headers.get("content-type") || "image/png";
		const result = {
			inlineData: {
				mimeType,
				data,
			},
		};

		// Cache the result for 5 minutes (300 seconds) if Redis client is provided
		if (redisClient) {
			try {
				await redisClient.set(cacheKey, JSON.stringify(result), "EX", 300);
			} catch (error) {
				// If Redis fails, continue without caching (graceful degradation)
				console.warn("Redis cache set failed for Google image:", error);
			}
		}

		return result;
	} finally {
		clearTimeout(timeoutId);
	}
}

async function transformAnthropicMessages(messages: any[], redisClient?: Redis) {
	const results = [] as any[];
	for (const m of messages) {
		if (Array.isArray(m.content)) {
			// Process all images in parallel for better performance
			const newContent = await Promise.all(
				m.content.map(async (part) => {
					if (part.type === "image_url" && part.image_url?.url) {
						try {
							return await fetchImageAsBase64(part.image_url.url, redisClient);
						} catch (error) {
							console.error(`Failed to fetch image ${part.image_url.url}:`, error);
							// Fallback to text representation
							return {
								type: "text",
								text: `[Image failed to load: ${part.image_url.url}]`
							};
						}
					}
					return part;
				})
			);
			results.push({ ...m, content: newContent });
		} else {
			results.push(m);
		}
	}
	return results;
}

async function transformGoogleMessages(messages: any[], redisClient?: Redis) {
	const results = [] as any[];
	for (const m of messages) {
		if (Array.isArray(m.content)) {
			// Process all parts in parallel for better performance
			const parts = await Promise.all(
				m.content.map(async (part) => {
					if (part.type === "text") {
						return { text: part.text };
					} else if (part.type === "image_url" && part.image_url?.url) {
						try {
							return await fetchImageForGoogle(part.image_url.url, redisClient);
						} catch (error) {
							console.error(`Failed to fetch image ${part.image_url.url}:`, error);
							// Fallback to text representation
							return { text: `[Image failed to load: ${part.image_url.url}]` };
						}
					}
					return part; // Return other part types as-is
				})
			);
			results.push({
				role: m.role === "assistant" ? "model" : "user",
				parts,
			});
		} else {
			results.push({
				role: m.role === "assistant" ? "model" : "user",
				parts: [{ text: m.content }],
			});
		}
	}
	return results;
}

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
export async function prepareRequestBody(
	usedProvider: ProviderId,
	usedModel: string,
	messagesInput: any[],
	stream: boolean,
	temperature: number | undefined,
	max_tokens: number | undefined,
	top_p: number | undefined,
	frequency_penalty: number | undefined,
	presence_penalty: number | undefined,
	response_format: any,
	tools?: any[],
	tool_choice?: string | { type: string; function: { name: string } },
	reasoning_effort?: "low" | "medium" | "high",
	redisClient?: Redis,
) {
	// filter out empty messages
	const messages = messagesInput.map((m) => ({
		role: m.role,
		content: Array.isArray(m.content)
			? m.content.filter((c: any) => {
					if (c.type === "text" && Object.keys(c).length === 2) {
						return c.text.trim() !== "";
					}
					return true;
				})
			: m.content,
	}));

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
			if (reasoning_effort !== undefined) {
				requestBody.reasoning_effort = reasoning_effort;
			}
			break;
		}
		case "anthropic": {
			requestBody.max_tokens = max_tokens || 1024;
			requestBody.messages = await transformAnthropicMessages(messages, redisClient);

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

			requestBody.contents = await transformGoogleMessages(messages, redisClient);

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

		const payload = await prepareRequestBody(
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
			undefined, // tools
			undefined, // tool_choice
			undefined, // reasoning_effort
			undefined, // redisClient - no caching for validation
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
