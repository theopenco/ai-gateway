import { addDays, format, parseISO, subDays } from "date-fns";
import { useState } from "react";
import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	CartesianGrid,
} from "recharts";

import { Button } from "@/lib/components/button";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useApi } from "@/lib/fetch-client";

export function ErrorRateChart() {
	const [days, setDays] = useState<7 | 30>(7);
	const { selectedProject } = useDashboardContext();

	const $api = useApi();
	const { data, isLoading, error } = $api.useQuery(
		"get",
		"/activity",
		{
			params: {
				query: {
					days: String(days),
					...(selectedProject?.id ? { projectId: selectedProject.id } : {}),
				},
			},
		},
		{
			enabled: !!selectedProject?.id,
		},
	);

	if (!selectedProject) {
		return (
			<div className="flex h-[350px] items-center justify-center">
				<p className="text-muted-foreground">
					Please select a project to view error rate data
				</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex h-[350px] items-center justify-center">
				Loading error rate data...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-[350px] items-center justify-center">
				<p className="text-destructive">Error loading activity data</p>
			</div>
		);
	}

	if (!data || data.activity.length === 0) {
		return (
			<div className="flex h-[350px] items-center justify-center">
				<p className="text-muted-foreground">
					No error rate data available
					{selectedProject && (
						<span className="block mt-1 text-sm">
							Project: {selectedProject.name}
						</span>
					)}
				</p>
			</div>
		);
	}

	const today = new Date();
	const startDate = subDays(today, days - 1);
	const dateRange: string[] = [];

	for (let i = 0; i < days; i++) {
		const date = addDays(startDate, i);
		dateRange.push(format(date, "yyyy-MM-dd"));
	}

	const dataByDate = new Map(data.activity.map((item) => [item.date, item]));

	const chartData = dateRange.map((date) => {
		if (dataByDate.has(date)) {
			const dayData = dataByDate.get(date)!;
			return {
				date,
				formattedDate: format(parseISO(date), "MMM d"),
				errorRate: dayData.errorRate,
			};
		}
		return {
			date,
			formattedDate: format(parseISO(date), "MMM d"),
			errorRate: 0,
		};
	});

	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-end space-x-2 mb-4">
				<Button
					variant={days === 7 ? "default" : "outline"}
					size="sm"
					onClick={() => setDays(7)}
				>
					7 Days
				</Button>
				<Button
					variant={days === 30 ? "default" : "outline"}
					size="sm"
					onClick={() => setDays(30)}
				>
					30 Days
				</Button>
			</div>
			<ResponsiveContainer width="100%" height={350}>
				<LineChart
					data={chartData}
					margin={{
						top: 5,
						right: 10,
						left: 10,
						bottom: 0,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<XAxis
						dataKey="date"
						tickFormatter={(value) => format(parseISO(value), "MMM d")}
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke="#888888"
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => `${value.toFixed(1)}%`}
					/>
					<Tooltip
						formatter={(value) => [
							`${Number(value).toFixed(2)}%`,
							"Error Rate",
						]}
						labelFormatter={(label) => format(parseISO(label), "MMM d, yyyy")}
					/>
					<Line
						type="monotone"
						dataKey="errorRate"
						stroke="currentColor"
						className="stroke-destructive"
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
