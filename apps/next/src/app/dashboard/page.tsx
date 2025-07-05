import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { fetchServerData } from "@/lib/server-api";
import type { ActivitT } from "@/types/activity";

export default async function Dashboard({
	searchParams,
}: {
	searchParams: Promise<{
		projectId?: string;
		days?: string;
	}>;
}) {
	const { projectId, days } = await searchParams;

	// Parse days parameter, default to 7 if not provided or invalid
	const daysParam = days === "30" ? "30" : "7";

	const initialActivityData = await fetchServerData<ActivitT>(
		"GET",
		"/activity",
		{
			params: {
				query: {
					days: daysParam,
					projectId,
				},
			},
		},
	);

	return (
		<DashboardClient initialActivityData={initialActivityData || undefined} />
	);
}
