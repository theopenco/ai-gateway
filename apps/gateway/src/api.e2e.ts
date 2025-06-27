import { db, tables, eq } from "@llmgateway/db";
import { models, providers } from "@llmgateway/models";
import "dotenv/config";
import { beforeEach, describe, expect, test } from "vitest";

import { app } from ".";
import {
	clearCache,
	waitForLogs,
	getProviderEnvVar,
} from "./test-utils/test-helpers";

// Helper function to get test options with retry for CI environment
function getTestOptions() {
	return process.env.CI ? { retry: 3 } : {};
}

console.log("running with test options:", getTestOptions());

const fullMode = process.env.FULL_MODE;

const testModels = models
	.filter((model) => !["custom", "auto"].includes(model.model))
	.flatMap((model) => {
		const testCases = [];

		if (fullMode) {
			// test all models
			testCases.push({
				model: model.model,
				providers: model.providers,
			});
		}

		// Create entries for provider-specific requests using provider/model format
		for (const provider of model.providers) {
			testCases.push({
				model: `${provider.providerId}/${model.model}`,
				providers: [provider],
				originalModel: model.model, // Keep track of the original model for reference
			});
		}

		return testCases;
	});

const streamingModels = testModels.filter((m) =>
	m.providers.some((p: any) => {
		// Check model-level streaming first, then fall back to provider-level
		if (p.streaming !== undefined) {
			return p.streaming;
		}
		const provider = providers.find((pr) => pr.id === p.providerId);
		return provider?.streaming;
	}),
);

describe("e2e tests with real provider keys", () => {
	beforeEach(async () => {
		await clearCache();

		await Promise.all([
			db.delete(tables.log),
			db.delete(tables.apiKey),
			db.delete(tables.providerKey),
		]);

		await Promise.all([
			db.delete(tables.userOrganization),
			db.delete(tables.project),
		]);

		await Promise.all([
			db.delete(tables.organization),
			db.delete(tables.user),
			db.delete(tables.account),
			db.delete(tables.session),
			db.delete(tables.verification),
		]);

		await db.insert(tables.user).values({
			id: "user-id",
			name: "user",
			email: "user",
		});

		await db.insert(tables.organization).values({
			id: "org-id",
			name: "Test Organization",
			plan: "pro",
		});

		await db.insert(tables.userOrganization).values({
			id: "user-org-id",
			userId: "user-id",
			organizationId: "org-id",
		});

		await db.insert(tables.project).values({
			id: "project-id",
			name: "Test Project",
			organizationId: "org-id",
			mode: "api-keys",
		});

		await db.insert(tables.apiKey).values({
			id: "token-id",
			token: "real-token",
			projectId: "project-id",
			description: "Test API Key",
		});

		for (const provider of providers) {
			const envVarName = getProviderEnvVar(provider.id);
			const envVarValue = envVarName ? process.env[envVarName] : undefined;
			if (envVarValue) {
				await createProviderKey(provider.id, envVarValue, "api-keys");
				await createProviderKey(provider.id, envVarValue, "credits");
			}
		}
	});

	async function createProviderKey(
		provider: string,
		token: string,
		keyType: "api-keys" | "credits" = "api-keys",
	) {
		const keyId =
			keyType === "credits" ? `env-${provider}` : `provider-key-${provider}`;
		await db.insert(tables.providerKey).values({
			id: keyId,
			token,
			provider: provider.replace("env-", ""), // Remove env- prefix for the provider field
			organizationId: "org-id",
		});
	}

	function validateResponse(json: any) {
		expect(json).toHaveProperty("choices.[0].message.content");

		expect(json).toHaveProperty("usage.prompt_tokens");
		expect(json).toHaveProperty("usage.completion_tokens");
		expect(json).toHaveProperty("usage.total_tokens");
	}

	async function validateLogs() {
		const logs = await waitForLogs(1);
		expect(logs.length).toBeGreaterThan(0);

		console.log("logs", logs);

		const log = logs[0];
		expect(log.usedProvider).toBeTruthy();

		expect(log.finishReason).not.toBeNull();
		expect(log.unifiedFinishReason).not.toBeNull();
		expect(log.unifiedFinishReason).toBeTruthy();

		expect(log.usedModel).toBeTruthy();
		expect(log.requestedModel).toBeTruthy();

		return log;
	}

	test.each(testModels)(
		"/v1/chat/completions with $model",
		getTestOptions(),
		async ({ model }) => {
			const res = await app.request("/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer real-token`,
				},
				body: JSON.stringify({
					model: model,
					messages: [
						{
							role: "system",
							content: "You are a helpful assistant.",
						},
						{
							role: "user",
							content: "Hello, just reply 'OK'!",
						},
					],
				}),
			});

			const json = await res.json();
			console.log("response:", JSON.stringify(json, null, 2));

			expect(res.status).toBe(200);
			validateResponse(json);

			const log = await validateLogs();
			expect(log.streamed).toBe(false);

			expect(json).toHaveProperty("usage");
			expect(json.usage).toHaveProperty("prompt_tokens");
			expect(json.usage).toHaveProperty("completion_tokens");
			expect(json.usage).toHaveProperty("total_tokens");
			expect(typeof json.usage.prompt_tokens).toBe("number");
			expect(typeof json.usage.completion_tokens).toBe("number");
			expect(typeof json.usage.total_tokens).toBe("number");
			expect(json.usage.prompt_tokens).toBeGreaterThan(0);
			expect(json.usage.completion_tokens).toBeGreaterThan(0);
			expect(json.usage.total_tokens).toBeGreaterThan(0);

			// expect(log.inputCost).not.toBeNull();
			// expect(log.outputCost).not.toBeNull();
			// expect(log.cost).not.toBeNull();
		},
	);

	test.each(streamingModels)(
		"/v1/chat/completions streaming with $model",
		getTestOptions(),
		async ({ model }) => {
			const res = await app.request("/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer real-token`,
				},
				body: JSON.stringify({
					model: model,
					messages: [
						{
							role: "system",
							content: "You are a helpful assistant.",
						},
						{
							role: "user",
							content: "Hello! This is a streaming e2e test.",
						},
					],
					stream: true,
				}),
			});

			if (res.status !== 200) {
				console.log("response:", await res.text());
				throw new Error(`Request failed with status ${res.status}`);
			}

			expect(res.status).toBe(200);
			expect(res.headers.get("content-type")).toContain("text/event-stream");

			const streamResult = await readAll(res.body);

			expect(streamResult.hasValidSSE).toBe(true);
			expect(streamResult.eventCount).toBeGreaterThan(0);
			expect(streamResult.hasContent).toBe(true);

			// Verify that all streaming responses are transformed to OpenAI format
			expect(streamResult.hasOpenAIFormat).toBe(true);

			// Verify that chunks have the correct OpenAI streaming format
			const contentChunks = streamResult.chunks.filter(
				(chunk) => chunk.choices?.[0]?.delta?.content,
			);
			expect(contentChunks.length).toBeGreaterThan(0);

			// Verify each content chunk has proper OpenAI format
			for (const chunk of contentChunks) {
				expect(chunk).toHaveProperty("id");
				expect(chunk).toHaveProperty("object", "chat.completion.chunk");
				expect(chunk).toHaveProperty("created");
				expect(chunk).toHaveProperty("model");
				expect(chunk).toHaveProperty("choices");
				expect(chunk.choices).toHaveLength(1);
				expect(chunk.choices[0]).toHaveProperty("index", 0);
				expect(chunk.choices[0]).toHaveProperty("delta");
				expect(chunk.choices[0]).toHaveProperty("delta.role", "assistant");
				expect(chunk.choices[0].delta).toHaveProperty("content");
				expect(typeof chunk.choices[0].delta.content).toBe("string");
			}

			// Verify that usage object is returned in streaming mode
			const usageChunks = streamResult.chunks.filter(
				(chunk) =>
					chunk.usage &&
					(chunk.usage.prompt_tokens !== null ||
						chunk.usage.completion_tokens !== null ||
						chunk.usage.total_tokens !== null),
			);
			expect(usageChunks.length).toBeGreaterThan(0);

			// Verify the usage chunk has proper format
			const usageChunk = usageChunks[usageChunks.length - 1]; // Get the last usage chunk
			expect(usageChunk).toHaveProperty("usage");
			expect(usageChunk.usage).toHaveProperty("prompt_tokens");
			expect(usageChunk.usage).toHaveProperty("completion_tokens");
			expect(usageChunk.usage).toHaveProperty("total_tokens");
			expect(typeof usageChunk.usage.prompt_tokens).toBe("number");
			expect(typeof usageChunk.usage.completion_tokens).toBe("number");
			expect(typeof usageChunk.usage.total_tokens).toBe("number");
			expect(usageChunk.usage.prompt_tokens).toBeGreaterThan(0);
			expect(usageChunk.usage.completion_tokens).toBeGreaterThan(0);
			expect(usageChunk.usage.total_tokens).toBeGreaterThan(0);

			const log = await validateLogs();
			expect(log.streamed).toBe(true);

			// expect(log.cost).not.toBeNull();
			// expect(log.cost).toBeGreaterThanOrEqual(0);
		},
	);

	test.each(
		testModels.filter((m) => {
			const modelDef = models.find((def) => def.model === m.model);
			return (modelDef as any)?.jsonOutput === true;
		}),
	)(
		"/v1/chat/completions with JSON output mode for $model",
		getTestOptions(),
		async ({ model }) => {
			const res = await app.request("/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer real-token`,
				},
				body: JSON.stringify({
					model: model,
					messages: [
						{
							role: "system",
							content:
								"You are a helpful assistant. Always respond with valid JSON.",
						},
						{
							role: "user",
							content: 'Return a JSON object with "message": "Hello World"',
						},
					],
					response_format: { type: "json_object" },
				}),
			});

			const json = await res.json();
			console.log("json", JSON.stringify(json, null, 2));
			expect(res.status).toBe(200);
			expect(json).toHaveProperty("choices.[0].message.content");

			const content = json.choices[0].message.content;
			expect(() => JSON.parse(content)).not.toThrow();

			const parsedContent = JSON.parse(content);
			expect(parsedContent).toHaveProperty("message");
		},
	);

	if (fullMode) {
		test.each(testModels)(
			"/v1/chat/completions with complex content array for $model",
			getTestOptions(),
			async ({ model }) => {
				const res = await app.request("/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer real-token`,
					},
					body: JSON.stringify({
						model: model,
						messages: [
							{
								role: "user",
								content: [
									{
										type: "text",
										text: "<task>\nhi sup!\n</task>",
									},
									{
										type: "text",
										text: "",
									},
								],
							},
						],
					}),
				});

				const json = await res.json();
				console.log("response:", JSON.stringify(json, null, 2));

				expect(res.status).toBe(200);
				validateResponse(json);

				const log = await validateLogs();
				expect(log.streamed).toBe(false);

				expect(json).toHaveProperty("usage");
				expect(json.usage).toHaveProperty("prompt_tokens");
				expect(json.usage).toHaveProperty("completion_tokens");
				expect(json.usage).toHaveProperty("total_tokens");
				expect(typeof json.usage.prompt_tokens).toBe("number");
				expect(typeof json.usage.completion_tokens).toBe("number");
				expect(typeof json.usage.total_tokens).toBe("number");
				expect(json.usage.prompt_tokens).toBeGreaterThan(0);
				expect(json.usage.completion_tokens).toBeGreaterThan(0);
				expect(json.usage.total_tokens).toBeGreaterThan(0);
			},
		);
	}

	if (fullMode) {
		test.each(testModels)(
			"/v1/chat/completions with empty content for $model",
			getTestOptions(),
			async ({ model }) => {
				const res = await app.request("/v1/chat/completions", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer real-token`,
					},
					body: JSON.stringify({
						model: model,
						messages: [
							{
								role: "user",
								content: "hi",
							},
							{
								role: "user",
								content: "hi",
							},
						],
					}),
				});

				const json = await res.json();
				console.log("response:", JSON.stringify(json, null, 2));

				expect(res.status).toBe(200);
				validateResponse(json);

				const log = await validateLogs();
				expect(log.streamed).toBe(false);

				expect(json).toHaveProperty("usage");
				expect(json.usage).toHaveProperty("prompt_tokens");
				expect(json.usage).toHaveProperty("completion_tokens");
				expect(json.usage).toHaveProperty("total_tokens");
				expect(typeof json.usage.prompt_tokens).toBe("number");
				expect(typeof json.usage.completion_tokens).toBe("number");
				expect(typeof json.usage.total_tokens).toBe("number");
				expect(json.usage.prompt_tokens).toBeGreaterThan(0);
				expect(json.usage.completion_tokens).toBeGreaterThan(0);
				expect(json.usage.total_tokens).toBeGreaterThan(0);
				expect(json.usage.total_tokens).toEqual(
					json.usage.prompt_tokens + json.usage.completion_tokens,
				);
			},
		);
	}

	test("JSON output mode error for unsupported model", async () => {
		const envVarName = getProviderEnvVar("anthropic");
		const envVarValue = envVarName ? process.env[envVarName] : undefined;
		if (!envVarValue) {
			console.log(
				"Skipping JSON output error test - no Anthropic API key provided",
			);
			return;
		}

		const res = await app.request("/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer real-token`,
			},
			body: JSON.stringify({
				model: "anthropic/claude-3-5-sonnet-20241022",
				messages: [
					{
						role: "user",
						content: "Hello",
					},
				],
				response_format: { type: "json_object" },
			}),
		});

		expect(res.status).toBe(400);

		const text = await res.text();
		expect(text).toContain("does not support JSON output mode");

		await clearCache(); // Process logs BEFORE deleting data
		await db.delete(tables.apiKey);
		await db.delete(tables.providerKey);
	});

	test("/v1/chat/completions with llmgateway/auto in credits mode", async () => {
		// require all provider keys to be set
		for (const provider of providers) {
			const envVarName = getProviderEnvVar(provider.id);
			const envVarValue = envVarName ? process.env[envVarName] : undefined;
			if (!envVarValue) {
				console.log(
					`Skipping llmgateway/auto in credits mode test - no API key provided for ${provider.id}`,
				);
				return;
			}
		}

		await db
			.update(tables.organization)
			.set({ credits: "1000" })
			.where(eq(tables.organization.id, "org-id"));

		await db
			.update(tables.project)
			.set({ mode: "credits" })
			.where(eq(tables.project.id, "project-id"));

		await db.insert(tables.apiKey).values({
			id: "token-credits",
			token: "credits-token",
			projectId: "project-id",
			description: "Test API Key for Credits",
		});

		const res = await app.request("/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer credits-token`,
			},
			body: JSON.stringify({
				model: "llmgateway/auto",
				messages: [
					{
						role: "user",
						content: "Hello with llmgateway/auto in credits mode!",
					},
				],
			}),
		});

		const json = await res.json();
		console.log("response:", JSON.stringify(json, null, 2));
		expect(res.status).toBe(200);
		expect(json).toHaveProperty("choices.[0].message.content");

		const logs = await waitForLogs(1);
		expect(logs.length).toBe(1);
		expect(logs[0].requestedModel).toBe("auto");
		expect(logs[0].usedProvider).toBeTruthy();
		expect(logs[0].usedModel).toBeTruthy();
	});

	test("/v1/chat/completions with bare 'auto' model and credits", async () => {
		await db
			.update(tables.organization)
			.set({ credits: "1000" })
			.where(eq(tables.organization.id, "org-id"));

		await db
			.update(tables.project)
			.set({ mode: "credits" })
			.where(eq(tables.project.id, "project-id"));

		const res = await app.request("/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer real-token`,
			},
			body: JSON.stringify({
				model: "auto",
				messages: [
					{
						role: "user",
						content: "Hello! This is an auto test.",
					},
				],
			}),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json).toHaveProperty("choices.[0].message.content");

		const logs = await waitForLogs(1);
		expect(logs.length).toBe(1);
		expect(logs[0].requestedModel).toBe("auto");
		expect(logs[0].usedProvider).toBeTruthy();
		expect(logs[0].usedModel).toBeTruthy();
	});

	test.skip("/v1/chat/completions with bare 'custom' model", async () => {
		const envVarName = getProviderEnvVar("openai");
		const envVarValue = envVarName ? process.env[envVarName] : undefined;
		if (!envVarValue) {
			console.log("Skipping custom model test - no OpenAI API key provided");
			return;
		}

		await db
			.update(tables.organization)
			.set({ credits: "1000" })
			.where(eq(tables.organization.id, "org-id"));

		await db
			.update(tables.project)
			.set({ mode: "credits" })
			.where(eq(tables.project.id, "project-id"));

		await db.insert(tables.providerKey).values({
			id: "provider-key-custom",
			provider: "llmgateway",
			token: envVarValue,
			baseUrl: "https://api.openai.com", // Use real OpenAI endpoint for testing
			status: "active",
			organizationId: "org-id",
		});

		await db.insert(tables.apiKey).values({
			id: "token-id-2",
			token: "real-token-2",
			projectId: "project-id",
			description: "Test API Key",
		});

		const res = await app.request("/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer real-token-2`,
			},
			body: JSON.stringify({
				model: "custom",
				messages: [
					{
						role: "user",
						content: "Hello! This is a custom test.",
					},
				],
			}),
		});

		expect(res.status).toBe(200);

		const json = await res.json();
		expect(json).toHaveProperty("choices.[0].message.content");

		const logs = await waitForLogs(1);
		expect(logs.length).toBe(1);
		expect(logs[0].requestedModel).toBe("custom");
		expect(logs[0].usedProvider).toBe("llmgateway");
		expect(logs[0].usedModel).toBe("custom");
	});

	test("Success when requesting multi-provider model without prefix", async () => {
		const multiProviderModel = models.find((m) => m.providers.length > 1);
		if (!multiProviderModel) {
			console.log(
				"Skipping multi-provider test - no multi-provider models found",
			);
			return;
		}

		const res = await app.request("/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer real-token`,
			},
			body: JSON.stringify({
				model: multiProviderModel.model,
				messages: [
					{
						role: "user",
						content: "Hello",
					},
				],
			}),
		});

		expect(res.status).toBe(200);
		const json = await res.json();
		validateResponse(json);

		const log = await validateLogs();
		expect(log.streamed).toBe(false);
	});
});

test("Error when requesting provider-specific model name without prefix", async () => {
	// Create a fake model name that would be a provider-specific model name
	const res = await app.request("/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer real-token`,
		},
		body: JSON.stringify({
			model: "claude-3-sonnet-20240229",
			messages: [
				{
					role: "user",
					content: "Hello",
				},
			],
		}),
	});

	expect(res.status).toBe(400);
	const json = await res.json();
	console.log("Provider-specific model error:", JSON.stringify(json, null, 2));
	expect(json.message).toContain("not supported");
});

async function readAll(stream: ReadableStream<Uint8Array> | null): Promise<{
	fullContent?: string;
	hasContent: boolean;
	eventCount: number;
	hasValidSSE: boolean;
	hasOpenAIFormat: boolean;
	chunks: any[];
	hasUsage: boolean;
}> {
	if (!stream) {
		return {
			hasContent: false,
			eventCount: 0,
			hasValidSSE: false,
			hasOpenAIFormat: false,
			chunks: [],
			hasUsage: false,
		};
	}

	const reader = stream.getReader();
	let fullContent = "";
	let eventCount = 0;
	let hasValidSSE = false;
	let hasContent = false;
	let hasOpenAIFormat = true; // Assume true until proven otherwise
	let hasUsage = false;
	const chunks: any[] = [];

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}

			const chunk = new TextDecoder().decode(value);
			fullContent += chunk;

			const lines = chunk.split("\n");
			for (const line of lines) {
				if (line.startsWith("data: ")) {
					eventCount++;
					hasValidSSE = true;

					if (line === "data: [DONE]") {
						continue;
					}

					try {
						const data = JSON.parse(line.substring(6));
						chunks.push(data);

						// Check if this chunk has OpenAI format
						if (
							!data.id ||
							!data.object ||
							data.object !== "chat.completion.chunk"
						) {
							hasOpenAIFormat = false;
						}

						// Check for content in OpenAI format (should be the primary format after transformation)
						if (
							data.choices?.[0]?.delta?.content ||
							data.choices?.[0]?.finish_reason
						) {
							hasContent = true;
						}

						// Check for usage information
						if (
							data.usage &&
							(data.usage.prompt_tokens !== null ||
								data.usage.completion_tokens !== null ||
								data.usage.total_tokens !== null)
						) {
							hasUsage = true;
						}
					} catch {}
				}
			}
		}
	} finally {
		reader.releaseLock();
	}

	return {
		fullContent,
		hasContent,
		eventCount,
		hasValidSSE,
		hasOpenAIFormat,
		chunks,
		hasUsage,
	};
}
