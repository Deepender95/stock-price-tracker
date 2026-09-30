"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startPricePoller = startPricePoller;
const db_1 = require("../config/db");
const redis_1 = require("../config/redis");
const PRICE_CHANNEL = "price-updates";
const POLL_INTERVAL_MS = 10000; // 10s — free-tier stock APIs rate-limit aggressively
async function fetchPrice(symbol) {
    const url = `${process.env.STOCK_API_BASE}/quote?symbol=${symbol}&token=${process.env.STOCK_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok)
        return null;
    const data = (await res.json()); // Finnhub returns "c" for current price
    return data.c ?? null;
}
async function pollOnce() {
    // Poll only symbols that are actually on someone's watchlist —
    // no point burning API quota on symbols nobody's tracking.
    const { rows } = await db_1.pool.query("SELECT DISTINCT symbol FROM watchlist");
    for (const { symbol } of rows) {
        const price = await fetchPrice(symbol);
        if (price === null)
            continue;
        await db_1.pool.query("INSERT INTO stock_price_history (symbol, price) VALUES ($1, $2)", [symbol, price]);
        await redis_1.redisPublisher.publish(PRICE_CHANNEL, JSON.stringify({ symbol, price, timestamp: Date.now() }));
    }
}
function startPricePoller() {
    console.log("Price poller started");
    setInterval(() => {
        pollOnce().catch((err) => console.error("Price poll failed:", err));
    }, POLL_INTERVAL_MS);
}
