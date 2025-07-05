import { TransactionsClient } from "@/components/dashboard/transactions-client";

export default async function TransactionsPage() {
	// Server-side data fetching - this will be used as initial data
	// Note: We can't know the organization ID on the server without URL params
	// The client will refetch with the correct organization ID
	const initialTransactionsData = null; // We'll let the client handle the initial fetch

	return (
		<TransactionsClient initialTransactionsData={initialTransactionsData} />
	);
}
