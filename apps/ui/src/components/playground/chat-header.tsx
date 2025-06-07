import { Link } from "@tanstack/react-router";
import { Key } from "lucide-react";

import { ModelSelector } from "./model-selector";
import { Button } from "@/lib/components/button";
import { SidebarTrigger } from "@/lib/components/sidebar";

interface ChatHeaderProps {
	selectedModel: string;
	onModelSelect: (model: string) => void;
	onManageApiKey: () => void;
}

export function ChatHeader({
	selectedModel,
	onModelSelect,
	onManageApiKey,
}: ChatHeaderProps) {
	const handleModelSelect = (model: string) => {
		onModelSelect(model);
	};

	return (
		<header className="flex items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex items-center gap-4">
				<SidebarTrigger />
				<ModelSelector
					selectedModel={selectedModel}
					onModelSelect={handleModelSelect}
				/>
				<Button
					variant="outline"
					className="flex items-center gap-2"
					onClick={onManageApiKey}
				>
					<Key className="h-4 w-4" />
					Manage API Key
				</Button>
			</div>
			<div className="flex items-center gap-4 ml-auto">
				<Link to="/dashboard">
					<span className="text-nowrap">Go to Dashboard</span>
				</Link>
			</div>
		</header>
	);
}
