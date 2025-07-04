import { Route } from "@/routes/__root";

import type { AppConfig } from "./config-server";

/**
 * Synchronous config access that uses the data loaded by the root route's loader
 */
export function useAppConfigValue(): AppConfig {
	return Route.useLoaderData();
}

// Re-export types
export type { AppConfig };
