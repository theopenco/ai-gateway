export interface AppConfig {
	hosted: boolean;
	apiUrl: string;
	githubUrl: string;
	docsUrl: string;
	posthogKey?: string;
	posthogHost?: string;
	crispId?: string;
}

export function getConfig(): AppConfig {
	return {
		hosted: process.env.NEXT_PUBLIC_HOSTED === "true",
		apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api",
		githubUrl:
			process.env.NEXT_PUBLIC_GITHUB_URL ||
			"https://github.com/theopenco/llmgateway",
		docsUrl: process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3005",
		posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
		posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		crispId: process.env.NEXT_PUBLIC_CRISP_ID,
	};
}

// Hook for client-side usage
export function useAppConfig(): AppConfig {
	return getConfig();
}
