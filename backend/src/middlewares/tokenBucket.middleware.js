import ApiError from "../utils/ApiError.js";

class TokenBucket {
    constructor({ capacity = 5, refillRatePerSecond = 1 / 180 }) {
        this.capacity = capacity;                     // Maximum burst attempts (e.g. 5)
        this.refillRate = refillRatePerSecond;        // Tokens added per second (1 token every 3 mins = 1/180)
        this.tokens = capacity;                       // Start with full bucket
        this.lastRefill = Date.now();                 // Timestamp of last refill
    }

    consume() {
        const now = Date.now();
        const secondsPassed = (now - this.lastRefill) / 1000;

        // Refill tokens based on elapsed time (up to max capacity)
        this.tokens = Math.min(this.capacity, this.tokens + secondsPassed * this.refillRate);
        this.lastRefill = now;

        // If at least 1 token is available, consume it
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return {
                allowed: true,
                remainingTokens: Math.floor(this.tokens)
            };
        }

        // Calculate seconds until the next token is available
        const waitTimeSeconds = Math.ceil((1 - this.tokens) / this.refillRate);

        return {
            allowed: false,
            remainingTokens: 0,
            retryAfter: waitTimeSeconds
        };
    }
}

/**
 * Creates a Token Bucket rate-limiting middleware
 * @param {Object} options
 * @param {number} options.capacity - Max burst tokens
 * @param {number} options.refillIntervalSeconds - Time in seconds to refill 1 token
 * @param {Function} options.keyGenerator - Unique identifier function (e.g., email + IP)
 * @param {string|Function} [options.message] - Custom error message string or function (retryAfter) => string
 * @param {Function} [options.customResponse] - Optional custom response handler (req, res, { retryAfter, remainingTokens })
 */
export const createTokenBucketLimiter = ({
    capacity = 5,
    refillIntervalSeconds = 180, // 1 token every 3 minutes
    keyGenerator = (req) => `${req.ip}_${req.body?.email || ""}`,
    message = (retryAfter) => `Too many attempts. Please retry in ${Math.ceil(retryAfter / 60)} minute(s).`,
    customResponse = null,
}) => {
    // In-memory store for buckets: key -> TokenBucket instance
    const buckets = new Map();

    // Auto-clean buckets that are full and inactive to prevent memory leaks
    setInterval(() => {
        const now = Date.now();
        for (const [key, bucket] of buckets.entries()) {
            const timeSinceLastRefill = (now - bucket.lastRefill) / 1000;
            // If bucket has been idle long enough to be full, delete it
            if (timeSinceLastRefill > capacity * refillIntervalSeconds) {
                buckets.delete(key);
            }
        }
    }, 10 * 60 * 1000); // Clean every 10 minutes

    return (req, res, next) => {
        const key = keyGenerator(req);

        if (!buckets.has(key)) {
            buckets.set(
                key,
                new TokenBucket({
                    capacity,
                    refillRatePerSecond: 1 / refillIntervalSeconds
                })
            );
        }

        const bucket = buckets.get(key);
        const { allowed, remainingTokens, retryAfter } = bucket.consume();

        res.setHeader("X-RateLimit-Limit", capacity);
        res.setHeader("X-RateLimit-Remaining", remainingTokens);

        if (!allowed) {
            res.setHeader("Retry-After", retryAfter);

            if (typeof customResponse === "function") {
                return customResponse(req, res, { retryAfter, remainingTokens, capacity });
            }

            const errorMessage = typeof message === "function"
                ? message(retryAfter)
                : message;

            return res.status(429).json({
                statusCode: 429,
                success: false,
                message: errorMessage,
                retryAfter,
                remainingTokens: 0,
            });
        }

        next();
    };
};
