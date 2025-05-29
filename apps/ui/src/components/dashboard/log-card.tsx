import { formatDistanceToNow } from "date-fns";
import {
	AlertCircle,
	AudioWaveform,
	Ban,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Clock,
	Coins,
	Package,
	Zap,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import { useState } from "react";

import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/lib/components/tooltip";

import type { Log } from "@/lib/types";

export function LogCard({ log }: { log: Log }) {
	const [isExpanded, setIsExpanded] = useState(false);

	const formattedTime = formatDistanceToNow(new Date(log.createdAt), {
		addSuffix: true,
	});

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	// Format duration in ms to a readable format
	const formatDuration = (ms: number) => {
		if (ms < 1000) {
			return `${ms}ms`;
		}
		return `${(ms / 1000).toFixed(2)}s`;
	};

	// Determine status icon and color based on error status or unified finish reason
	let StatusIcon = CheckCircle2;
	let color = "text-green-500";
	let bgColor = "bg-green-100";

	if (log.hasError || log.unifiedFinishReason === "error") {
		StatusIcon = AlertCircle;
		color = "text-red-500";
		bgColor = "bg-red-100";
	} else if (log.unifiedFinishReason !== "completed") {
		StatusIcon = AlertCircle;
		color = "text-yellow-500";
		bgColor = "bg-yellow-100";
	}

	return (
		<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
			<div
				className={`flex items-start gap-4 p-4 ${isExpanded ? "border-b" : ""}`}
			>
				<div className={`mt-0.5 rounded-full p-1.5 ${bgColor}`}>
					<StatusIcon className={`h-5 w-5 ${color}`} />
				</div>
				<div className="flex-1 space-y-1">
					<div className="flex items-center justify-between">
						<p
							className={`font-medium ${isExpanded ? "line-clamp-2" : "line-clamp-1"}`}
						>
							{log.content || <i className="italic">empty response</i>}
						</p>
						<Badge
							variant={log.hasError ? "destructive" : "default"}
							className="ml-2"
						>
							{/* {log.unifiedFinishReason || log.finishReason} */}
							{log.finishReason}
						</Badge>
					</div>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Package className="h-3.5 w-3.5" />
							<span>{log.usedModel}</span>
						</div>
						<div className="flex items-center gap-1">
							<Zap className="h-3.5 w-3.5" />
							<span>{log.cached ? "Cached" : "Not cached"}</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							<span>{log.totalTokens} tokens</span>
						</div>
						<div className="flex items-center gap-1">
							<Clock className="h-3.5 w-3.5" />
							<span>{formatDuration(log.duration)}</span>
						</div>
						<div className="flex items-center gap-1">
							<Coins className="h-3.5 w-3.5" />
							<span>{log.cost ? `$${log.cost.toFixed(6)}` : "?"}</span>
						</div>
						<span className="ml-auto">{formattedTime}</span>
					</div>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={toggleExpand}
				>
					{isExpanded ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
					<span className="sr-only">Toggle details</span>
				</Button>
			</div>

			{isExpanded && (
				<div className="space-y-4 p-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Request Details</h4>
							<div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
								<div className="text-muted-foreground">Project ID</div>
								<div className="font-mono text-xs">{log.projectId}</div>
								<div className="text-muted-foreground">API Key</div>
								<div className="font-mono text-xs">{log.apiKeyId}</div>
								<div className="text-muted-foreground">Provider Key</div>
								<div className="font-mono text-xs">{log.providerKeyId}</div>
								<div className="text-muted-foreground">Requested Model</div>
								<div>{log.requestedModel}</div>
								<div className="text-muted-foreground">Used Model</div>
								<div>{log.usedModel}</div>
								<div className="text-muted-foreground">Provider</div>
								<div>{log.usedProvider}</div>
							</div>
						</div>
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Response Metrics</h4>
							<div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
								<div className="text-muted-foreground">Duration</div>
								<div>{formatDuration(log.duration)}</div>
								<div className="text-muted-foreground">Response Size</div>
								<div>
									{log.responseSize ? (
										<>
											{prettyBytes(log.responseSize)} ({log.responseSize} bytes)
										</>
									) : (
										"Unknown"
									)}
								</div>
								<div className="text-muted-foreground">Prompt Tokens</div>
								<div>{log.promptTokens}</div>
								<div className="text-muted-foreground">Completion Tokens</div>
								<div>{log.completionTokens}</div>
								<div className="text-muted-foreground">Total Tokens</div>
								<div className="font-medium">{log.totalTokens}</div>
								<div className="text-muted-foreground">
									Original Finish Reason
								</div>
								<div>{log.finishReason}</div>
								<div className="text-muted-foreground">
									Unified Finish Reason
								</div>
								<div>{log.unifiedFinishReason}</div>
								<div className="text-muted-foreground">Streamed</div>
								<div className="flex items-center gap-1">
									{log.streamed ? (
										<>
											<AudioWaveform className="h-3.5 w-3.5 text-green-500" />
											<span>Yes</span>
										</>
									) : (
										<span>No</span>
									)}
								</div>
								<div className="text-muted-foreground">Canceled</div>
								<div className="flex items-center gap-1">
									{log.canceled ? (
										<>
											<Ban className="h-3.5 w-3.5 text-amber-500" />
											<span>Yes</span>
										</>
									) : (
										<span>No</span>
									)}
								</div>
								<div className="text-muted-foreground">Cached</div>
								<div className="flex items-center gap-1">
									{log.cached ? (
										<>
											<Zap className="h-3.5 w-3.5 text-blue-500" />
											<span>Yes</span>
										</>
									) : (
										<span>No</span>
									)}
								</div>
							</div>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Cost Information</h4>
							<div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
								<div className="text-muted-foreground">Input Cost</div>
								<div>
									{log.inputCost ? `$${log.inputCost.toFixed(6)}` : "?"}
								</div>
								<div className="text-muted-foreground">Output Cost</div>
								<div>
									{log.outputCost ? `$${log.outputCost.toFixed(6)}` : "?"}
								</div>
								<div className="text-muted-foreground">Total Cost</div>
								<div className="font-medium">
									{log.cost ? `$${log.cost.toFixed(6)}` : "?"}
								</div>
							</div>
						</div>
						<div className="space-y-2">
							<h4 className="text-sm font-medium">Metadata</h4>
							<div className="grid grid-cols-2 gap-2 rounded-md border p-3 text-sm">
								<div className="text-muted-foreground">Project ID</div>
								<div className="font-mono text-xs">{log.projectId}</div>
								<div className="text-muted-foreground">Organization ID</div>
								<div className="font-mono text-xs">{log.organizationId}</div>
								<div className="text-muted-foreground">API Key ID</div>
								<div className="font-mono text-xs">{log.apiKeyId}</div>
								<div className="text-muted-foreground">Provider Key ID</div>
								<div className="font-mono text-xs">{log.providerKeyId}</div>
								<div className="text-muted-foreground">Mode</div>
								{/* <div>{log.mode || "api-keys"}</div> */}
								<div>api-keys</div>
								<div className="text-muted-foreground">Used Mode</div>
								<div>{log.usedModel || "api-keys"}</div>
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<h4 className="text-sm font-medium">Model Parameters</h4>
						<div className="grid gap-2 rounded-md border p-3 text-sm sm:grid-cols-2 md:grid-cols-4">
							<TooltipProvider>
								<div className="flex items-center justify-between gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="text-muted-foreground">Temperature</span>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												Controls randomness: higher values produce more random
												outputs
											</p>
										</TooltipContent>
									</Tooltip>
									<span>{log.temperature}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="text-muted-foreground">Max Tokens</span>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												Maximum number of tokens to generate
											</p>
										</TooltipContent>
									</Tooltip>
									<span>{log.maxTokens}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="text-muted-foreground">Top P</span>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												Alternative to temperature, controls diversity via
												nucleus sampling
											</p>
										</TooltipContent>
									</Tooltip>
									<span>{log.topP}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<span className="text-muted-foreground">
												Frequency Penalty
											</span>
										</TooltipTrigger>
										<TooltipContent>
											<p className="max-w-xs text-xs">
												Decreases the likelihood of repeating the same tokens
											</p>
										</TooltipContent>
									</Tooltip>
									<span>{log.frequencyPenalty}</span>
								</div>
							</TooltipProvider>
						</div>
					</div>
					{log.hasError && log.errorDetails && (
						<div className="space-y-2">
							<h4 className="text-sm font-medium text-red-600">
								Error Details
							</h4>
							<div className="grid grid-cols-2 gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm">
								<div className="text-red-600">Status Code</div>
								<div className="font-medium">{log.errorDetails.statusCode}</div>
								<div className="text-red-600">Status Text</div>
								<div className="font-medium">{log.errorDetails.statusText}</div>
								<div className="text-red-600 col-span-2">Error Message</div>
								<div className="col-span-2 rounded bg-white text-black p-2 text-xs">
									{log.errorDetails.responseText}
								</div>
							</div>
						</div>
					)}
					<div className="space-y-2">
						<h4 className="text-sm font-medium">Message Context</h4>
						<div className="rounded-md border p-3">
							<pre className="max-h-60 text-xs overflow-auto">
								{JSON.stringify(log.messages, null, 2)}
							</pre>
						</div>
					</div>
					<div className="space-y-2">
						<h4 className="text-sm font-medium">Response</h4>
						<div className="rounded-md border p-3">
							<pre className="max-h-60 text-xs text-wrap overflow-auto">
								{log.content}
							</pre>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
