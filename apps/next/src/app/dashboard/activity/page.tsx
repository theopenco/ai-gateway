import { ActivityClient } from "@/components/activity/activity-client";
import { fetchServerData } from "@/lib/server-api";

export default async function ActivityPage() {
	// Server-side data fetching for logs
	const initialLogsData = await fetchServerData("GET", "/logs", {
		params: {
			query: {
				orderBy: "createdAt_desc",
			},
		},
	});

	return <ActivityClient initialLogsData={initialLogsData} />;
}
