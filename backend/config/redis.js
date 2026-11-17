import { createClient } from "redis";

let isRedisAvailable = false;

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
    socket: {
        // Prevent endless reconnection attempts if Redis is not installed/running
        reconnectStrategy: (retries) => {
            if (retries > 2) {
                return new Error("Redis server not available.");
            }
            return 500;
        },
    },
});

redisClient.on("error", (err) => {
    // Only log once or suppress after failure so it doesn't spam your console
    if (isRedisAvailable) {
        console.error("Redis Error:", err.message);
    }
});

redisClient.on("connect", () => {
    isRedisAvailable = true;
    console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
    console.log("Redis connected successfully");
});

const connectRedis = async () => {
    // Optional: allow disabling Redis explicitly via .env
    if (process.env.ENABLE_REDIS === "false") {
        console.log("Redis is disabled via ENABLE_REDIS flag.");
        return;
    }
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        isRedisAvailable = false;
        console.warn("⚠️ Redis is not installed or running. Continuing without Redis cache.");
    }
}

export {
    redisClient,
    connectRedis,
    isRedisAvailable,
}