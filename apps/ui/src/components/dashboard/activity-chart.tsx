import { addDays, format, parseISO, subDays } from "date-fns";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/lib/components/select";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useApi } from "@/lib/fetch-client";

import type { ActivityModelUsage, DailyActivity } from "@/types/activity";
import type { TooltipProps } from "recharts";

// Helper function to get all unique models from the data
function getUniqueModels(data: any[]): string[] {
	if (!data || data.length === 0) {
		return [];
	}

	const allModels = new Set<string>();
	data.forEach((day) => {
		if (day.modelBreakdown && day.modelBreakdown.length > 0) {
			day.modelBreakdown.forEach((model: any) => {
				allModels.add(model.model);
			});
		}
	});

	return Array.from(allModels);
}

// Helper function to generate colors for each model
function getModelColor(model: string, index: number): string {
	// Define a set of colors for the bars
	const colors = [
		"#4f46e5", // indigo
		"#0ea5e9", // sky
		"#10b981", // emerald
		"#f59e0b", // amber
		"#ef4444", // red
		"#8b5cf6", // violet
		"#ec4899", // pink
		"#06b6d4", // cyan
		"#84cc16", // lime
		"#f97316", // orange
	];

	// Use modulo to cycle through colors if there are more models than colors
	return colors[index % colors.length];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
	active?: boolean;
	payload?: any[];
	label?: string;
	breakdownField?: "requests" | "cost" | "tokens";
}

const CustomTooltip = ({
	active,
	payload,
	label,
	breakdownField = "requests",
}: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="rounded-lg border bg-popover text-popover-foreground p-2 shadow-sm">
				<p className="font-medium">
					{label && format(parseISO(label), "MMM d, yyyy")}
				</p>
				<p className="text-sm">
					<span className="font-medium">{data.requestCount}</span> requests
				</p>
				<p className="text-sm">
					<span className="font-medium">
						{data.totalTokens.toLocaleString()}
					</span>{" "}
					tokens
				</p>
				<p className="text-sm">
					<span className="font-medium">${data.cost.toFixed(4)}</span> estimated
					cost
				</p>
				{payload.length > 1 && (
					<div className="mt-2 pt-2 border-t">
						<p className="text-sm font-medium">Model Breakdown:</p>
						{payload.map((entry, index) => {
							// Skip the entry if it's not a model (e.g., it's the total requestCount)
							if (entry.dataKey === "requestCount") {
								return null;
							}

							// Calculate percentage based on the selected breakdown field
							let total = data.requestCount;
							if (breakdownField === "cost") {
								total = data.cost;
							} else if (breakdownField === "tokens") {
								total = data.totalTokens;
							}
							const percentage =
								entry.value && total
									? Math.round((entry.value / total) * 100)
									: 0;

							return (
								<p key={index} className="text-xs">
									<span
										className="inline-block w-3 h-3 mr-1"
										style={{ backgroundColor: entry.color }}
									/>
									{entry.name}:{" "}
									{breakdownField === "cost"
										? `$${Number(entry.value).toFixed(4)}`
										: entry.value}{" "}
									{breakdownField === "tokens"
										? "tokens"
										: breakdownField === "cost"
											? ""
											: "requests"}{" "}
									({percentage}%)
								</p>
							);
						})}
					</div>
				)}
			</div>
		);
	}

	return null;
};

export function ActivityChart() {
	const [days, setDays] = useState<7 | 30>(7);
	const [breakdownField, setBreakdownField] = useState<
		"requests" | "cost" | "tokens"
	>("requests");
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
			<Card>
				<CardHeader>
					<CardTitle>Model Usage Overview</CardTitle>
					<CardDescription>
						Please select a project to view activity data
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[350px] items-center justify-center">
						<p className="text-muted-foreground">No project selected</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Model Usage Overview</CardTitle>
					<CardDescription>
						Stacked model {breakdownField} over the last {days} days
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[350px] items-center justify-center">
						Loading activity data...
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Model Usage Overview</CardTitle>
					<CardDescription>
						Stacked model {breakdownField} over the last {days} days
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[350px] items-center justify-center">
						<p className="text-destructive">Error loading activity data</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data || data.activity.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Model Usage Overview</CardTitle>
					<CardDescription>
						Stacked model {breakdownField} over the last {days} days
						{selectedProject && (
							<span className="block mt-1 text-sm">
								Project: {selectedProject.name}
							</span>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex h-[350px] items-center justify-center">
						<p className="text-muted-foreground">No activity data available</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Generate a complete date range for the selected period
	const today = new Date();
	const startDate = subDays(today, days - 1);
	const dateRange: string[] = [];

	// Create an array of all dates in the range
	for (let i = 0; i < days; i++) {
		const date = addDays(startDate, i);
		dateRange.push(format(date, "yyyy-MM-dd"));
	}

	// Create a map of existing data by date
	const dataByDate = new Map(data.activity.map((item) => [item.date, item]));

	// Fill in the chart data with all dates, using zero values for missing dates
	const chartData = dateRange.map((date) => {
		if (dataByDate.has(date)) {
			const dayData = dataByDate.get(date)!;

			// Process model breakdown data for stacked bars
			const result = {
				...dayData,
				formattedDate: format(parseISO(date), "MMM d"),
			} as DailyActivity & {
				[key: string]: number | string | ActivityModelUsage[];
			};

			// Add each model's selected metric as a separate property for stacking
			dayData.modelBreakdown.forEach((model) => {
				switch (breakdownField) {
					case "cost":
						result[model.model] = model.cost;
						break;
					case "tokens":
						result[model.model] = model.totalTokens;
						break;
					case "requests":
					default:
						result[model.model] = model.requestCount;
						break;
				}
			});

			return result;
		}
		return {
			date,
			formattedDate: format(parseISO(date), "MMM d"),
			requestCount: 0,
			inputTokens: 0,
			outputTokens: 0,
			totalTokens: 0,
			cost: 0,
			modelBreakdown: [],
		};
	});

	return (
		<Card>
			<CardHeader className="flex flex-col space-y-4 md:flex-row items-center justify-between pb-2">
				<div>
					<CardTitle>Model Usage Overview</CardTitle>
					<CardDescription>
						Stacked model {breakdownField} over the last {days} days
						{selectedProject && (
							<span className="block mt-1 text-sm">
								Project: {selectedProject.name}
							</span>
						)}
					</CardDescription>
				</div>
				<div className="flex items-center space-x-2">
					<Select
						value={breakdownField}
						onValueChange={(value) =>
							setBreakdownField(value as "requests" | "cost" | "tokens")
						}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Select metric" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="requests">Requests</SelectItem>
							<SelectItem value="cost">Cost</SelectItem>
							<SelectItem value="tokens">Tokens</SelectItem>
						</SelectContent>
					</Select>
					<div className="flex space-x-2">
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
				</div>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					<BarChart data={chartData}>
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
							tickFormatter={(value) => {
								if (breakdownField === "cost") {
									return `$${Number(value).toFixed(2)}`;
								}
								return `${value}`;
							}}
						/>
						<Tooltip
							content={<CustomTooltip breakdownField={breakdownField} />}
							cursor={{
								fill: "color-mix(in srgb, currentColor 15%, transparent)",
							}}
						/>
						<Legend />
						{/* Generate a Bar for each unique model in the dataset */}
						{getUniqueModels(data.activity).length > 0 ? (
							getUniqueModels(data.activity).map((model, index) => (
								<Bar
									key={model}
									dataKey={model}
									name={model}
									stackId="models"
									fill={getModelColor(model, index)}
									radius={
										index === getUniqueModels(data.activity).length - 1
											? [4, 4, 0, 0]
											: [0, 0, 0, 0]
									}
								/>
							))
						) : (
							<Bar
								dataKey="requestCount"
								name="Requests"
								fill="currentColor"
								radius={[4, 4, 0, 0]}
								className="fill-primary opacity-80 hover:opacity-100 transition-opacity"
							/>
						)}
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
