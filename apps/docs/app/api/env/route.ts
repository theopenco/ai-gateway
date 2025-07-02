import { NextResponse } from "next/server";

export async function GET() {
	// Fetch environment variables from process.env on the server
	const envVars = {
		posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
		posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "",
	};

	// Return the environment variables as JSON
	return NextResponse.json(envVars);
}
