"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishPriceUpdate = publishPriceUpdate;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const elasticsearch_1 = require("./config/elasticsearch");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const watchlist_routes_1 = __importDefault(require("./routes/watchlist.routes"));
const pricePoller_1 = require("./jobs/pricePoller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", auth_routes_1.default);
app.use("/api/watchlist", watchlist_routes_1.default);
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
const PRICE_CHANNEL = "price-updates";
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("subscribe", (symbol) => {
        socket.join(symbol.toUpperCase());
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
// Anything published to PRICE_CHANNEL on Redis gets fanned out to subscribed
// socket clients. This is what lets multiple backend instances (or a
// separate price-poller process) push updates without talking to sockets
// directly.
async function subscribeToPriceUpdates() {
    await redis_1.redisSubscriber.subscribe(PRICE_CHANNEL, (message) => {
        const update = JSON.parse(message); // { symbol, price, timestamp }
        io.to(update.symbol).emit("price-update", update);
    });
}
// Helper other parts of the app (e.g. a polling job) can use to publish
// a price update onto the channel above.
async function publishPriceUpdate(symbol, price) {
    await redis_1.redisPublisher.publish(PRICE_CHANNEL, JSON.stringify({ symbol, price, timestamp: Date.now() }));
}
const PORT = process.env.PORT || 4000;
async function start() {
    await (0, db_1.initDb)();
    await (0, redis_1.connectRedis)();
    await (0, elasticsearch_1.initElasticsearch)();
    await subscribeToPriceUpdates();
    (0, pricePoller_1.startPricePoller)();
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
