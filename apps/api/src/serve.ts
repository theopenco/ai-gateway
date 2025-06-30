import { serve } from "@hono/node-server";
import { runMigrations } from "@llmgateway/db";

import { app } from "./index";
import { sendInstallationBeacon } from "./lib/beacon";

async function startServer() {
	const port = Number(process.env.PORT) || 4002;

	// Run migrations if the environment variable is set
	if (process.env.RUN_MIGRATIONS === "true") {
		try {
			await runMigrations();
		} catch (error) {
			console.error("Failed to run migrations, exiting...", error);
			process.exit(1);
		}
	}

	// Send installation beacon for self-hosted tracking
	// This runs in the background and won't block startup
	sendInstallationBeacon().catch((error) => {
		console.warn("Failed to send installation beacon:", error);
	});

	console.log("listening on port", port);

	serve({
		port,
		fetch: app.fetch,
	});
}

// Start the server
startServer().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
