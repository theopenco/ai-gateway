import { db, tables } from "@openllm/db";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { app } from "..";
import { createTestUser, deleteAll } from "../testing";

describe("activity endpoint", () => {
	let token: string;
	beforeEach(async () => {
		token = await createTestUser();

		await db.insert(tables.organization).values({
			id: "test-org-id",
			name: "Test Organization",
		});

		await db.insert(tables.userOrganization).values({
			id: "test-user-org-id",
			userId: "test-user-id",
			organizationId: "test-org-id",
		});

		await db.insert(tables.project).values({
			id: "test-project-id",
			name: "Test Project",
			organizationId: "test-org-id",
		});

		await db.insert(tables.apiKey).values({
			id: "test-api-key-id",
			token: "test-token",
			projectId: "test-project-id",
			description: "Test API Key",
		});

		await db.insert(tables.providerKey).values({
			id: "test-provider-key-id",
			token: "test-provider-token",
			provider: "openai",
			organizationId: "test-org-id",
		});

		// Insert some log entries with different dates
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const twoDaysAgo = new Date(today);
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

		await db.insert(tables.log).values([
			{
				id: "log-1",
				requestId: "log-1",
				createdAt: today,
				updatedAt: today,
				organizationId: "test-org-id",
				projectId: "test-project-id",
				apiKeyId: "test-api-key-id",
				providerKeyId: "test-provider-key-id",
				duration: 100,
				requestedModel: "gpt-4",
				requestedProvider: "openai",
				usedModel: "gpt-4",
				usedProvider: "openai",
				responseSize: 1000,
				promptTokens: "10",
				completionTokens: "20",
				totalTokens: "30",
				messages: JSON.stringify([{ role: "user", content: "Hello" }]),
			},
			{
				id: "log-2",
				requestId: "log-2",
				createdAt: today,
				updatedAt: today,
				organizationId: "test-org-id",
				projectId: "test-project-id",
				apiKeyId: "test-api-key-id",
				providerKeyId: "test-provider-key-id",
				duration: 200,
				requestedModel: "gpt-3.5-turbo",
				requestedProvider: "openai",
				usedModel: "gpt-3.5-turbo",
				usedProvider: "openai",
				responseSize: 800,
				promptTokens: "5",
				completionTokens: "15",
				totalTokens: "20",
				messages: JSON.stringify([{ role: "user", content: "Hi" }]),
			},
			{
				id: "log-3",
				requestId: "log-3",
				createdAt: yesterday,
				updatedAt: yesterday,
				organizationId: "test-org-id",
				projectId: "test-project-id",
				apiKeyId: "test-api-key-id",
				providerKeyId: "test-provider-key-id",
				duration: 150,
				requestedModel: "gpt-4",
				requestedProvider: "openai",
				usedModel: "gpt-4",
				usedProvider: "openai",
				responseSize: 1200,
				promptTokens: "15",
				completionTokens: "25",
				totalTokens: "40",
				messages: JSON.stringify([{ role: "user", content: "Test" }]),
			},
			{
				id: "log-4",
				requestId: "log-4",
				createdAt: twoDaysAgo,
				updatedAt: twoDaysAgo,
				organizationId: "test-org-id",
				projectId: "test-project-id",
				apiKeyId: "test-api-key-id",
				providerKeyId: "test-provider-key-id",
				duration: 180,
				requestedModel: "gpt-3.5-turbo",
				requestedProvider: "openai",
				usedModel: "gpt-3.5-turbo",
				usedProvider: "openai",
				responseSize: 900,
				promptTokens: "8",
				completionTokens: "18",
				totalTokens: "26",
				messages: JSON.stringify([{ role: "user", content: "Query" }]),
			},
		]);
	});

	afterEach(async () => {
		await deleteAll();
	});

	test("GET /activity should return activity data grouped by day", async () => {
		// Mock authentication
		const res = await app.request("/activity?days=7", {
			headers: {
				Cookie: token,
			},
		});

		expect(res.status).toBe(200);
		const data = await res.json();

		expect(data).toHaveProperty("activity");
		expect(Array.isArray(data.activity)).toBe(true);
		expect(data.activity.length).toBe(3); // Today, yesterday, and two days ago

		// Check structure of the response
		const firstDay = data.activity[0];
		expect(firstDay).toHaveProperty("date");
		expect(firstDay).toHaveProperty("requestCount");
		expect(firstDay).toHaveProperty("inputTokens");
		expect(firstDay).toHaveProperty("outputTokens");
		expect(firstDay).toHaveProperty("totalTokens");
		expect(firstDay).toHaveProperty("cost");
		expect(firstDay).toHaveProperty("modelBreakdown");
		expect(Array.isArray(firstDay.modelBreakdown)).toBe(true);

		// Check model breakdown
		const modelData = firstDay.modelBreakdown[0];
		expect(modelData).toHaveProperty("model");
		expect(modelData).toHaveProperty("provider");
		expect(modelData).toHaveProperty("requestCount");
		expect(modelData).toHaveProperty("inputTokens");
		expect(modelData).toHaveProperty("outputTokens");
		expect(modelData).toHaveProperty("totalTokens");
		expect(modelData).toHaveProperty("cost");
	});

	test("GET /activity should require days parameter", async () => {
		const res = await app.request("/activity", {
			headers: {
				Authorization: "Bearer test-token",
				Cookie: token,
			},
		});

		expect(res.status).toBe(400);
	});

	test("GET /activity should require authentication", async () => {
		const res = await app.request("/activity?days=7");
		expect(res.status).toBe(401);
	});
});
