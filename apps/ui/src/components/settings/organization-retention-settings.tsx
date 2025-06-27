import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/lib/components/button";
import { Label } from "@/lib/components/label";
import { RadioGroup, RadioGroupItem } from "@/lib/components/radio-group";
import { Separator } from "@/lib/components/separator";
import { useToast } from "@/lib/components/use-toast";
import { useDashboardContext } from "@/lib/dashboard-context";
import { $api } from "@/lib/fetch-client";

export function OrganizationRetentionSettings() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { selectedOrganization } = useDashboardContext();

	const updateOrganization = $api.useMutation("patch", "/orgs/{id}", {
		onSuccess: () => {
			const queryKey = $api.queryOptions("get", "/orgs").queryKey;
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const [retentionLevel, setRetentionLevel] = useState<"retain" | "none">(
		selectedOrganization?.retentionLevel || "retain",
	);

	if (!selectedOrganization) {
		return (
			<div className="space-y-2">
				<h3 className="text-lg font-medium">Data Retention</h3>
				<p className="text-muted-foreground text-sm">
					Please select an organization to configure data retention settings.
				</p>
			</div>
		);
	}

	const handleSave = async () => {
		try {
			await updateOrganization.mutateAsync({
				params: { path: { id: selectedOrganization.id } },
				body: { retentionLevel },
			});

			toast({
				title: "Settings saved",
				description: "Your data retention settings have been updated.",
			});
		} catch {
			toast({
				title: "Error",
				description: "Failed to save data retention settings.",
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-medium">Data Retention</h3>
				<p className="text-muted-foreground text-sm">
					Configure how request payloads and AI responses are stored
				</p>
				{selectedOrganization && (
					<p className="text-muted-foreground text-sm mt-1">
						Organization: {selectedOrganization.name}
					</p>
				)}
			</div>

			<Separator />

			<div className="space-y-4">
				<RadioGroup
					value={retentionLevel}
					onValueChange={(value: "retain" | "none") => setRetentionLevel(value)}
					className="space-y-2"
				>
					{[
						{
							id: "retain",
							label: "Retain All Data",
							desc: "Save request payloads and AI responses along with metadata",
						},
						{
							id: "none",
							label: "Metadata Only",
							desc: "Save only metadata, pricing, and usage data (exclude request payloads and responses)",
						},
					].map(({ id, label, desc }) => (
						<div key={id} className="flex items-start space-x-2">
							<RadioGroupItem value={id} id={id} />
							<div className="space-y-1 flex-1">
								<Label htmlFor={id} className="font-medium">
									{label}
								</Label>
								<p className="text-sm text-muted-foreground">{desc}</p>
							</div>
						</div>
					))}
				</RadioGroup>
			</div>

			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={updateOrganization.isPending}>
					{updateOrganization.isPending ? "Saving..." : "Save Settings"}
				</Button>
			</div>
		</div>
	);
}
