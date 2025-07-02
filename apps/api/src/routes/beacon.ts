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

/**
 * Extracts IP address from request headers, supporting both GCP and Cloudflare
 */
function extractClientIP(c: any): string | null {
	// Cloudflare provides the connecting IP
	const cfConnectingIP = c.req.header("CF-Connecting-IP");
	if (cfConnectingIP) {
		return cfConnectingIP;
	}

	// GCP and other providers use X-Forwarded-For
	const xForwardedFor = c.req.header("X-Forwarded-For");
	if (xForwardedFor) {
		// X-Forwarded-For can contain multiple IPs, take the first one
		return xForwardedFor.split(",")[0].trim();
	}

	// Fallback to X-Real-IP
	const xRealIP = c.req.header("X-Real-IP");
	if (xRealIP) {
		return xRealIP;
	}

	// Last resort: direct connection IP (may be proxy/load balancer)
	return c.req.header("Remote-Addr") || null;
}

/**
 * Extracts region/country information from request headers
 */
function extractRegionInfo(c: any): { country?: string; region?: string } {
	const result: { country?: string; region?: string } = {};

	// Cloudflare provides country code
	const cfCountry = c.req.header("CF-IPCountry");
	if (cfCountry && cfCountry !== "XX") {
		// XX is unknown country in Cloudflare
		result.country = cfCountry;
	}

	// Cloudflare also provides region/state
	const cfRegion = c.req.header("CF-Region");
	if (cfRegion) {
		result.region = cfRegion;
	}

	// GCP Cloud Load Balancer headers (if available)
	const gclbRegion = c.req.header("X-Google-Cloud-Region");
	if (gclbRegion && !result.region) {
		result.region = gclbRegion;
	}

	return result;
}

beacon.openapi(beaconRoute, async (c) => {
	const beaconData = c.req.valid("json");

	// Extract IP and region information
	const clientIP = extractClientIP(c);
	const regionInfo = extractRegionInfo(c);

	// Determine cloud provider based on headers
	const cloudProvider = c.req.header("CF-Ray")
		? "cloudflare"
		: c.req.header("X-Google-Cloud-Region") ||
			  c.req.header("X-Cloud-Trace-Context")
			? "gcp"
			: "unknown";

	// Send the installation data to PostHog for anonymous tracking
	posthog.capture({
		distinctId: beaconData.uuid,
		event: "self_hosted_installation_beacon",
		properties: {
			installation: beaconData.type,
			timestamp: beaconData.timestamp,
			// Add some additional context
			source: "self_hosted_api",
			version: process.env.APP_VERSION || "v0.0.0-unknown",
			// New IP/region tracking data
			client_ip: clientIP,
			country: regionInfo.country,
			region: regionInfo.region,
			cloud_provider: cloudProvider,
			// Additional debugging headers (anonymized)
			has_cf_ray: !!c.req.header("CF-Ray"),
			has_gcp_trace: !!c.req.header("X-Cloud-Trace-Context"),
			user_agent: c.req.header("User-Agent"),
		},
	});

	console.log(
		`Received beacon from installation ${beaconData.uuid} (${beaconData.type}) - IP: ${clientIP}, Country: ${regionInfo.country}, Provider: ${cloudProvider}`,
	);

	return c.json({
		success: true,
		message: "Beacon received successfully",
	});
});
