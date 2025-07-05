import {
	models as modelDefinitions,
	providers as providerDefinitions,
} from "@llmgateway/models";
import { notFound } from "next/navigation";

import Footer from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/providers/hero";
import { ProductHuntBanner } from "@/components/shared/product-hunt-banner";
import { Badge } from "@/lib/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/lib/components/card";
import { formatContextSize } from "@/lib/utils";

interface ProviderPageProps {
	params: {
		id: string;
	};
}

export default async function ProviderPage({ params }: ProviderPageProps) {
	const provider = providerDefinitions.find((p) => p.id === params.id);

	if (!provider || provider.name === "LLM Gateway") {
		notFound();
	}

	// Get models for this provider
	const providerModels = modelDefinitions.filter((model) =>
		model.providers.some((p) => p.providerId === provider.id),
	);

	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main>
				<ProductHuntBanner />
				<Navbar />
				<Hero providerId={provider.id} />

				<section className="py-12 bg-gray-50 dark:bg-gray-900">
					<div className="container mx-auto px-4">
						<div className="max-w-4xl mx-auto">
							<h2 className="text-3xl font-bold mb-8">Available Models</h2>
							<div className="grid gap-6 md:grid-cols-2">
								{providerModels.map((model) => (
									<Card key={model.model}>
										<CardHeader>
											<div className="flex items-center justify-between">
												<CardTitle className="text-lg">{model.model}</CardTitle>
												<Badge variant="outline">
													{model.providers[0].providerId}
												</Badge>
											</div>
											<CardDescription>{model.model}</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														Context Size:
													</span>
													<span>
														{formatContextSize(model.providers[0].contextSize)}
													</span>
												</div>
												{model.providers[0].inputPrice && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															Input Price:
														</span>
														<span>
															${model.providers[0].inputPrice}/1M tokens
														</span>
													</div>
												)}
												{model.providers[0].outputPrice && (
													<div className="flex items-center justify-between text-sm">
														<span className="text-muted-foreground">
															Output Price:
														</span>
														<span>
															${model.providers[0].outputPrice}/1M tokens
														</span>
													</div>
												)}
												<div className="flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														Streaming:
													</span>
													<span>
														{model.providers[0].streaming ? "Yes" : "No"}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</div>
	);
}

export async function generateStaticParams() {
	return providerDefinitions
		.filter((provider) => provider.name !== "LLM Gateway")
		.map((provider) => ({
			id: provider.id,
		}));
}

export async function generateMetadata({ params }: ProviderPageProps) {
	const provider = providerDefinitions.find((p) => p.id === params.id);

	if (!provider || provider.name === "LLM Gateway") {
		return {};
	}

	return {
		title: `${provider.name} - LLM Gateway`,
		description: `Learn about ${provider.name} integration with LLM Gateway. Access ${provider.name} models through our unified API.`,
		openGraph: {
			title: `${provider.name} - LLM Gateway`,
			description: `Learn about ${provider.name} integration with LLM Gateway. Access ${provider.name} models through our unified API.`,
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: `${provider.name} - LLM Gateway`,
			description: `Learn about ${provider.name} integration with LLM Gateway.`,
		},
	};
}
