import { ProviderKeysClient } from "@/components/provider-keys/provider-keys-client";
import { fetchServerData } from "@/lib/server-api";

export default async function ProviderKeysPage() {
	// Server-side data fetching for provider keys
	const initialProviderKeysData = await fetchServerData(
		"GET",
		"/keys/provider",
	);

	return (
		<ProviderKeysClient initialProviderKeysData={initialProviderKeysData} />
	);
}
