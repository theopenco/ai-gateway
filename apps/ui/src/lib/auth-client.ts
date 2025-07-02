import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useMemo } from "react";

import { getConfigSync } from "./config-utils";
import { Route } from "@/routes/__root";

// Create a function to get auth client with dynamic config
function getAuthClient() {
	const config = getConfigSync();
	return createAuthClient({
		baseURL: config.apiUrl + "/auth",
		plugins: [passkeyClient()],
	});
}

// For backward compatibility
export const authClient = getAuthClient();

// React hook to get the auth client
export function useAuthClient() {
	const config = Route.useLoaderData();

	return useMemo(() => {
		return createAuthClient({
			baseURL: config.apiUrl + "/auth",
			plugins: [passkeyClient()],
		});
	}, [config.apiUrl]);
}

// Export commonly used methods for convenience (for backward compatibility)
export const { signIn, signUp, signOut, useSession, getSession } =
	getAuthClient();

// React hook for auth methods
export function useAuth() {
	const authClient = useAuthClient();

	return {
		signIn: authClient.signIn,
		signUp: authClient.signUp,
		signOut: authClient.signOut,
		useSession: authClient.useSession,
		getSession: authClient.getSession,
	};
}
