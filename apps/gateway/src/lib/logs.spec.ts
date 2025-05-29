import { UnifiedFinishReason } from "@openllm/db";
import { describe, expect, it } from "vitest";

import { getUnifiedFinishReason } from "./logs";

describe("getUnifiedFinishReason", () => {
	it("maps OpenAI finish reasons correctly", () => {
		expect(getUnifiedFinishReason("stop", "openai")).toBe(
			UnifiedFinishReason.COMPLETED,
		);
		expect(getUnifiedFinishReason("length", "openai")).toBe(
			UnifiedFinishReason.LENGTH_LIMIT,
		);
		expect(getUnifiedFinishReason("content_filter", "openai")).toBe(
			UnifiedFinishReason.CONTENT_FILTER,
		);
	});

	it("maps Anthropic finish reasons correctly", () => {
		expect(getUnifiedFinishReason("stop_sequence", "anthropic")).toBe(
			UnifiedFinishReason.COMPLETED,
		);
		expect(getUnifiedFinishReason("max_tokens", "anthropic")).toBe(
			UnifiedFinishReason.LENGTH_LIMIT,
		);
		expect(getUnifiedFinishReason("end_turn", "anthropic")).toBe(
			UnifiedFinishReason.COMPLETED,
		);
	});

	it("maps Google Vertex finish reasons correctly", () => {
		expect(getUnifiedFinishReason("STOP", "google-vertex")).toBe(
			UnifiedFinishReason.COMPLETED,
		);
		expect(getUnifiedFinishReason("MAX_TOKENS", "google-vertex")).toBe(
			UnifiedFinishReason.LENGTH_LIMIT,
		);
		expect(getUnifiedFinishReason("SAFETY", "google-vertex")).toBe(
			UnifiedFinishReason.CONTENT_FILTER,
		);
	});

	it("handles special cases", () => {
		expect(getUnifiedFinishReason("canceled", "any-provider")).toBe(
			UnifiedFinishReason.CANCELED,
		);
		expect(getUnifiedFinishReason("gateway_error", "any-provider")).toBe(
			UnifiedFinishReason.GATEWAY_ERROR,
		);
		expect(getUnifiedFinishReason("upstream_error", "any-provider")).toBe(
			UnifiedFinishReason.UPSTREAM_ERROR,
		);
		expect(getUnifiedFinishReason(null, "any-provider")).toBe(
			UnifiedFinishReason.UNKNOWN,
		);
		expect(getUnifiedFinishReason(undefined, "any-provider")).toBe(
			UnifiedFinishReason.UNKNOWN,
		);
		expect(getUnifiedFinishReason("unknown_reason", "any-provider")).toBe(
			UnifiedFinishReason.UNKNOWN,
		);
	});
});
