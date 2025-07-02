import { providers, type ProviderId } from "@llmgateway/models";
import { useQueryClient } from "@tanstack/react-query";
import { KeyIcon, MoreHorizontal } from "lucide-react";

import { CreateProviderKeyDialog } from "./create-provider-key-dialog";
import { providerLogoComponents } from "@/components/provider-keys/provider-logo";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/lib/components/alert-dialog";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/lib/components/dropdown-menu";
import { toast } from "@/lib/components/use-toast";
import { $api } from "@/lib/fetch-client";

import type { Organization } from "@/lib/types";

interface ProviderKeysListProps {
	selectedOrganization: Organization | null;
}

export function ProviderKeysList({
	selectedOrganization,
}: ProviderKeysListProps) {
	const queryClient = useQueryClient();

	// Show message if no organization is selected
	if (!selectedOrganization) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
				<div className="mb-4">
					<KeyIcon className="h-10 w-10 text-gray-500" />
				</div>
				<p className="text-gray-400 mb-6">
					Please select an organization to view provider keys.
				</p>
			</div>
		);
	}

	const { data } = $api.useSuspenseQuery("get", "/keys/provider");
	const deleteMutation = $api.useMutation("delete", "/keys/provider/{id}");
	const toggleMutation = $api.useMutation("patch", "/keys/provider/{id}");

	const queryKey = $api.queryOptions("get", "/keys/provider").queryKey;

	// Filter provider keys by selected organization
	const organizationKeys =
		data?.providerKeys
			.filter((key) => key.status !== "deleted")
			.filter((key) => key.organizationId === selectedOrganization.id) || [];

	// Create a map of existing keys by provider
	const existingKeysMap = new Map(
		organizationKeys.map((key) => [key.provider, key]),
	);

	// Filter out LLM Gateway from the providers list
	const availableProviders = providers.filter(
		(provider) => provider.id !== "llmgateway",
	);

	const deleteKey = (id: string) => {
		deleteMutation.mutate(
			{ params: { path: { id } } },
			{
				onSuccess: () => {
					toast({ title: "Deleted", description: "Provider key removed" });
					void queryClient.invalidateQueries({ queryKey });
				},
				onError: () =>
					toast({
						title: "Error",
						description: "Failed to delete key",
						variant: "destructive",
					}),
			},
		);
	};

	const toggleStatus = (
		id: string,
		currentStatus: "active" | "inactive" | "deleted" | null,
	) => {
		const newStatus = currentStatus === "active" ? "inactive" : "active";

		toggleMutation.mutate(
			{
				params: { path: { id } },
				body: { status: newStatus },
			},
			{
				onSuccess: () => {
					toast({
						title: "Status Updated",
						description: `Provider key marked as ${newStatus}`,
					});
					queryClient.invalidateQueries({ queryKey });
				},
				onError: () =>
					toast({
						title: "Error",
						description: "Failed to update status",
						variant: "destructive",
					}),
			},
		);
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-2xl font-semibold tracking-tight">Integrations</h2>
				<p className="text-muted-foreground">
					Use your own provider API keys to access AI Gateway with automatic
					fallback.
				</p>
			</div>

			<div className="space-y-2">
				{availableProviders.map((provider) => {
					const Logo = providerLogoComponents[provider.id as ProviderId];
					const existingKey = existingKeysMap.get(provider.id);
					const hasKey = !!existingKey;

					return (
						<div
							key={provider.id}
							className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
						>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border">
									{Logo ? (
										<Logo className="h-6 w-6" />
									) : (
										<div className="w-6 h-6 bg-muted rounded" />
									)}
								</div>
								<div className="flex flex-col">
									<span className="font-medium">{provider.name}</span>
									{hasKey && (
										<div className="flex items-center gap-2 mt-1">
											<Badge
												variant={
													existingKey.status === "active"
														? "default"
														: "secondary"
												}
												className="text-xs"
											>
												{existingKey.status}
											</Badge>
											<span className="text-xs text-muted-foreground font-mono">
												{existingKey.maskedToken}
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="flex items-center gap-2">
								{hasKey ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">Open menu</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem
												onClick={() =>
													toggleStatus(existingKey.id, existingKey.status)
												}
											>
												{existingKey.status === "active"
													? "Deactivate"
													: "Activate"}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<DropdownMenuItem
														onSelect={(e) => e.preventDefault()}
														className="text-destructive focus:text-destructive"
													>
														Delete
													</DropdownMenuItem>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>
															Are you absolutely sure?
														</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will
															permanently delete the provider key and any
															applications using it will no longer be able to
															access the API.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction
															onClick={() => deleteKey(existingKey.id)}
															className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
														>
															Delete
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<CreateProviderKeyDialog
										selectedOrganization={selectedOrganization}
										preselectedProvider={provider.id}
									>
										<Button variant="outline" size="sm">
											Add
										</Button>
									</CreateProviderKeyDialog>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
