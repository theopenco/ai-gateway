import { type ReactNode } from "react";

import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { SidebarProvider } from "@/lib/components/sidebar";

interface DashboardLayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<SidebarProvider>
			<DashboardLayoutClient>{children}</DashboardLayoutClient>
		</SidebarProvider>
	);
}
