"use client";

import { type ReactNode } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { TopBar } from "@/components/dashboard/top-bar";
import { useDashboardState } from "@/lib/dashboard-state";

interface DashboardLayoutClientProps {
	children: ReactNode;
}

export function DashboardLayoutClient({
	children,
}: DashboardLayoutClientProps) {
	const {
		organizations,
		projects,
		selectedProject,
		selectedOrganization,
		handleOrganizationSelect,
		handleProjectSelect,
		handleOrganizationCreated,
		handleProjectCreated,
	} = useDashboardState();

	return (
		<div className="flex min-h-screen w-full flex-col">
			<MobileHeader />
			<div className="flex flex-1">
				<DashboardSidebar
					organizations={organizations}
					onSelectOrganization={handleOrganizationSelect}
					onOrganizationCreated={handleOrganizationCreated}
				/>
				<div className="flex flex-1 flex-col justify-center">
					<TopBar
						projects={projects}
						selectedProject={selectedProject}
						onSelectProject={handleProjectSelect}
						selectedOrganization={selectedOrganization}
						onProjectCreated={handleProjectCreated}
					/>
					<main className="bg-background max-w-7xl mx-auto w-full flex-1 overflow-y-auto pt-10 pb-4 px-4 md:p-6 lg:p-8">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}
