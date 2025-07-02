"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Fetch environment variables from the server
		const fetchEnvVars = async () => {
			try {
				const response = await fetch("/api/env");
				const envVars = await response.json();

				posthog.init(envVars.posthogKey, {
					api_host: envVars.posthogHost,
					defaults: "2025-05-24",
					loaded: (ph) => {
						ph.register({
							app_section: "docs",
						});
					},
				});

				setIsInitialized(true);
			} catch (error) {
				console.error("Failed to fetch environment variables:", error);
			}
		};

		fetchEnvVars();
	}, []);

	if (!isInitialized) {
		return children;
	}

	return <PHProvider client={posthog}>{children}</PHProvider>;
}
