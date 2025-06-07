import { Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";

import { Badge } from "@/lib/components/badge";
import { Button } from "@/lib/components/button";

const comparisonData = [
	{
		category: "Pricing & Fees",
		features: [
			{
				title: "Free tier",
				description: "Get started without upfront costs",
				llmgateway: "5% fee on credits",
				openrouter: "10% fee on credits",
			},
			{
				title: "Pro plan pricing",
				description: "Monthly subscription cost",
				llmgateway: "$50/month",
				openrouter: "No subscription",
			},
			{
				title: "Zero gateway fees",
				description: "No additional fees when using your own API keys",
				llmgateway: "Pro plan",
				openrouter: false,
			},
			{
				title: "Self-hosting option",
				description: "MIT-licensed, deploy on your infrastructure for free",
				llmgateway: "Free forever",
				openrouter: false,
			},
		],
	},
	{
		category: "Models & Providers",
		features: [
			{
				title: "Supported providers",
				description: "Major LLM providers available",
				llmgateway: "OpenAI, Anthropic, Google, Mistral, Groq+",
				openrouter: "50+ providers",
			},
			{
				title: "Total models",
				description: "Number of models you can access",
				llmgateway: "100+ models",
				openrouter: "300+ models",
			},
			{
				title: "New model releases",
				description: "How quickly new models are added",
				llmgateway: "Within 48 hours",
				openrouter: "Varies",
			},
			{
				title: "Custom provider integration",
				description: "Add your own LLM providers",
				llmgateway: true,
				openrouter: false,
			},
		],
	},
	{
		category: "Analytics & Monitoring",
		features: [
			{
				title: "Real-time cost analytics",
				description: "Detailed cost tracking for every request",
				llmgateway: true,
				openrouter: "Basic",
			},
			{
				title: "Latency analytics",
				description: "Real-time performance monitoring",
				llmgateway: true,
				openrouter: "Basic",
			},
			{
				title: "Request-level insights",
				description: "Granular analytics for each API call",
				llmgateway: true,
				openrouter: false,
			},
			{
				title: "Usage dashboard",
				description: "Comprehensive usage metrics",
				llmgateway: true,
				openrouter: true,
			},
		],
	},
	{
		category: "Reliability & Support",
		features: [
			{
				title: "Uptime SLA",
				description: "Guaranteed uptime for managed instances",
				llmgateway: "99.9%",
				openrouter: "No SLA",
			},
			{
				title: "Failover support",
				description: "Automatic failover to backup providers",
				llmgateway: true,
				openrouter: true,
			},
			{
				title: "Load balancing",
				description: "Distribute requests across providers",
				llmgateway: true,
				openrouter: true,
			},
			{
				title: "Priority support",
				description: "Dedicated support for paid plans",
				llmgateway: "Pro+",
				openrouter: false,
			},
		],
	},
	{
		category: "Enterprise Features",
		features: [
			{
				title: "Dedicated infrastructure",
				description: "Isolated compute resources",
				llmgateway: "Enterprise",
				openrouter: false,
			},
			{
				title: "Custom SLAs",
				description: "Tailored service level agreements",
				llmgateway: "Enterprise",
				openrouter: false,
			},
			{
				title: "Volume discounts",
				description: "Pricing discounts for high usage",
				llmgateway: "Enterprise",
				openrouter: "Available",
			},
			{
				title: "On-premise deployment",
				description: "Full control over your data and infrastructure",
				llmgateway: "MIT license",
				openrouter: false,
			},
		],
	},
];

export function Comparison() {
	const renderFeatureValue = (value: any) => {
		if (typeof value === "boolean") {
			return value ? (
				<Check className="h-5 w-5 text-green-600 dark:text-green-400" />
			) : (
				<X className="h-5 w-5 text-red-600 dark:text-red-400" />
			);
		}
		return <span className="text-sm font-medium text-foreground">{value}</span>;
	};

	return (
		<section className="w-full py-12 md:py-24 lg:py-32 bg-background">
			<div className="container px-4 md:px-6 max-w-5xl mx-auto">
				<div className="text-center mb-12">
					<Badge variant="outline" className="mb-4">
						Compare platforms
					</Badge>
					<h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
						Find the perfect fit
					</h2>
					<p className="text-muted-foreground">
						Compare LLM Gateway and OpenRouter features side by side
					</p>
				</div>

				<div className="bg-card rounded-lg border border-border overflow-hidden shadow-sm">
					<div className="grid grid-cols-3 gap-4 p-6 bg-muted/50 border-b border-border">
						<div />
						<div className="text-center">
							<div className="border-2 border-primary rounded-lg p-4 bg-background shadow-sm">
								<h3 className="font-bold text-lg mb-1 text-foreground">
									LLM Gateway
								</h3>
								<p className="text-sm text-muted-foreground mb-2">
									ENTERPRISE-FOCUSED
								</p>
								<p className="text-2xl font-bold text-primary">From $0</p>
								<p className="text-xs text-muted-foreground mt-1">
									Self-host free forever
								</p>
							</div>
						</div>
						<div className="text-center">
							<div className="border border-border rounded-lg p-4 bg-background">
								<h3 className="font-bold text-lg mb-1 text-foreground">
									OpenRouter
								</h3>
								<p className="text-sm text-muted-foreground mb-2">
									SCALE-FOCUSED
								</p>
								<p className="text-2xl font-bold text-foreground">From $0</p>
								<p className="text-xs text-muted-foreground mt-1">
									Credit-based pricing
								</p>
							</div>
						</div>
					</div>

					{comparisonData.map((category, categoryIndex) => (
						<div key={categoryIndex}>
							{categoryIndex > 0 && (
								<div className="border-t-2 border-border/50" />
							)}

							{category.features.map((feature, featureIndex) => (
								<div
									key={featureIndex}
									className="grid grid-cols-3 gap-4 p-6 border-b border-border/50 hover:bg-muted/30 transition-colors"
								>
									<div>
										<h4 className="font-semibold text-foreground mb-1">
											{feature.title}
										</h4>
										<p className="text-sm text-muted-foreground">
											{feature.description}
										</p>
									</div>
									<div className="flex justify-center items-center">
										{renderFeatureValue(feature.llmgateway)}
									</div>
									<div className="flex justify-center items-center">
										{renderFeatureValue(feature.openrouter)}
									</div>
								</div>
							))}
						</div>
					))}
				</div>

				<div className="mt-8 bg-primary/5 dark:bg-primary/10 rounded-lg p-6 border border-primary/20">
					<h3 className="font-bold text-lg mb-3 text-primary">
						Why choose LLM Gateway?
					</h3>
					<div className="grid md:grid-cols-2 gap-4 text-sm">
						<div className="flex items-start gap-2">
							<Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<span className="text-foreground">
								<strong>Zero gateway fees</strong> on Pro plan with your own API
								keys
							</span>
						</div>
						<div className="flex items-start gap-2">
							<Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<span className="text-foreground">
								<strong>Real-time analytics</strong> for cost & latency
								optimization
							</span>
						</div>
						<div className="flex items-start gap-2">
							<Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<span className="text-foreground">
								<strong>MIT-licensed self-hosting</strong> for complete control
							</span>
						</div>
						<div className="flex items-start gap-2">
							<Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
							<span className="text-foreground">
								<strong>99.9% uptime SLA</strong> with enterprise support
							</span>
						</div>
					</div>
				</div>

				<div className="text-center mt-8">
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button size="lg" className="bg-primary hover:bg-primary/90">
							<Link to="/signup">Start Free with LLM Gateway</Link>
						</Button>
						<Button size="lg" variant="outline">
							<Link to="/" hash="#pricing">
								View Pricing Details
							</Link>
						</Button>
					</div>
					<p className="text-sm text-muted-foreground mt-3">
						No credit card required • Self-host option available • Enterprise
						support included
					</p>
				</div>
			</div>
		</section>
	);
}
