import { pool } from "../config/db";
import { redisPublisher } from "../config/redis";

const PRICE_CHANNEL = "price-updates";
const POLL_INTERVAL_MS = 10_000; // 10s — free-tier stock APIs rate-limit aggressively

async function fetchPrice(symbol: string): Promise<number | null> {
  const url = `${process.env.STOCK_API_BASE}/quote?symbol=${symbol}&token=${process.env.STOCK_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { c?: number }; // Finnhub returns "c" for current price
  return data.c ?? null;
}

async function pollOnce() {
  // Poll only symbols that are actually on someone's watchlist —
  // no point burning API quota on symbols nobody's tracking.
  const { rows } = await pool.query("SELECT DISTINCT symbol FROM watchlist");

  for (const { symbol } of rows) {
    const price = await fetchPrice(symbol);
    if (price === null) continue;

    await pool.query(
      "INSERT INTO stock_price_history (symbol, price) VALUES ($1, $2)",
      [symbol, price]
    );

    await redisPublisher.publish(
      PRICE_CHANNEL,
      JSON.stringify({ symbol, price, timestamp: Date.now() })
    );
  }
}

export function startPricePoller() {
  console.log("Price poller started");
  setInterval(() => {
    pollOnce().catch((err) => console.error("Price poll failed:", err));
  }, POLL_INTERVAL_MS);
}
