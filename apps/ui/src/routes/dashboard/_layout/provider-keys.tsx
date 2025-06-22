import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Suspense } from "react";

import { CreateProviderKeyDialog } from "@/components/provider-keys/create-provider-key-dialog";
import LoadingProviderKeys from "@/components/provider-keys/loading-provider-keys";
import { ProviderKeysList } from "@/components/provider-keys/provider-keys-list";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { useDashboardContext } from "@/lib/dashboard-context";

export const Route = createFileRoute("/dashboard/_layout/provider-keys")({
	component: RouteComponent,
	pendingComponent: () => <LoadingProviderKeys />,
	errorComponent: ({ error }) => <div>{error.message}</div>,
});

function RouteComponent() {
	const { selectedOrganization } = useDashboardContext();

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">Provider Keys</h2>
					{selectedOrganization && (
						<CreateProviderKeyDialog
							selectedOrganization={selectedOrganization}
						>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Add Provider Key
							</Button>
						</CreateProviderKeyDialog>
					)}
				</div>
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Your Provider Keys</CardTitle>
							<CardDescription>
								Manage your provider keys for connecting to LLM providers
								{selectedOrganization && (
									<span className="block mt-1 text-sm">
										Organization: {selectedOrganization.name}
									</span>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense>
								<ProviderKeysList selectedOrganization={selectedOrganization} />
							</Suspense>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
