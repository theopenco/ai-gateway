import { Outlet, createFileRoute } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import { useEffect, useMemo, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { TopBar } from "@/components/dashboard/top-bar";
import { useUser } from "@/hooks/useUser";
import { SidebarProvider } from "@/lib/components/sidebar";
import { DashboardContext } from "@/lib/dashboard-context";
import { $api } from "@/lib/fetch-client";

import type { Organization, Project } from "@/lib/types";

export const Route = createFileRoute("/dashboard/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	const posthog = usePostHog();
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [selectedOrganization, setSelectedOrganization] =
		useState<Organization | null>(null);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);

	useUser({ redirectTo: "/login", redirectWhen: "unauthenticated" });

	// Fetch organizations
	const { data: organizationsData } = $api.useQuery("get", "/orgs");

	// Fetch projects for selected organization
	const { data: projectsData } = $api.useQuery(
		"get",
		"/orgs/{id}/projects",
		{
			params: {
				path: {
					id: selectedOrganization?.id || "",
				},
			},
		},
		{
			enabled: !!selectedOrganization?.id,
		},
	);

	// Get current projects from query data
	const projects = projectsData?.projects || [];

	// Update organizations when data is fetched
	useEffect(() => {
		if (organizationsData?.organizations) {
			setOrganizations(organizationsData.organizations);
			// Auto-select first organization if none selected
			if (!selectedOrganization && organizationsData.organizations.length > 0) {
				setSelectedOrganization(organizationsData.organizations[0]);
			}
		}
	}, [organizationsData, selectedOrganization]);

	// Reset project selection when organization changes
	useEffect(() => {
		setSelectedProject(null);
		// Debounce or wait for projects to load for new org
	}, [selectedOrganization?.id]); // Use id for more stable comparison

	// Auto-select with better condition checking
	useEffect(() => {
		if (projects.length > 0 && !selectedProject && selectedOrganization) {
			// Only auto-select if we have projects for the current org
			// and ensure the projects actually belong to the selected organization
			const firstProject = projects[0];
			if (
				firstProject &&
				firstProject.organizationId === selectedOrganization.id
			) {
				setSelectedProject(firstProject);
			}
		}
	}, [projects, selectedProject, selectedOrganization]);

	useEffect(() => {
		posthog.capture("page_viewed_dashboard");
	}, [posthog]);

	const handleOrganizationCreated = (org: Organization) => {
		setOrganizations((prev) => [...prev, org]);
		setSelectedOrganization(org);
	};

	const handleProjectCreated = (project: Project) => {
		// The project will be added to the cache by the mutation's onSuccess callback
		// Just select the new project
		setSelectedProject(project);
	};

	const contextValue = useMemo(
		() => ({ selectedOrganization, selectedProject }),
		[selectedOrganization, selectedProject],
	);

	return (
		<DashboardContext.Provider value={contextValue}>
			<SidebarProvider>
				<div className="flex min-h-screen w-full flex-col">
					<MobileHeader />
					<div className="flex flex-1">
						<DashboardSidebar
							organizations={organizations}
							onSelectOrganization={setSelectedOrganization}
							onOrganizationCreated={handleOrganizationCreated}
						/>
						<div className="flex flex-1 flex-col">
							<TopBar
								projects={projects}
								selectedProject={selectedProject}
								onSelectProject={setSelectedProject}
								selectedOrganization={selectedOrganization}
								onProjectCreated={handleProjectCreated}
							/>
							<main className="bg-background w-full flex-1 overflow-y-auto  p-4 md:p-6 lg:p-8">
								<Outlet />
							</main>
						</div>
					</div>
				</div>
			</SidebarProvider>
		</DashboardContext.Provider>
	);
}
