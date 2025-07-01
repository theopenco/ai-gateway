import { useQuery } from "@tanstack/react-query";

import { getConfig, type AppConfig } from "./config-server";

// React Query key for configuration
const CONFIG_QUERY_KEY = ["app-config"] as const;

/**
 * Hook to get application configuration
 * Uses React Query to cache the config and handle loading/error states
 */
export function useAppConfig() {
	return useQuery({
		queryKey: CONFIG_QUERY_KEY,
		queryFn: () => getConfig(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});
}

/**
 * Synchronous config access for cases where you know the config is already loaded
 * Use this only in components that are rendered after the config has been fetched
 */
export function useAppConfigValue(): AppConfig {
	const { data } = useAppConfig();
	if (!data) {
		throw new Error(
			"Config not loaded. Use useAppConfig() to handle loading state.",
		);
	}
	return data;
}

/**
 * Individual config value hooks for convenience
 */
export function useApiUrl() {
	const config = useAppConfigValue();
	return config.apiUrl;
}

export function useIsHosted() {
	const config = useAppConfigValue();
	return config.hosted;
}

export function useGithubUrl() {
	const config = useAppConfigValue();
	return config.githubUrl;
}

export function useDocsUrl() {
	const config = useAppConfigValue();
	return config.docsUrl;
}

export function usePosthogConfig() {
	const config = useAppConfigValue();
	return {
		key: config.posthogKey,
		host: config.posthogHost,
	};
}

export function useCrispId() {
	const config = useAppConfigValue();
	return config.crispId;
}

// Re-export types
export type { AppConfig };
