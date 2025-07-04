import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Highlight, themes } from "prism-react-renderer";
import React from "react";

import { AnimatedGroup } from "./animated-group";
import { Navbar } from "./navbar";
import { AuthLink } from "../shared/auth-link";
import AnthropicLogo from "@/assets/models/anthropic.svg?react";
import CloudriftLogo from "@/assets/models/cloudrift.svg?react";
import DeepSeekLogo from "@/assets/models/deepseek.svg?react";
import GoogleVertexAILogo from "@/assets/models/google-vertex-ai.svg?react";
import GroqLogo from "@/assets/models/groq.svg?react";
import InferenceNetLogo from "@/assets/models/inference-net.svg?react";
import KlusterAILogo from "@/assets/models/kluster-ai.svg?react";
import MistralLogo from "@/assets/models/mistral.svg?react";
import OpenAILogo from "@/assets/models/openai.svg?react";
import PerplexityLogo from "@/assets/models/perplexity.svg?react";
import TogetherAILogo from "@/assets/models/together-ai.svg?react";
import XaiLogo from "@/assets/models/xai.svg?react";
import heroImageLight from "@/assets/new-hero-light.png";
import heroImageDark from "@/assets/new-hero.png";
import { Button } from "@/lib/components/button";
import { toast } from "@/lib/components/use-toast";
import { useAppConfigValue } from "@/lib/config";
import { cn } from "@/lib/utils";

import type { Language } from "prism-react-renderer";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

// Provider logos configuration
const PROVIDER_LOGOS = [
	{ name: "OpenAI", component: OpenAILogo },
	{ name: "Anthropic", component: AnthropicLogo },
	{ name: "Google Vertex AI", component: GoogleVertexAILogo },
	{ name: "Mistral", component: MistralLogo },
	{ name: "Together AI", component: TogetherAILogo },
	{ name: "Cloudrift", component: CloudriftLogo },
	{ name: "Kluster AI", component: KlusterAILogo },
	{ name: "Inference Net", component: InferenceNetLogo },
	{ name: "Groq", component: GroqLogo },
	{ name: "xAI", component: XaiLogo },
	{ name: "DeepSeek", component: DeepSeekLogo },
	{ name: "Perplexity", component: PerplexityLogo },
] as const;

// TypeScript code example
const typescriptExample = {
	language: "typescript",
	code: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LLM_GATEWAY_API_KEY,
  baseURL: "https://api.llmgateway.io/v1/"
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "user", content: "Hello, how are you?" }
  ]
});

console.log(response.choices[0].message.content);`,
	highlightedLines: [4, 5], // Line 4 contains the apiKey
};

export function Hero({ navbarOnly }: { navbarOnly?: boolean }) {
	const config = useAppConfigValue();
	const { resolvedTheme } = useTheme();

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast({
				title: "Copied to clipboard",
				description:
					"TypeScript code snippet has been copied to your clipboard.",
				duration: 3000,
			});
		} catch (err) {
			console.error("Failed to copy text: ", err);
			toast({
				title: "Copy failed",
				description: "Could not copy to clipboard. Please try again.",
				variant: "destructive",
				duration: 3000,
			});
		}
	};
	return (
		<>
			<Navbar />
			{!navbarOnly && (
				<main className="overflow-hidden">
					<div
						aria-hidden
						className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block"
					>
						<div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
						<div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
						<div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
					</div>
					<section>
						<div className="relative pt-24 md:pt-36">
							<AnimatedGroup
								variants={{
									container: {
										visible: {
											transition: {
												delayChildren: 1,
											},
										},
									},
									item: {
										hidden: {
											opacity: 0,
											y: 20,
										},
										visible: {
											opacity: 1,
											y: 0,
											transition: {
												type: "spring",
												bounce: 0.3,
												duration: 2,
											},
										},
									},
								}}
								className="absolute inset-0 -z-20"
							>
								<img
									src={heroImageDark}
									alt="background"
									className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block"
									width="3276"
									height="4095"
								/>
								<img
									src={heroImageLight}
									alt="background"
									className="absolute inset-x-0 top-56 -z-20 block lg:top-32 dark:hidden"
									width="3276"
									height="4095"
								/>
							</AnimatedGroup>
							<div
								aria-hidden
								className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
							/>
							<div className="mx-auto max-w-7xl px-6">
								{/* Open source badge - outside grid */}
								<div className="mb-10 lg:mb-12">
									<AnimatedGroup variants={transitionVariants}>
										<a
											href="https://github.com/theopenco/llmgateway"
											target="_blank"
											className="mx-auto lg:mx-0 hover:bg-background dark:hover:border-t-border bg-muted group flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
										>
											<span className="text-foreground text-sm">
												LLM Gateway is fully open source
											</span>
											<span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700" />

											<div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
												<div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
													<span className="flex size-6">
														<ArrowRight className="m-auto size-3" />
													</span>
													<span className="flex size-6">
														<ArrowRight className="m-auto size-3" />
													</span>
												</div>
											</div>
										</a>
									</AnimatedGroup>
								</div>

								{/* 2-column grid layout */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
									{/* Column 1: Content */}
									<div className="text-center lg:text-left">
										<AnimatedGroup variants={transitionVariants}>
											<h1 className="max-w-4xl mx-auto lg:mx-0 text-balance text-4xl md:text-6xl xl:text-6xl font-bold">
												Use any model, from any provider
												<br />— with just one API.
											</h1>
											<p className="mx-auto lg:mx-0 mt-8 max-w-2xl text-balance text-lg">
												Route, manage, and analyze your LLM requests across
												multiple providers with a unified API interface.
											</p>
										</AnimatedGroup>

										<AnimatedGroup
											variants={{
												container: {
													visible: {
														transition: {
															staggerChildren: 0.05,
															delayChildren: 0.75,
														},
													},
												},
												...transitionVariants,
											}}
											className="mt-12 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-2 md:flex-row"
										>
											<div
												key={1}
												className="bg-foreground/10 rounded-[14px] border p-0.5"
											>
												<Button
													asChild
													size="lg"
													className="rounded-xl px-5 text-base"
												>
													<AuthLink>
														<span className="text-nowrap">
															Get your API key
														</span>
													</AuthLink>
												</Button>
											</div>
											<Button
												key={2}
												asChild
												size="lg"
												variant="ghost"
												className="h-10.5 rounded-xl px-5"
											>
												<a href={config.docsUrl} target="_blank">
													<span className="text-nowrap">
														View documentation
													</span>
												</a>
											</Button>
										</AnimatedGroup>
									</div>

									{/* Column 2: Code Example */}
									<div className="hidden lg:block">
										<AnimatedGroup
											variants={{
												container: {
													visible: {
														transition: {
															staggerChildren: 0.05,
															delayChildren: 0.5,
														},
													},
												},
												...transitionVariants,
											}}
										>
											<div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="absolute top-3 right-3 z-10 h-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-zinc-900"
													onClick={() =>
														copyToClipboard(typescriptExample.code)
													}
												>
													<Copy className="h-4 w-4 mr-1" />
													Copy
												</Button>

												<div className="relative">
													<Highlight
														code={typescriptExample.code}
														language={typescriptExample.language as Language}
														theme={
															resolvedTheme === "dark"
																? themes.dracula
																: themes.github
														}
													>
														{({
															className,
															style,
															tokens,
															getLineProps,
															getTokenProps,
														}: {
															className: string;
															style: React.CSSProperties;
															tokens: any[];
															getLineProps: (props: any) => any;
															getTokenProps: (props: any) => any;
														}) => (
															<pre
																className={cn(
																	"py-4 overflow-x-auto text-sm leading-relaxed font-mono max-h-100 overflow-y-auto",
																	className,
																)}
																style={{
																	...style,
																	borderRadius: 0,
																	overflowX: "auto",
																}}
															>
																{tokens.map((line: any, i: number) => {
																	const isHighlighted =
																		typescriptExample.highlightedLines?.includes(
																			i + 1,
																		);
																	return (
																		<div
																			key={i}
																			{...getLineProps({ line, key: i })}
																			className={cn(
																				"px-4",
																				isHighlighted
																					? "bg-green-500/10 dark:bg-green-500/20"
																					: "",
																			)}
																		>
																			{line.map((token: any, key: number) => (
																				<span
																					key={key}
																					{...getTokenProps({ token, key })}
																				/>
																			))}
																		</div>
																	);
																})}
															</pre>
														)}
													</Highlight>
												</div>
											</div>
										</AnimatedGroup>
									</div>
								</div>

								{/* Product Hunt Badge - Keep in fixed position */}
								<AnimatedGroup
									variants={{
										container: {
											visible: {
												transition: {
													staggerChildren: 0.05,
													delayChildren: 1,
												},
											},
										},
										...transitionVariants,
									}}
									className="mt-8 flex justify-center fixed bottom-4 left-2 z-30"
								>
									<a
										href="https://www.producthunt.com/products/llm-gateway?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-llm&#0045;gateway"
										target="_blank"
										rel="noopener noreferrer"
										className="transition-transform hover:scale-105"
									>
										<img
											src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=986038&theme=light&t=1751353042660"
											alt="LLM&#0032;Gateway - One&#0032;API&#0032;Gateway&#0032;for&#0032;all&#0032;your&#0032;LLM&#0032;needs | Product Hunt"
											style={{ width: "250px", height: "54px" }}
											width="250"
											height="54"
										/>
									</a>
								</AnimatedGroup>
							</div>

							<AnimatedGroup
								variants={{
									container: {
										visible: {
											transition: {
												staggerChildren: 0.05,
												delayChildren: 0.75,
											},
										},
									},
									...transitionVariants,
								}}
							>
								<div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
									<div
										aria-hidden
										className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
									/>
									<div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
										<img
											className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
											src={heroImageDark}
											alt="app screen"
											width="2696"
											height="1386"
										/>
										<img
											className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
											src={heroImageLight}
											alt="app screen"
											width="2696"
											height="1386"
										/>
									</div>
								</div>
							</AnimatedGroup>
						</div>
					</section>
					<section className="bg-background pb-16 pt-16 md:pb-32">
						<div className="group relative m-auto max-w-5xl px-6">
							<div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
								<Link
									to="/models"
									className="block text-sm duration-150 hover:opacity-75"
								>
									<span>View All Providers</span>
									<ChevronRight className="ml-1 inline-block size-3" />
								</Link>
							</div>
							<div className="group-hover:blur-xs mx-auto mt-12 grid max-w-2xl grid-cols-5 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-50 sm:gap-x-16 sm:gap-y-14">
								{PROVIDER_LOGOS.map((provider) => {
									const LogoComponent = provider.component;
									return (
										<div key={provider.name} className="flex">
											<LogoComponent className="mx-auto h-16 w-fit" />
										</div>
									);
								})}
							</div>
						</div>
					</section>
				</main>
			)}
		</>
	);
}
