import { createContext, useContext } from "react";

import type { Organization, Project } from "@/lib/types";

interface DashboardContextType {
	selectedOrganization: Organization | null;
	selectedProject: Project | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
	undefined,
);

export const useDashboardContext = () => {
	const context = useContext(DashboardContext);
	if (!context) {
		throw new Error(
			"useDashboardContext must be used within DashboardProvider",
		);
	}
	return context;
};

export { DashboardContext };
export type { DashboardContextType };
