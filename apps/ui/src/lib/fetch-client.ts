import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import { getConfigSync } from "./config-utils";

import type { paths } from "./api/v1";

// Create a function to get the fetch client with dynamic config
function getFetchClient() {
	const config = getConfigSync();
	return createFetchClient<paths>({
		baseUrl: config.apiUrl,
		credentials: "include",
	});
}

// Create a proxy that dynamically gets the config
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

export const $api = createClient(fetchClient);
