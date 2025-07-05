"use client";

import { useRouter } from "@tanstack/react-router";
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import { useMemo } from "react";

import { useAuth } from "@/lib/auth-client";
import { Route } from "@/routes/__root";

import type { paths } from "./api/v1";

// React hook to get the fetch client
export function useFetchClient() {
	const config = Route.useLoaderData();
	const router = useRouter();
	const { signOut } = useAuth();

	return useMemo(() => {
		const client = createFetchClient<paths>({
			baseUrl: config.apiUrl,
			credentials: "include",
		});

		// Adding a response interceptor to handle 401 errors globally
		client.use({
			async onResponse({ response }) {
				if (response.status === 401) {
					// Defining the  public routes that don't require authentication
					const publicRoutes = [
						"/",
						"/login",
						"/signup",
						"/docs",
						"/pricing",
						// Add any other public routes here
					];

					// Get current path
					const currentPath = window.location.pathname;

					// Check if current route is public
					const isPublicRoute = publicRoutes.some(
						(route) =>
							currentPath === route || currentPath.startsWith(route + "/"),
					);

					// Only redirect to login if we're on a protected route
					if (!isPublicRoute) {
						// Clear auth state
						try {
							await signOut();
						} catch (error) {
							console.error("Error signing out:", error);
						}

						// Get current path for redirect
						const currentPathWithSearch =
							window.location.pathname + window.location.search;

						// Redirect to login with current path as redirect parameter
						router.navigate({
							to: "/login",
							search: { redirect: currentPathWithSearch },
							replace: true,
						});

						// Prevent the response from being processed further
						return new Response(
							JSON.stringify({
								error: "Unauthorized - redirecting to login",
							}),
							{
								status: 401,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
				}

				return response;
			},
		});

		return client;
	}, [config.apiUrl, router, signOut]);
}

// React hook to get the API client
export function useApi() {
	const fetchClient = useFetchClient();

	return useMemo(() => {
		return createClient(fetchClient);
	}, [fetchClient]);
}
