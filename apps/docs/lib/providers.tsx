"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

import { useConfig } from "./context";

import type { ReactNode } from "react";

export function PostHogProvider({ children }: { children: ReactNode }) {
	const config = useConfig();

	useEffect(() => {
		if (config.isLoaded && config.posthogKey && !config.hasError) {
			posthog.init(config.posthogKey, {
				api_host: config.posthogHost,
				defaults: "2025-05-24",
				capture_pageview: "history_change",
				autocapture: true,
				loaded: (ph) => {
					ph.register({
						app_section: "docs",
					});
				},
			});
		}
	}, [config.isLoaded, config.posthogKey, config.posthogHost, config.hasError]);

	// Don't render the provider if config is not loaded yet or has an error
	if (!config.isLoaded || config.hasError || !config.posthogKey) {
		return children;
	}

	return <PHProvider client={posthog}>{children}</PHProvider>;
}
