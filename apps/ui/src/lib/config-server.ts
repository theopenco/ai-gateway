import { createServerFn } from "@tanstack/react-start";

export interface AppConfig {
	hosted: boolean;
	apiUrl: string;
	githubUrl: string;
	docsUrl: string;
	posthogKey?: string;
	posthogHost?: string;
	crispId?: string;
}

export const getConfig = createServerFn({
	method: "GET",
}).handler((): AppConfig => {
	return {
		hosted: process.env.VITE_HOSTED === "true",
		apiUrl: process.env.VITE_API_URL || "http://localhost:4002",
		githubUrl:
			process.env.VITE_GITHUB_URL || "https://github.com/theopenco/llmgateway",
		docsUrl: process.env.VITE_DOCS_URL || "http://localhost:3005",
		posthogKey: process.env.VITE_POSTHOG_KEY,
		posthogHost: process.env.VITE_POSTHOG_HOST,
		crispId: process.env.VITE_CRISP_ID,
	};
});
