import { ModelsSupported } from "@/components/models-supported";

export default async function ModelsPage() {
	// This page doesn't need server-side data fetching as it shows static model information
	return <ModelsSupported isDashboard />;
}
