import { $api } from "@/lib/fetch-client";

export function useDefaultProject() {
	const { data: orgsData, isError: orgsError } = $api.useSuspenseQuery(
		"get",
		"/orgs",
	);

	if (orgsError || !orgsData?.organizations?.length) {
		return { data: null, isError: true };
	}

	const defaultOrg = orgsData.organizations[0];

	const { data: projectsData, isError: projectsError } = $api.useSuspenseQuery(
		"get",
		"/orgs/{id}/projects",
		{
			params: {
				path: { id: defaultOrg.id },
			},
		},
	);

	if (projectsError || !projectsData?.projects?.length) {
		return { data: null, isError: true };
	}

	return {
		data: projectsData.projects[0],
		isError: false,
	};
}
