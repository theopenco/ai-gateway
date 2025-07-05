import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	ArrowUpRight,
	CreditCard,
	Key,
	KeyRound,
	Plus,
	Zap,
	Activity,
} from "lucide-react";
import { useEffect, useState } from "react";

import { TopUpCreditsButton } from "@/components/credits/top-up-credits-dialog";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { Overview } from "@/components/dashboard/overview";
import { UpgradeToProDialog } from "@/components/shared/upgrade-to-pro-dialog";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { Tabs, TabsList, TabsTrigger } from "@/lib/components/tabs";
import { useAppConfigValue } from "@/lib/config";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useApi } from "@/lib/fetch-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/_layout/")({
	component: Dashboard,
	pendingComponent: () => <DashboardLoading />,
	errorComponent: ({ error }) => <div>{error.message}</div>,
});

export default function Dashboard() {
	const config = useAppConfigValue();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [days, setDays] = useState<7 | 30>(7);
	const { selectedOrganization, selectedProject } = useDashboardContext();
	const api = useApi();

	// Only fetch activity data if we have a selected project
	const { data, isLoading } = api.useQuery(
		"get",
		"/activity",
		{
			params: {
				query: {
					days: String(days),
					projectId: selectedProject?.id || "",
				},
			},
		},
		{
			enabled: !!selectedProject?.id,
		},
	);

	// Invalidate activity query when project changes
	useEffect(() => {
		if (selectedProject?.id) {
			const queryKey = api.queryOptions("get", "/activity", {
				params: {
					query: {
						days: String(days),
						projectId: selectedProject.id,
					},
				},
			}).queryKey;

			queryClient.invalidateQueries({ queryKey });
		}
	}, [selectedProject?.id, queryClient, days, api]);

	// Calculate total stats from activity data
	const activityData = data?.activity || [];
	const totalRequests =
		activityData.reduce((sum, day) => sum + day.requestCount, 0) || 0;
	const totalTokens =
		activityData.reduce((sum, day) => sum + day.totalTokens, 0) || 0;
	const totalCost = activityData.reduce((sum, day) => sum + day.cost, 0) || 0;
	const totalInputCost =
		activityData.reduce((sum, day) => sum + day.inputCost, 0) || 0;
	const totalOutputCost =
		activityData.reduce((sum, day) => sum + day.outputCost, 0) || 0;
	const totalRequestCost =
		activityData.reduce((sum, day) => sum + day.requestCost, 0) || 0;

	// Format tokens for display (k for thousands, M for millions)
	const formatTokens = (tokens: number) => {
		if (tokens >= 1_000_000) {
			return `${(tokens / 1_000_000).toFixed(1)}M`;
		}
		if (tokens >= 1_000) {
			return `${(tokens / 1_000).toFixed(1)}k`;
		}
		return tokens.toString();
	};

	const hasActivity =
		activityData.length > 0 &&
		totalRequests > 0 &&
		selectedOrganization?.credits;

	// Determine if we're still loading organization data
	const isOrganizationLoading = !selectedOrganization;

	const shouldShowGetStartedState =
		!isLoading &&
		!isOrganizationLoading &&
		selectedOrganization &&
		selectedOrganization.credits === "0" &&
		selectedOrganization.plan !== "pro";

	// Show loading state while we're determining which UI to show
	const isInitialLoading = isOrganizationLoading;

	// Show loading state while determining which UI to render
	if (isInitialLoading) {
		return (
			<div className="flex flex-col">
				<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
					<div className="flex flex-col md:flex-row items-center justify-between space-y-2">
						<div>
							<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
							<div className="h-5 w-48 bg-muted animate-pulse rounded mt-1" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{Array.from({ length: 4 }).map((_, i) => (
								<Card key={i}>
									<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
										<div className="h-4 w-24 bg-muted animate-pulse rounded" />
										<div className="h-4 w-4 bg-muted animate-pulse rounded" />
									</CardHeader>
									<CardContent>
										<div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
										<div className="h-3 w-16 bg-muted animate-pulse rounded" />
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex flex-col md:flex-row items-center justify-between space-y-2">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
						{selectedProject && (
							<p className="text-sm text-muted-foreground mt-1">
								Project: {selectedProject.name}
								{selectedOrganization && (
									<span className="ml-2">
										• Organization: {selectedOrganization.name}
									</span>
								)}
							</p>
						)}
					</div>
					{hasActivity && (
						<div className="flex items-center space-x-2">
							{selectedOrganization && <TopUpCreditsButton />}
							<Button asChild>
								<Link to="/dashboard/provider-keys">
									<Plus className="mr-2 h-4 w-4" />
									Add Provider
								</Link>
							</Button>
						</div>
					)}
				</div>

				{hasActivity && (
					<Tabs
						defaultValue="7days"
						onValueChange={(value) => setDays(value === "7days" ? 7 : 30)}
						className="mb-2"
					>
						<TabsList>
							<TabsTrigger value="7days">Last 7 Days</TabsTrigger>
							<TabsTrigger value="30days">Last 30 Days</TabsTrigger>
						</TabsList>
					</Tabs>
				)}

				<div className="space-y-4">
					{shouldShowGetStartedState && (
						<div className="flex flex-col gap-3 py-12">
							<div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
								<CreditCard className="w-8 h-8 text-muted-foreground" />
							</div>
							<h3 className="text-xl font-semibold">
								You have no credits yet.
							</h3>
							<p className="text-muted-foreground max-w-md">
								Add credits to your organization to start making API requests
								and track your LLM usage.
							</p>

							<div className="flex flex-col sm:flex-row gap-3">
								<TopUpCreditsButton />
								<UpgradeToProDialog>
									<Button variant="outline">
										<Key className="mr-2 h-4 w-4" />
										Bring Your Own Keys
									</Button>
								</UpgradeToProDialog>
							</div>
						</div>
					)}

					<div
						className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", {
							"pointer-events-none opacity-20": shouldShowGetStartedState,
						})}
					>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Organization Credits
								</CardTitle>
								<CreditCard className="text-muted-foreground h-4 w-4" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold truncate overflow-ellipsis">
									$
									{selectedOrganization
										? Number(selectedOrganization.credits).toFixed(8)
										: "0.00"}
								</div>
								<p className="text-muted-foreground text-xs">
									Available balance
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Requests
								</CardTitle>
								<Zap className="text-muted-foreground h-4 w-4" />
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<>
										<div className="text-2xl font-bold">Loading...</div>
										<p className="text-muted-foreground text-xs">–</p>
									</>
								) : (
									<>
										<div className="text-2xl font-bold">
											{totalRequests.toLocaleString()}
										</div>
										<p className="text-muted-foreground text-xs">
											Last {days} days
											{activityData.length > 0 && (
												<span className="ml-1">
													•{" "}
													{(
														activityData.reduce(
															(sum, day) => sum + day.cacheRate,
															0,
														) / activityData.length
													).toFixed(1)}
													% cached
												</span>
											)}
										</p>
									</>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Tokens Used
								</CardTitle>
								<Activity className="text-muted-foreground h-4 w-4" />
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<>
										<div className="text-2xl font-bold">Loading...</div>
										<p className="text-muted-foreground text-xs">–</p>
									</>
								) : (
									<>
										<div className="text-2xl font-bold">
											{formatTokens(totalTokens)}
										</div>
										<p className="text-muted-foreground text-xs">
											Last {days} days
										</p>
									</>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Cost Estimate
								</CardTitle>
								<AlertCircle className="text-muted-foreground h-4 w-4" />
							</CardHeader>
							<CardContent>
								{isLoading ? (
									<>
										<div className="text-2xl font-bold">Loading...</div>
										<p className="text-muted-foreground text-xs">–</p>
									</>
								) : (
									<>
										<div className="text-2xl font-bold">
											${totalCost.toFixed(2)}
										</div>
										<p className="text-muted-foreground text-xs">
											<span>${totalInputCost.toFixed(2)} input</span>
											&nbsp;+&nbsp;
											<span>${totalOutputCost.toFixed(2)} output</span>
											{totalRequestCost > 0 && (
												<>
													&nbsp;+&nbsp;
													<span>${totalRequestCost.toFixed(2)} requests</span>
												</>
											)}
										</p>
									</>
								)}
							</CardContent>
						</Card>
					</div>
					<div
						className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-7", {
							"pointer-events-none opacity-20": shouldShowGetStartedState,
						})}
					>
						<Card className="col-span-4">
							<CardHeader>
								<CardTitle>Usage Overview</CardTitle>
								<CardDescription>
									Total Requests
									{selectedProject && (
										<span className="block mt-1 text-sm">
											Filtered by project: {selectedProject.name}
										</span>
									)}
								</CardDescription>
							</CardHeader>
							<CardContent className="pl-2">
								<Overview
									data={activityData}
									isLoading={isLoading}
									days={days}
								/>
							</CardContent>
						</Card>
						<Card className="col-span-3">
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
								<CardDescription>
									Common tasks you might want to perform
								</CardDescription>
							</CardHeader>
							<CardContent className="grid gap-2">
								<Button
									variant="outline"
									className="justify-start"
									onClick={() => navigate({ to: "/dashboard/api-keys" })}
									disabled={!selectedProject}
								>
									<Key className="mr-2 h-4 w-4" />
									Generate API Key
									{!selectedProject && (
										<span className="ml-auto text-xs text-muted-foreground">
											Select project
										</span>
									)}
								</Button>
								<Button
									variant="outline"
									className="justify-start"
									onClick={() => navigate({ to: "/dashboard/provider-keys" })}
									disabled={!selectedOrganization}
								>
									<KeyRound className="mr-2 h-4 w-4" />
									Add Provider Key
									{!selectedOrganization && (
										<span className="ml-auto text-xs text-muted-foreground">
											Select org
										</span>
									)}
								</Button>
								<Button
									variant="outline"
									className="justify-start"
									onClick={() => navigate({ to: "/dashboard/models" })}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Provider
								</Button>
								<Button variant="outline" className="justify-start" asChild>
									<a href={config.docsUrl} target="_blank">
										<ArrowUpRight className="mr-2 h-4 w-4" />
										View Documentation
									</a>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
