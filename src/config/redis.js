import redis from "redis";

let redisClient = null;

export const initRedis = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379"
    });
    
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    await redisClient.connect();
    console.log("Redis connected successfully");
  }
  return redisClient;
};

export const getRedisClient = () => redisClient;