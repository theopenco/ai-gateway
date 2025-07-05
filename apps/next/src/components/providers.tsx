"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { PostHogProvider } from "posthog-js/react";
import { useMemo, useEffect } from "react";
import type { ReactNode } from "react";

import { getConfig } from "@/lib/config";
import { Toaster } from "@/lib/components/toaster";
import type { PostHogConfig } from "posthog-js";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						staleTime: 0,
						retry: false,
					},
				},
			}),
		[],
	);

	const config = getConfig();

	const posthogOptions: Partial<PostHogConfig> | undefined = {
		api_host: config.posthogHost,
		capture_pageview: "history_change",
		autocapture: true,
	};

	// Set up Crisp if configured
	useEffect(() => {
		if (config.crispId) {
			// Dynamically import Crisp to avoid SSR issues
			import("crisp-sdk-web").then(({ Crisp }) => {
				Crisp.configure(config.crispId!);
			});
		}
	}, [config.crispId]);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			storageKey="theme"
		>
			<QueryClientProvider client={queryClient}>
				{config.posthogKey ? (
					<PostHogProvider apiKey={config.posthogKey} options={posthogOptions}>
						{children}
					</PostHogProvider>
				) : (
					children
				)}
				{process.env.NODE_ENV === "development" && (
					<ReactQueryDevtools buttonPosition="bottom-right" />
				)}
			</QueryClientProvider>
			<Toaster />
		</ThemeProvider>
	);
}
