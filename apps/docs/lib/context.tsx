"use client";

import { createContext, useContext, useMemo } from "react";

import type { ReactNode } from "react";

// Define the shape of our PostHog configuration
interface EnvConfig {
	posthogKey: string;
	posthogHost: string;
	isLoaded: boolean;
	hasError: boolean;
}

// Create the context with a default value
const ConfigContext = createContext<EnvConfig>({
	posthogKey: "",
	posthogHost: "",
	isLoaded: false,
	hasError: false,
});

// Hook to use the PostHog config
export function usePostHogConfig() {
	return useContext(ConfigContext);
}

// Provider component that provides the PostHog config
export function ConfigProvider({
	children,
	posthogKey = "",
	posthogHost = "",
}: {
	children: ReactNode;
	posthogKey?: string;
	posthogHost?: string;
}) {
	const config = useMemo<EnvConfig>(
		() => ({
			posthogKey,
			posthogHost,
			isLoaded: true,
			hasError: false,
		}),
		[posthogKey, posthogHost],
	);

	return (
		<ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
	);
}
