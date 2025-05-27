import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@openllm/db";
import "dotenv/config";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { chat } from "./chat/chat";
import redisClient from "./lib/redis";
import { models } from "./models";

import type { ServerTypes } from "./vars";

export const app = new OpenAPIHono<ServerTypes>();

// Middleware to check for application/json content type on POST requests
app.use("*", async (c, next) => {
	if (c.req.method === "POST") {
		const contentType = c.req.header("Content-Type");
		if (!contentType || !contentType.includes("application/json")) {
			throw new HTTPException(415, {
				message:
					"Unsupported Media Type: Content-Type must be application/json",
			});
		}
	}
	return await next();
});

app.onError((error, c) => {
	if (error instanceof HTTPException) {
		const status = error.status;

		if (status >= 500) {
			console.log("HTTPException", error);
		}

		return c.json(
			{
				error: true,
				status,
				message: error.message || "An error occurred",
				...(error.res ? { details: error.res } : {}),
			},
			status,
		);
	}

	// For any other errors (non-HTTPException), return 500 Internal Server Error
	console.error("Unhandled error:", error);
	return c.json(
		{
			error: true,
			status: 500,
			message: "Internal Server Error",
		},
		500,
	);
});

const root = createRoute({
	method: "get",
	path: "/",
	request: {},
	responses: {
		200: {
			content: {
				"application/json": {
					schema: z
						.object({
							message: z.string(),
							health: z.object({
								status: z.string(),
								redis: z.object({
									connected: z.boolean(),
									error: z.string().optional(),
								}),
								database: z.object({
									connected: z.boolean(),
									error: z.string().optional(),
								}),
							}),
						})
						.openapi({}),
				},
			},
			description: "Health check response.",
		},
	},
});

app.openapi(root, async (c) => {
	const health = {
		status: "ok",
		redis: { connected: false, error: undefined as string | undefined },
		database: { connected: false, error: undefined as string | undefined },
	};

	try {
		await redisClient.ping();
		health.redis.connected = true;
	} catch (error) {
		health.status = "error";
		health.redis.error = "Redis connection failed";
		console.error("Redis healthcheck failed:", error);
	}

	try {
		await db.query.user.findFirst({});
		health.database.connected = true;
	} catch (error) {
		health.status = "error";
		health.database.error = "Database connection failed";
		console.error("Database healthcheck failed:", error);
	}

	return c.json({ message: "OK", health });
});

const v1 = new OpenAPIHono<ServerTypes>();

v1.route("/chat", chat);
v1.route("/models", models);

app.route("/v1", v1);

app.doc("/json", {
	openapi: "3.0.0",
	info: {
		version: "1.0.0",
		title: "My API",
	},
});

app.get("/docs", swaggerUI({ url: "/json" }));
