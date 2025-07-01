import { getConfig } from "./config-server";

import type { AppConfig } from "./config-server";

// Cache for configuration
let configCache: AppConfig | null = null;
let configPromise: Promise<AppConfig> | null = null;

/**
 * Get configuration synchronously (throws if not loaded)
 * Use this only in contexts where you know config is already loaded
 */
export function getConfigSync(): AppConfig {
	if (!configCache) {
		throw new Error(
			"Configuration not loaded. Call loadConfig() first or use useAppConfig() in React components.",
		);
	}
	return configCache;
}

/**
 * Load configuration and cache it
 * Call this early in the application lifecycle
 */
export async function loadConfig(): Promise<AppConfig> {
	if (configCache) {
		return configCache;
	}

	if (!configPromise) {
		configPromise = getConfig();
	}

	configCache = await configPromise;
	return configCache;
}

/**
 * Check if configuration is loaded
 */
export function isConfigLoaded(): boolean {
	return configCache !== null;
}

/**
 * Clear the configuration cache (for testing)
 */
export function clearConfigCache(): void {
	configCache = null;
	configPromise = null;
}
