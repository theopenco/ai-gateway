import { createFileRoute } from "@tanstack/react-router";

import Footer from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { ModelsSupported } from "@/components/models-supported";
import { ProductHuntBanner } from "@/components/shared/product-hunt-banner";

function ProvidersPage() {
	return (
		<div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
			<main>
				<ProductHuntBanner />
				<Hero navbarOnly />
				<ModelsSupported />
			</main>
			<Footer />
		</div>
	);
}

export const Route = createFileRoute("/models")({
	component: ProvidersPage,
});
