import { Copy, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/lib/components/button";
import { toast } from "@/lib/components/use-toast";

export function ProductHuntBanner() {
	const [isVisible, setIsVisible] = useState(true);

	const copyPromoCode = async () => {
		try {
			await navigator.clipboard.writeText("PRODUCTHUNT");
			toast({
				title: "Promo code copied!",
				description: "Use PRODUCTHUNT at checkout for 50% off",
			});
		} catch {
			// Fallback for older browsers
			const textArea = document.createElement("textarea");
			textArea.value = "PRODUCTHUNT";
			textArea.style.position = "fixed";
			textArea.style.opacity = "0";
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand("copy");
				toast({
					title: "Promo code copied!",
					description: "Use PRODUCTHUNT at checkout for 50% off",
				});
			} catch {
				// If all else fails, just show the code
				toast({
					title: "Copy failed",
					description: "Promo code: PRODUCTHUNT",
				});
			}
			document.body.removeChild(textArea);
		}
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div className="bg-[#ff6154] text-white px-4 py-3 text-center relative">
			<div className="flex items-center justify-center gap-2 text-sm font-medium">
				<span>🎉</span>
				<span>
					Limited time offer: <strong>50% off Pro plan</strong> until July 15!
					Use code{" "}
					<button
						onClick={copyPromoCode}
						className="bg-white/20 px-2 py-1 rounded font-mono text-xs hover:bg-white/30 transition-colors inline-flex items-center gap-1 cursor-pointer"
						title="Click to copy promo code"
					>
						<strong>PRODUCTHUNT</strong>
						<Copy className="h-3 w-3" />
					</button>
				</span>
				<span>🚀</span>
			</div>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => setIsVisible(false)}
				className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/20 text-white"
			>
				<X className="h-4 w-4" />
				<span className="sr-only">Close banner</span>
			</Button>
		</div>
	);
}
