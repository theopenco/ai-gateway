import type { AppConfig } from "./config-server";

// Global variable to store the config from the loader
let globalConfig: AppConfig | null = null;

// Set the global config from the loader
export function setGlobalConfig(config: AppConfig): void {
	globalConfig = config;
}

/**
 * Get configuration synchronously (throws if not loaded)
 * Use this only in contexts where you know config is already loaded
 */
export function getConfigSync(): AppConfig {
	if (!globalConfig) {
		throw new Error(
			"Configuration not loaded. Use Route.useLoaderData() in React components.",
		);
	}
	return globalConfig;
}
