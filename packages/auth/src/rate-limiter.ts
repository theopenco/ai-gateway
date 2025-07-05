// In-memory rate limiter
interface RateLimitEntry {
	lastRequestTime: number;
	attempts: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
	allowed: boolean;
	remainingTime?: number;
	attempts?: number;
}

/**
 * In-memory rate limiter with exponential backoff
 * @param key - Unique identifier for the rate limit (e.g., email address)
 * @returns RateLimitResult
 */
export function rateLimit(key: string): RateLimitResult {
	const now = Date.now();
	const entry = rateLimitStore.get(key);

	if (!entry) {
		// First request for this key
		rateLimitStore.set(key, {
			lastRequestTime: now,
			attempts: 1,
		});
		return { allowed: true, attempts: 1 };
	}

	// Calculate exponential backoff: 1 minute * 2^(attempts - 1)
	const backoffMinutes = Math.pow(2, entry.attempts - 1);
	const backoffMs = backoffMinutes * 60 * 1000;

	// Check if we're still in the rate limit window
	const timeUntilReset = entry.lastRequestTime + backoffMs - now;
	if (timeUntilReset > 0) {
		return {
			allowed: false,
			remainingTime: Math.ceil(timeUntilReset / 1000),
			attempts: entry.attempts,
		};
	}

	// Allow the request and update the rate limit
	entry.lastRequestTime = now;
	entry.attempts += 1;
	rateLimitStore.set(key, entry);

	return {
		allowed: true,
		attempts: entry.attempts,
	};
}

/**
 * Reset rate limit for a specific key
 * @param key - Unique identifier for the rate limit
 */
export function resetRateLimit(key: string): void {
	rateLimitStore.delete(key);
}

const oneHour = 60 * 60 * 1000;

// Clean up old entries every hour
setInterval(() => {
	const now = Date.now();

	for (const [key, entry] of rateLimitStore.entries()) {
		if (now - entry.lastRequestTime > oneHour) {
			rateLimitStore.delete(key);
		}
	}
}, oneHour);
