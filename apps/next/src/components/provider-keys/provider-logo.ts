import anthropicLogo from "@/assets/models/anthropic.svg";
import CloudRiftLogo from "@/assets/models/cloudrift.svg";
import DeepSeekLogo from "@/assets/models/deepseek.svg";
import GoogleStudioAiLogo from "@/assets/models/google-studio-ai.svg";
import GoogleVertexLogo from "@/assets/models/google-vertex-ai.svg";
import GroqLogo from "@/assets/models/groq.svg";
import InferenceLogo from "@/assets/models/inference-net.svg";
import KlusterLogo from "@/assets/models/kluster-ai.svg";
import LLMGatewayLogo from "@/assets/models/llmgateway.svg";
import MistralLogo from "@/assets/models/mistral.svg";
import OpenAiLogo from "@/assets/models/openai.svg";
import PerplexityLogo from "@/assets/models/perplexity.svg";
import TogetherAiLogo from "@/assets/models/together-ai.svg";
import XaiLogo from "@/assets/models/xai.svg";

import type { ProviderId } from "@llmgateway/models";

export const providerLogoUrls: Partial<Record<ProviderId, string>> = {
	llmgateway: LLMGatewayLogo.src,
	openai: OpenAiLogo.src,
	anthropic: anthropicLogo.src,
	"google-vertex": GoogleVertexLogo.src,
	"inference.net": InferenceLogo.src,
	"kluster.ai": KlusterLogo.src,
	"together.ai": TogetherAiLogo.src,
	"google-ai-studio": GoogleStudioAiLogo.src,
	cloudrift: CloudRiftLogo.src,
	mistral: MistralLogo.src,
	groq: GroqLogo.src,
	xai: XaiLogo.src,
	deepseek: DeepSeekLogo.src,
	perplexity: PerplexityLogo.src,
};

// Helper function to get the appropriate CSS classes for dark mode support
// Using a subtle background to ensure visibility without changing logo colors
export const getProviderLogoDarkModeClasses = (
	providerId: ProviderId,
): string => {
	// Providers with white/light backgrounds or currentColor that need a subtle background in dark mode
	const needsBackground = [
		"openai",
		"anthropic",
		"google-vertex",
		"google-ai-studio",
		"mistral",
		"together.ai",
		"inference.net",
		"kluster.ai",
		"deepseek",
		"perplexity",
		"groq", // uses currentColor
		"xai", // uses currentColor
	];

	const shouldAddBackground = needsBackground.includes(providerId);
	return shouldAddBackground ? "dark:bg-white dark:rounded-sm dark:p-1" : "";
};
