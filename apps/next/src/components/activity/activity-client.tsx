"use client";

import { RecentLogs } from "@/components/activity/recent-logs";

interface ActivityClientProps {
	initialLogsData?: any;
}

export function ActivityClient({ initialLogsData }: ActivityClientProps) {
	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between space-y-2">
					<h2 className="text-3xl font-bold tracking-tight">Activity</h2>
				</div>
				<div className="space-y-4">
					<RecentLogs initialData={initialLogsData} />
				</div>
			</div>
		</div>
	);
}
