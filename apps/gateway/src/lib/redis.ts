import Redis from "ioredis";

const redisClient = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6379,
	maxRetriesPerRequest: 3,
	lazyConnect: true,
});

let isRedisConnected = false;

redisClient.on("error", (err) => {
	console.error("Redis Client Error", err);
	isRedisConnected = false;
});

redisClient.on("connect", () => {
	console.log("Redis connected");
	isRedisConnected = true;
});

redisClient.on("ready", () => {
	console.log("Redis ready");
	isRedisConnected = true;
});

redisClient.on("close", () => {
	console.log("Redis connection closed");
	isRedisConnected = false;
});

export function isRedisAvailable(): boolean {
	return isRedisConnected;
}

export const LOG_QUEUE = "log_queue_" + process.env.NODE_ENV;

export async function publishToQueue(
	queue: string,
	message: unknown,
): Promise<void> {
	if (!isRedisAvailable()) {
		console.warn("Redis unavailable, skipping queue publish");
		return;
	}

	try {
		await redisClient.lpush(queue, JSON.stringify(message));
	} catch (error) {
		console.error("Error publishing to queue:", error);
		isRedisConnected = false;
	}
}

export async function consumeFromQueue(
	queue: string,
): Promise<string[] | null> {
	if (!isRedisAvailable()) {
		return null;
	}

	try {
		const result = await redisClient.rpop(queue, 10);

		if (!result) {
			return null;
		}

		return result;
	} catch (error) {
		console.error("Error consuming from queue:", error);
		isRedisConnected = false;
		return null;
	}
}

export default redisClient;
