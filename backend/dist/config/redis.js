"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSubscriber = exports.redisPublisher = exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
exports.redisPublisher = exports.redisClient.duplicate();
exports.redisSubscriber = exports.redisClient.duplicate();
async function connectRedis() {
    await exports.redisClient.connect();
    await exports.redisPublisher.connect();
    await exports.redisSubscriber.connect();
    console.log("Redis connected");
}
