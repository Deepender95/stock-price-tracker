import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const redisPublisher = redisClient.duplicate();
export const redisSubscriber = redisClient.duplicate();

export async function connectRedis() {
  await redisClient.connect();
  await redisPublisher.connect();
  await redisSubscriber.connect();
  console.log("Redis connected");
}
