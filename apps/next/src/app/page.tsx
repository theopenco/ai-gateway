import { CodeExample } from "@/components/landing/code-example";
import CallToAction from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import { Graph } from "@/components/landing/graph";
import { Hero } from "@/components/landing/hero";
import { PricingPlans } from "@/components/landing/pricing-plans";
import { ProductHuntBanner } from "@/components/shared/product-hunt-banner";

export default function Home() {
	return (
		<>
			<ProductHuntBanner />
			<Hero />
			<Features />
			<Graph />
			<CodeExample />
			<PricingPlans />
			<Faq />
			<CallToAction />
			<Footer />
		</>
	);
}
