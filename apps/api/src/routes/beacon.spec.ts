import { describe, expect, it, vi } from "vitest";

import { app } from "../index";
import { posthog } from "../posthog";

// Mock PostHog
vi.mock("../posthog", () => ({
	posthog: {
		capture: vi.fn(),
	},
}));

describe("beacon endpoint", () => {
	it("should accept valid beacon data", async () => {
		const beaconData = {
			uuid: "123e4567-e89b-12d3-a456-426614174000",
			type: "self-host",
			timestamp: "2024-01-01T00:00:00.000Z",
		};

		const response = await app.request("/beacon", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(beaconData),
		});

		expect(response.status).toBe(200);
		const responseData = await response.json();
		expect(responseData).toEqual({
			success: true,
			message: "Beacon received successfully",
		});

		// Verify PostHog was called with correct data
		expect(posthog.capture).toHaveBeenCalledWith({
			distinctId: beaconData.uuid,
			event: "self_hosted_installation_beacon",
			properties: {
				installation_type: beaconData.type,
				timestamp: beaconData.timestamp,
				source: "self_hosted_api",
			},
		});
	});

	it("should reject invalid UUID", async () => {
		const beaconData = {
			uuid: "invalid-uuid",
			type: "self-host",
			timestamp: "2024-01-01T00:00:00.000Z",
		};

		const response = await app.request("/beacon", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(beaconData),
		});

		expect(response.status).toBe(400);
	});

	it("should reject invalid timestamp", async () => {
		const beaconData = {
			uuid: "123e4567-e89b-12d3-a456-426614174000",
			type: "self-host",
			timestamp: "invalid-timestamp",
		};

		const response = await app.request("/beacon", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(beaconData),
		});

		expect(response.status).toBe(400);
	});

	it("should reject missing fields", async () => {
		const beaconData = {
			uuid: "123e4567-e89b-12d3-a456-426614174000",
			// missing type and timestamp
		};

		const response = await app.request("/beacon", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(beaconData),
		});

		expect(response.status).toBe(400);
	});
});
