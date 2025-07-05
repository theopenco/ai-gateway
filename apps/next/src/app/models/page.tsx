import Footer from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { ModelsSupported } from "@/components/models-supported";
import { ProductHuntBanner } from "@/components/shared/product-hunt-banner";

export default function ProvidersPage() {
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
