import { db, tables } from "@llmgateway/db";
import { randomUUID } from "crypto";

interface BeaconData {
	uuid: string;
	type: string;
	timestamp: string;
}

/**
 * Sends installation beacon data to the tracking endpoint
 */
async function sendBeacon(data: BeaconData): Promise<void> {
	try {
		const response = await fetch("https://api.llmgateway.io/beacon", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
			// Add timeout to prevent hanging
			signal: AbortSignal.timeout(5000),
		});

		if (!response.ok) {
			console.warn(`Beacon request failed with status ${response.status}`);
		}
	} catch (error) {
		// Log warning but don't throw - beacon failure should not prevent startup
		console.warn("Failed to send beacon:", error);
	}
}

/**
 * Retrieves installation data and sends beacon on startup
 */
export async function sendInstallationBeacon(): Promise<void> {
	try {
		// Get or create the installation record
		let installation = await db.query.installation.findFirst({
			where: {
				type: "self-host",
			},
		});

		if (!installation) {
			// Create the installation record if it doesn't exist
			const [newInstallation] = await db
				.insert(tables.installation)
				.values({
					id: "self-hosted-installation",
					uuid: randomUUID(),
					type: "self-host",
				})
				.returning();
			installation = newInstallation;
			console.log("Created new self-hosted installation record");
		}

		await sendBeacon({
			uuid: installation.uuid,
			type: installation.type,
			timestamp: new Date().toISOString(),
		});

		console.log("Installation beacon sent successfully");
	} catch (error) {
		console.warn("Failed to send installation beacon:", error);
	}
}
