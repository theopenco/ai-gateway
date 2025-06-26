import {
	models as modelDefinitions,
	providers as providerDefinitions,
	type ProviderId,
} from "@llmgateway/models";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Copy, Check, Plus, GitBranch } from "lucide-react";
import { useState } from "react";

import anthropicLogo from "@/assets/models/anthropic.svg?react";
import CloudRiftLogo from "@/assets/models/cloudrift.svg?react";
import GoogleStudioAiLogo from "@/assets/models/google-studio-ai.svg?react";
import GoogleVertexLogo from "@/assets/models/google-vertex-ai.svg?react";
import GroqLogo from "@/assets/models/groq.svg?react";
import InferenceLogo from "@/assets/models/inference-net.svg?react";
import KlusterLogo from "@/assets/models/kluster-ai.svg?react";
import MistralLogo from "@/assets/models/mistral.svg?react";
import OpenAiLogo from "@/assets/models/openai.svg?react";
import TogetherAiLogo from "@/assets/models/together-ai.svg?react";
import XaiLogo from "@/assets/models/xai.svg?react";
import { Button } from "@/lib/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { DOCS_URL } from "@/lib/env";
import Logo from "@/lib/icons/Logo";
import { cn, formatContextSize } from "@/lib/utils";

const providerLogoComponents: Partial<
	Record<ProviderId, React.FC<React.SVGProps<SVGSVGElement>> | null>
> = {
	openai: OpenAiLogo,
	anthropic: anthropicLogo,
	"google-vertex": GoogleVertexLogo,
	"inference.net": InferenceLogo,
	"kluster.ai": KlusterLogo,
	"together.ai": TogetherAiLogo,
	"google-ai-studio": GoogleStudioAiLogo,
	cloudrift: CloudRiftLogo,
	xai: XaiLogo,
	mistral: MistralLogo,
	groq: GroqLogo,
};

interface ProviderModel {
	model: string;
	providerId: ProviderId;
	providerName: string;
	inputPrice?: number;
	outputPrice?: number;
	contextSize?: number;
}

const getProviderIcon = (providerId: ProviderId) => {
	const ProviderLogo = providerLogoComponents[providerId];

	if (ProviderLogo) {
		return <ProviderLogo className="h-10 w-10 text-black dark:text-white" />;
	}

	return <Logo className="h-5 w-5" />;
};

const groupedProviders = modelDefinitions.reduce<
	Record<string, ProviderModel[]>
>((acc, def) => {
	def.providers.forEach((map) => {
		const provider = providerDefinitions.find((p) => p.id === map.providerId)!;
		if (!acc[provider.name]) {
			acc[provider.name] = [];
		}
		acc[provider.name].push({
			model: def.model,
			providerId: map.providerId,
			providerName: provider.name,
			inputPrice: map.inputPrice,
			outputPrice: map.outputPrice,
			contextSize: map.contextSize,
		});
	});
	return acc;
}, {});

const sortedProviderEntries = Object.entries(groupedProviders)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([providerName, models]) => [
		providerName,
		[...models].sort((a, b) => a.model.localeCompare(b.model)),
	]) as [string, ProviderModel[]][];

const totalModels = modelDefinitions.length;
const totalProviders = sortedProviderEntries.length;

export const ModelsSupported = ({ isDashboard }: { isDashboard?: boolean }) => {
	const [copiedModel, setCopiedModel] = useState<string | null>(null);

	const copyModelName = async (modelName: string) => {
		try {
			await navigator.clipboard.writeText(modelName);
			setCopiedModel(modelName);
			setTimeout(() => setCopiedModel(null), 2000);
		} catch (err) {
			console.error("Failed to copy model name:", err);
		}
	};

	return (
		<div className={cn(!isDashboard && "container mx-auto px-4 pt-60 pb-8")}>
			{!isDashboard ? (
				<header className="text-center mb-12">
					<h1 className="text-4xl font-bold tracking-tight mb-4">
						Supported AI Providers & Models
					</h1>
					<p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
						Access {totalModels} models from {totalProviders} leading AI
						providers through our unified API
					</p>
					<div className="flex justify-center gap-8 text-sm text-muted-foreground mb-8">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full" />
							<span>{totalProviders} Providers</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-blue-500 rounded-full" />
							<span>{totalModels} Models</span>
						</div>
					</div>
					<div className="flex justify-center gap-4">
						<Button variant="outline" asChild>
							<a
								href="https://github.com/theopenco/llmgateway/issues/new?assignees=&labels=enhancement%2Cmodel-request&projects=&template=model-request.md&title=%5BModel+Request%5D+"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2"
							>
								<Plus className="h-4 w-4" />
								Request New Model
							</a>
						</Button>
						<Button variant="outline" asChild>
							<a
								href="https://github.com/theopenco/llmgateway/issues/new?assignees=&labels=enhancement%2Cprovider-request&projects=&template=provider-request.md&title=%5BProvider+Request%5D+"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2"
							>
								<GitBranch className="h-4 w-4" />
								Request New Provider
							</a>
						</Button>
					</div>
				</header>
			) : (
				<div className="mb-10">
					<div className="flex items-center justify-between mb-6">
						<p className="text-xl text-muted-foreground max-w-3xl">
							Access {totalModels} models from {totalProviders} leading AI
							providers through our unified API
						</p>
						<div className="flex gap-2">
							<Button variant="outline" size="sm" asChild>
								<a
									href="https://github.com/theopenco/llmgateway/issues/new?assignees=&labels=enhancement%2Cmodel-request&projects=&template=model-request.md&title=%5BModel+Request%5D+"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2"
								>
									<Plus className="h-4 w-4" />
									Request Model
								</a>
							</Button>
							<Button variant="outline" size="sm" asChild>
								<a
									href="https://github.com/theopenco/llmgateway/issues/new?assignees=&labels=enhancement%2Cprovider-request&projects=&template=provider-request.md&title=%5BProvider+Request%5D+"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2"
								>
									<GitBranch className="h-4 w-4" />
									Request Provider
								</a>
							</Button>
						</div>
					</div>
					<div className="flex justify-start gap-8 text-sm text-muted-foreground">
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-green-500 rounded-full" />
							<span>{totalProviders} Providers</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-2 h-2 bg-blue-500 rounded-full" />
							<span>{totalModels} Models</span>
						</div>
					</div>
				</div>
			)}

			<section className="space-y-12">
				{sortedProviderEntries
					.filter(([providerName]) => providerName !== "LLM Gateway")
					.map(([providerName, models]) => {
						const providerId = models[0].providerId;
						return (
							<div key={providerName} className="space-y-6">
								<Link
									to="/providers/$id"
									params={{ id: providerId }}
									className="flex items-center gap-3 hover:opacity-80 transition-opacity"
								>
									{getProviderIcon(providerId)}
									<h2 className="text-2xl font-semibold">{providerName}</h2>
									<span className="text-sm text-muted-foreground">
										{models.length} model{models.length !== 1 && "s"}
									</span>
								</Link>
								<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
									{models.map((model) => (
										<Card
											key={`${model.providerId}-${model.model}`}
											className="flex flex-col h-full hover:shadow-md transition-shadow"
										>
											<CardHeader className="pb-2">
												<div className="flex items-start justify-between gap-2">
													<div className="flex-1 min-w-0">
														<CardTitle className="text-base leading-tight line-clamp-1">
															{model.model}
														</CardTitle>
														<CardDescription className="text-xs">
															{model.providerName}
														</CardDescription>
													</div>
													<Button
														variant="ghost"
														size="sm"
														className="h-6 w-6 p-0 shrink-0"
														onClick={() => copyModelName(model.model)}
														title="Copy model name"
													>
														{copiedModel === model.model ? (
															<Check className="h-3 w-3 text-green-600" />
														) : (
															<Copy className="h-3 w-3" />
														)}
													</Button>
												</div>
											</CardHeader>
											<CardContent className="mt-auto space-y-2">
												{model.contextSize && (
													<p className="text-xs text-muted-foreground">
														Context: {formatContextSize(model.contextSize)}
													</p>
												)}
												{(model.inputPrice !== undefined ||
													model.outputPrice !== undefined) && (
													<p className="text-xs text-muted-foreground">
														{model.inputPrice !== undefined &&
															`$${(model.inputPrice * 1e6).toFixed(2)} in`}
														{model.outputPrice !== undefined &&
															` / $${(model.outputPrice * 1e6).toFixed(2)} out`}
													</p>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						);
					})}
			</section>

			<footer className="mt-16 text-center">
				<a
					href={`${DOCS_URL}/v1_models`}
					target="_blank"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground"
				>
					<span>Data sourced from @llmgateway/models</span>
					<ExternalLink className="w-4 h-4" />
				</a>
			</footer>
		</div>
	);
};
