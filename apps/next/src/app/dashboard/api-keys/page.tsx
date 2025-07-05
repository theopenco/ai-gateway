"use client";

import { Plus } from "lucide-react";

import { ApiKeysList } from "@/components/api-keys/api-keys-list";
import { CreateApiKeyDialog } from "@/components/api-keys/create-api-key-dialog";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { useDashboardState } from "@/lib/dashboard-state";

export default function ApiKeysPage() {
	const { selectedProject } = useDashboardState();

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
				<div className="flex items-center justify-between space-y-2">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">API Keys</h2>
						<p className="text-muted-foreground">
							Manage your API keys for accessing LLM Gateway
						</p>
					</div>
					{selectedProject && (
						<CreateApiKeyDialog selectedProject={selectedProject}>
							<Button disabled={!selectedProject}>
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
								API keys allow you to authenticate with the LLM Gateway API.
								{!selectedProject && (
									<span className="block mt-2 text-amber-600">
										Please select a project to manage API keys.
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
