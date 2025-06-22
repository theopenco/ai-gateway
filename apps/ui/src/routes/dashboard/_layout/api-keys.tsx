import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { ApiKeysList } from "@/components/api-keys/api-keys-list";
import { CreateApiKeyDialog } from "@/components/api-keys/create-api-key-dialog";
import Loading from "@/components/api-keys/loading";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { useDashboardContext } from "@/lib/dashboard-context";

export const Route = createFileRoute("/dashboard/_layout/api-keys")({
	component: RouteComponent,
	pendingComponent: () => <Loading />,
	errorComponent: ({ error }) => <div>{error.message}</div>,
});

function RouteComponent() {
	const { selectedProject } = useDashboardContext();

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between">
					<h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
					{selectedProject && (
						<CreateApiKeyDialog selectedProject={selectedProject}>
							<Button>
								<Plus className="mr-2 h-4 w-4" />
								Create API Key
							</Button>
						</CreateApiKeyDialog>
					)}
				</div>
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Your API Keys</CardTitle>
							<CardDescription>
								Manage your API keys for accessing LLM Gateway
								{selectedProject && (
									<span className="block mt-1 text-sm">
										Project: {selectedProject.name}
									</span>
								)}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ApiKeysList selectedProject={selectedProject} />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
