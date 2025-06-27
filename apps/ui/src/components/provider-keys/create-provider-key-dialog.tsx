import { providers } from "@llmgateway/models";
import { useQueryClient } from "@tanstack/react-query";
import { usePostHog } from "posthog-js/react";
import React, { useState } from "react";

import { ProviderSelect } from "./provider-select";
import { UpgradeToProDialog } from "@/components/shared/upgrade-to-pro-dialog";
import { Alert, AlertDescription } from "@/lib/components/alert";
import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/lib/components/dialog";
import { Input } from "@/lib/components/input";
import { Label } from "@/lib/components/label";
import { toast } from "@/lib/components/use-toast";
import { HOSTED } from "@/lib/env";
import { $api } from "@/lib/fetch-client";

import type { Organization } from "@/lib/types";

interface CreateProviderKeyDialogProps {
	children: React.ReactNode;
	selectedOrganization: Organization;
}

export function CreateProviderKeyDialog({
	children,
	selectedOrganization,
}: CreateProviderKeyDialogProps) {
	const posthog = usePostHog();
	const [open, setOpen] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState("");
	const [baseUrl, setBaseUrl] = useState("");
	const [token, setToken] = useState("");
	const [isValidating, setIsValidating] = useState(false);

	const queryKey = $api.queryOptions("get", "/keys/provider").queryKey;
	const queryClient = useQueryClient();

	const { data: providerKeysData, isPending: isLoading } =
		$api.useSuspenseQuery("get", "/keys/provider");

	const isProPlan = selectedOrganization.plan === "pro";

	const createMutation = $api.useMutation("post", "/keys/provider");

	// Filter provider keys by selected organization
	const organizationProviderKeys =
		providerKeysData?.providerKeys.filter(
			(key) => key.organizationId === selectedOrganization.id,
		) || [];

	const availableProviders = providers.filter((provider) => {
		if (provider.id === "llmgateway") {
			return false;
		}

		const existingKey = organizationProviderKeys.find(
			(key: any) => key.provider === provider.id && key.status !== "deleted",
		);
		return !existingKey;
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Only enforce pro plan requirement if paid mode is enabled
		if (HOSTED && !isProPlan) {
			toast({
				title: "Upgrade Required",
				description:
					"Provider keys are only available on the Pro plan. Please upgrade to use your own API keys.",
				variant: "destructive",
			});
			return;
		}

		if (!selectedProvider || !token) {
			toast({
				title: "Error",
				description: !selectedProvider
					? "Please select a provider"
					: "Please enter the provider API key",
				variant: "destructive",
			});
			return;
		}

		if (selectedProvider === "llmgateway" && !baseUrl) {
			toast({
				title: "Error",
				description: "Base URL is required for LLM Gateway provider",
				variant: "destructive",
			});
			return;
		}

		const payload: {
			provider: string;
			token: string;
			baseUrl?: string;
			organizationId: string;
		} = {
			provider: selectedProvider,
			token,
			organizationId: selectedOrganization.id,
		};
		if (baseUrl) {
			payload.baseUrl = baseUrl;
		}

		setIsValidating(true);
		toast({ title: "Validating API Key", description: "Please wait..." });

		createMutation.mutate(
			{ body: payload },
			{
				onSuccess: () => {
					setIsValidating(false);
					posthog.capture("provider_key_added", {
						provider: selectedProvider,
						hasBaseUrl: !!baseUrl,
					});
					toast({
						title: "Provider Key Created",
						description: "The provider key has been validated and saved.",
					});
					void queryClient.invalidateQueries({ queryKey });
					setOpen(false);
				},
				onError: (error: any) => {
					setIsValidating(false);
					toast({
						title: "Error",
						description: error?.message ?? "Failed to create key",
						variant: "destructive",
					});
				},
			},
		);
	};

	const handleClose = () => {
		setOpen(false);
		setTimeout(() => {
			setSelectedProvider("");
			setBaseUrl("");
			setToken("");
		}, 300);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add Provider Key</DialogTitle>
					<DialogDescription>
						Create a new provider key to connect to an LLM provider.
						<span className="block mt-1">
							Organization: {selectedOrganization.name}
						</span>
					</DialogDescription>
				</DialogHeader>
				{HOSTED && !isProPlan && (
					<Alert>
						<AlertDescription className="flex items-center justify-between gap-2">
							<span>Provider keys are only available on the Pro plan.</span>
							<div className="flex items-center gap-2">
								<Badge variant="outline">Pro Only</Badge>
								<UpgradeToProDialog>
									<Button size="sm" variant="outline">
										Upgrade
									</Button>
								</UpgradeToProDialog>
							</div>
						</AlertDescription>
					</Alert>
				)}
				<form onSubmit={handleSubmit} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="provider">Provider</Label>
						<ProviderSelect
							onValueChange={setSelectedProvider}
							value={selectedProvider}
							providers={availableProviders}
							loading={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="token">Provider API Key</Label>
						<Input
							id="token"
							type="password"
							placeholder="sk-..."
							value={token}
							onChange={(e) => setToken(e.target.value)}
							required
						/>
					</div>

					{selectedProvider === "llmgateway" && (
						<div className="space-y-2">
							<Label htmlFor="base-url">Base URL</Label>
							<Input
								id="base-url"
								type="url"
								placeholder="https://api.llmgateway.com"
								value={baseUrl}
								onChange={(e) => setBaseUrl(e.target.value)}
								required
							/>
						</div>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={isValidating}>
							{isValidating ? "Validating..." : "Add Key"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
