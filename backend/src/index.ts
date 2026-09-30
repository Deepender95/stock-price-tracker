import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { initDb } from "./config/db";
import { connectRedis, redisSubscriber, redisPublisher } from "./config/redis";
import { initElasticsearch } from "./config/elasticsearch";
import authRoutes from "./routes/auth.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import { startPricePoller } from "./jobs/pricePoller";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const PRICE_CHANNEL = "price-updates";

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe", (symbol: string) => {
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
  await redisSubscriber.subscribe(PRICE_CHANNEL, (message) => {
    const update = JSON.parse(message); // { symbol, price, timestamp }
    io.to(update.symbol).emit("price-update", update);
  });
}

// Helper other parts of the app (e.g. a polling job) can use to publish
// a price update onto the channel above.
export async function publishPriceUpdate(symbol: string, price: number) {
  await redisPublisher.publish(
    PRICE_CHANNEL,
    JSON.stringify({ symbol, price, timestamp: Date.now() })
  );
}

const PORT = process.env.PORT || 4000;

async function start() {
  await initDb();
  await connectRedis();
  await initElasticsearch();
  await subscribeToPriceUpdates();
  startPricePoller();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
