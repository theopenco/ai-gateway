export const HOSTED = import.meta.env.VITE_HOSTED === "true";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4002";
export const GITHUB_URL =
	import.meta.env.VITE_GITHUB_URL || "https://github.com/theopenco/llmgateway";
export const DOCS_URL =
	import.meta.env.VITE_DOCS_URL || "http://localhost:3005";
export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;
export const CRISP_ID = import.meta.env.VITE_CRISP_ID;
