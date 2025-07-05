"use client";

import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-client";

export function useDashboardGuard() {
	const { useSession } = useAuth();
	const { data: session, isPending } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (isPending) {
			return;
		}
		const currentPath = window.location.pathname;
		const isDashboardRoute = currentPath.startsWith("/dashboard");

		if (isDashboardRoute && !session?.user) {
			router.navigate({
				to: "/login",
				search: { redirect: currentPath + window.location.search },
				replace: true,
			});
		}
	}, [session, isPending, router]);

	return {
		isAuthenticated: !!session?.user,
		isLoading: isPending,
		user: session?.user,
	};
}
