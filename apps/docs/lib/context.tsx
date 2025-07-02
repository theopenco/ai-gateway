"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

// Provider component that fetches and provides the PostHog config
export function ConfigProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<EnvConfig>({
		posthogKey: "",
		posthogHost: "",
		isLoaded: false,
		hasError: false,
	});

	useEffect(() => {
		// Fetch environment variables from the server
		const fetchEnvVars = async () => {
			try {
				const response = await fetch("/api/env");
				const envVars = await response.json();

				setConfig({
					posthogKey: envVars.posthogKey,
					posthogHost: envVars.posthogHost,
					isLoaded: true,
					hasError: false,
				});
			} catch (error) {
				console.error("Failed to fetch environment variables:", error);
				setConfig({
					posthogKey: "",
					posthogHost: "",
					isLoaded: true,
					hasError: true,
				});
			}
		};

		fetchEnvVars();
	}, []);

	return (
		<ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
	);
}
