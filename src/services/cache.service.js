import { getRedisClient } from "../config/redis.js";

// Cache TTL in seconds
const CACHE_TTL = {
  PROJECT: 300, // 5 minutes
  TASKS: 120,   // 2 minutes
  USER: 600     // 10 minutes
};

// Cache project data
export const cacheProject = async (projectId, projectData) => {
  try {
    const redis = await getRedisClient();
    const key = `project:${projectId}`;
    await redis.setEx(key, CACHE_TTL.PROJECT, JSON.stringify(projectData));
    console.log(`Project ${projectId} cached`);
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};

export const getCachedProject = async (projectId) => {
  try {
    const redis = await getRedisClient();
    const key = `project:${projectId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

// Cache tasks for a project
export const cacheProjectTasks = async (projectId, tasks) => {
  try {
    const redis = await getRedisClient();
    const key = `project:${projectId}:tasks`;
    await redis.setEx(key, CACHE_TTL.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error("Redis cache error:", error);
  }
};

export const getCachedProjectTasks = async (projectId) => {
  try {
    const redis = await getRedisClient();
    const key = `project:${projectId}:tasks`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
};

// Invalidate cache when data changes
export const invalidateProjectCache = async (projectId) => {
  try {
    const redis = await getRedisClient();
    await redis.del(`project:${projectId}`);
    await redis.del(`project:${projectId}:tasks`);
    console.log(`Cache invalidated for project ${projectId}`);
  } catch (error) {
    console.error("Redis invalidate error:", error);
  }
};

// Cache user sessions
export const cacheUserSession = async (userId, sessionData) => {
  try {
    const redis = await getRedisClient();
    const key = `user:${userId}:session`;
    await redis.setEx(key, CACHE_TTL.USER, JSON.stringify(sessionData));
  } catch (error) {
    console.error("Redis session cache error:", error);
  }
};

// Track online users
export const setUserOnline = async (userId, socketId) => {
  try {
    const redis = await getRedisClient();
    const key = `user:${userId}:online`;
    await redis.setEx(key, 60, socketId); // Expires after 60 seconds (heartbeat)
  } catch (error) {
    console.error("Redis online status error:", error);
  }
};

export const isUserOnline = async (userId) => {
  try {
    const redis = await getRedisClient();
    const key = `user:${userId}:online`;
    const socketId = await redis.get(key);
    return !!socketId;
  } catch (error) {
    console.error("Redis check online error:", error);
    return false;
  }
};