import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { useMemo } from "react";

import { getConfigSync } from "./config-utils";
import { Route } from "@/routes/__root";

import type { paths } from "./api/v1";

// Create a function to get the fetch client with dynamic config
function getFetchClient() {
	const config = getConfigSync();
	return createFetchClient<paths>({
		baseUrl: config.apiUrl,
		credentials: "include",
	});
}

// Create a proxy that dynamically gets the config (for backward compatibility)
const fetchClient = new Proxy(
	{} as ReturnType<typeof createFetchClient<paths>>,
	{
		get(target, prop) {
			const client = getFetchClient();
			const value = (client as any)[prop];
			return typeof value === "function" ? value.bind(client) : value;
		},
	},
);

// For backward compatibility
export const $api = createClient(fetchClient);

// React hook to get the fetch client
export function useFetchClient() {
	const config = Route.useLoaderData();

	return useMemo(() => {
		return createFetchClient<paths>({
			baseUrl: config.apiUrl,
			credentials: "include",
		});
	}, [config.apiUrl]);
}

// React hook to get the API client
export function useApi() {
	const fetchClient = useFetchClient();

	return useMemo(() => {
		return createClient(fetchClient);
	}, [fetchClient]);
}
