import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { posthog } from "../posthog";

import type { ServerTypes } from "../vars";

export const beacon = new OpenAPIHono<ServerTypes>();

const beaconDataSchema = z.object({
	uuid: z.string().uuid("Must be a valid UUID"),
	type: z.string().min(1, "Type is required"),
	timestamp: z.string().datetime("Must be a valid ISO datetime"),
});

const beaconRoute = createRoute({
	method: "post",
	path: "/beacon",
	request: {
		body: {
			content: {
				"application/json": {
					schema: beaconDataSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z.object({
						success: z.boolean(),
						message: z.string(),
					}),
				},
			},
			description: "Beacon data received successfully",
		},
	},
});

beacon.openapi(beaconRoute, async (c) => {
	try {
		const beaconData = c.req.valid("json");

		// Send the installation data to PostHog for anonymous tracking
		posthog.capture({
			distinctId: beaconData.uuid,
			event: "self_hosted_installation_beacon",
			properties: {
				installation_type: beaconData.type,
				timestamp: beaconData.timestamp,
				// Add some additional context
				source: "self_hosted_api",
			},
		});

		console.log(
			`Received beacon from installation ${beaconData.uuid} (${beaconData.type})`,
		);

		return c.json({
			success: true,
			message: "Beacon received successfully",
		});
	} catch (error) {
		console.error("Error processing beacon:", error);

		// For simplicity, let's still return 200 but with an error flag
		// This prevents the self-hosted installation from seeing errors
		return c.json({
			success: false,
			message: "Failed to process beacon data",
		});
	}
});
