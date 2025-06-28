import Redis from "ioredis";

const redisClient = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6379,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const LOG_QUEUE = "log_queue_" + process.env.NODE_ENV;

export async function publishToQueue(
	queue: string,
	message: unknown,
): Promise<void> {
	try {
		await redisClient.lpush(queue, JSON.stringify(message));
	} catch (error) {
		console.error("Error publishing to queue:", error);
		throw error;
	}
}

export async function consumeFromQueue(
	queue: string,
): Promise<{ items: string[]; processingKeys: string[] } | null> {
	try {
		const processingQueue = `${queue}_processing`;
		const items: string[] = [];
		const processingKeys: string[] = [];

		// Use BRPOPLPUSH to atomically move items from main queue to processing queue
		// Process up to 10 items at a time
		for (let i = 0; i < 10; i++) {
			const result = await redisClient.brpoplpush(queue, processingQueue, 0.1);
			if (!result) {
				break; // No more items available
			}
			items.push(result);
			// Generate unique processing key for each item
			const processingKey = `${processingQueue}:${Date.now()}:${i}`;
			processingKeys.push(processingKey);
			// Store the item with its processing key for later acknowledgment
			await redisClient.setex(processingKey, 300, result); // 5 minute expiry
		}

		if (items.length === 0) {
			return null;
		}

		return { items, processingKeys };
	} catch (error) {
		console.error("Error consuming from queue:", error);
		throw error;
	}
}

export async function acknowledgeItems(
	processingKeys: string[],
): Promise<void> {
	try {
		if (processingKeys.length === 0) {
			return;
		}

		// Remove processed items from processing queue and cleanup keys
		const pipeline = redisClient.pipeline();
		for (const key of processingKeys) {
			pipeline.del(key);
		}
		await pipeline.exec();
	} catch (error) {
		console.error("Error acknowledging items:", error);
		throw error;
	}
}

export async function rejectItems(
	queue: string,
	processingKeys: string[],
): Promise<void> {
	try {
		if (processingKeys.length === 0) {
			return;
		}

		// Move failed items back to main queue
		const pipeline = redisClient.pipeline();
		for (const key of processingKeys) {
			// Get the original item data
			const itemData = await redisClient.get(key);
			if (itemData) {
				// Push back to main queue
				pipeline.lpush(queue, itemData);
			}
			// Clean up processing key
			pipeline.del(key);
		}
		await pipeline.exec();
	} catch (error) {
		console.error("Error rejecting items:", error);
		throw error;
	}
}

export default redisClient;
