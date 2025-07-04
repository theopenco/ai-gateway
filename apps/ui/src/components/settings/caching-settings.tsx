import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/lib/components/button";
import { Checkbox } from "@/lib/components/checkbox";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { Separator } from "@/lib/components/separator";
import { useToast } from "@/lib/components/use-toast";
import { useDashboardContext } from "@/lib/dashboard-context";
import { useApi } from "@/lib/fetch-client";

export function CachingSettings() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { selectedProject, selectedOrganization } = useDashboardContext();

	const api = useApi();
	const updateProject = api.useMutation("patch", "/projects/{id}", {
		onSuccess: (data) => {
			if (selectedOrganization) {
				const queryKey = api.queryOptions("get", "/orgs/{id}/projects", {
					params: { path: { id: data.project.organizationId } },
				}).queryKey;
				queryClient.invalidateQueries({ queryKey });
			}
		},
	});

	const [cachingEnabled, setCachingEnabled] = useState(
		selectedProject?.cachingEnabled || false,
	);
	const [cacheDurationSeconds, setCacheDurationSeconds] = useState(
		selectedProject?.cacheDurationSeconds || 60,
	);

	if (!selectedProject) {
		return (
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Request Caching</h3>
				<p className="text-muted-foreground text-sm">
					Please select a project to configure caching settings.
				</p>
			</div>
		);
	}

	const handleSave = async () => {
		try {
			await updateProject.mutateAsync({
				params: { path: { id: selectedProject.id } },
				body: {
					cachingEnabled,
					cacheDurationSeconds,
				},
			});

			toast({
				title: "Settings saved",
				description: "Your caching settings have been updated.",
			});
		} catch {
			toast({
				title: "Error",
				description: "Failed to save caching settings.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-medium">Request Caching</h3>
				<p className="text-muted-foreground text-sm">
					Configure caching for identical LLM requests
				</p>
				{selectedProject && (
					<p className="text-muted-foreground text-sm mt-1">
						Project: {selectedProject.name}
					</p>
				)}
			</div>

			<Separator />

			<div className="flex items-center space-x-2">
				<Checkbox
					id="caching-enabled"
					checked={cachingEnabled}
					onCheckedChange={(checked) => setCachingEnabled(checked === true)}
				/>
				<Label htmlFor="caching-enabled">Enable request caching</Label>
			</div>

			<div className="space-y-2">
				<Label htmlFor="cache-duration">Cache Duration (seconds)</Label>
				<div className="flex space-x-2">
					<Input
						id="cache-duration"
						type="number"
						min={10}
						max={31536000}
						value={cacheDurationSeconds}
						onChange={(e) =>
							setCacheDurationSeconds(parseInt(e.target.value, 10))
						}
						disabled={!cachingEnabled}
						className="w-32"
					/>
					<p className="text-muted-foreground text-sm self-center">
						(Min: 10, Max: 31,536,000 — one year)
						<br />
						Note: changing this setting may take up to 5 minutes to take effect.
					</p>
				</div>
			</div>

			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={updateProject.isPending}>
					{updateProject.isPending ? "Saving..." : "Save Settings"}
				</Button>
			</div>
		</div>
	);
}
