import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";

import "./global.css";
import { ConfigProvider } from "@/lib/context";
import { PostHogProvider } from "@/lib/providers";

import type { ReactNode } from "react";

const inter = Inter({
	subsets: ["latin"],
});

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<ConfigProvider>
					<PostHogProvider>
						<RootProvider>{children}</RootProvider>
					</PostHogProvider>
				</ConfigProvider>
			</body>
		</html>
	);
}
