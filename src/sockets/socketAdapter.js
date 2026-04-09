import { createAdapter } from "@socket.io/redis-adapter";
import { getRedisClient } from "../config/redis.js";

export const setupSocketAdapter = async (io) => {
  const redisClient = await getRedisClient();
  const subClient = redisClient.duplicate();
  
  io.adapter(createAdapter(redisClient, subClient));
  
  console.log("Socket.IO Redis adapter configured");
};