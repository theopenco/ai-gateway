import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getConfigSync } from "./config-utils";

// Create a function to get auth client with dynamic config
function getAuthClient() {
	const config = getConfigSync();
	return createAuthClient({
		baseURL: config.apiUrl + "/auth",
		plugins: [passkeyClient()],
	});
}

// Create a proxy that dynamically gets the config
export const authClient = new Proxy({} as ReturnType<typeof createAuthClient>, {
	get(target, prop) {
		const client = getAuthClient();
		const value = (client as any)[prop];
		return typeof value === "function" ? value.bind(client) : value;
	},
});

// Export commonly used methods for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
