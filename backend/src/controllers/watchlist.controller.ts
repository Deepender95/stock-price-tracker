import { Response } from "express";
import { pool } from "../config/db";
import { searchStocks } from "../config/elasticsearch";
import { AuthRequest } from "../middleware/auth";

export async function getWatchlist(req: AuthRequest, res: Response) {
  console.log("Inside get Watch list api with body ::: ",req.userId)
  const result = await pool.query(
    "SELECT symbol, added_at FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC",
    [req.userId]
  );
  res.json(result.rows);
}

export async function addToWatchlist(req: AuthRequest, res: Response) {
  console.log("Inside add to Watch list api with body ::: ",req.userId)
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: "symbol is required" });

  await pool.query(
    "INSERT INTO watchlist (user_id, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.userId, symbol.toUpperCase()]
  );
  res.status(201).json({ message: "Added to watchlist" });
}

export async function removeFromWatchlist(req: AuthRequest, res: Response) {
  console.log("Inside remove from Watch list api with body ::: ",req.userId)
  const { symbol } = req.params;
  await pool.query("DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2", [
    req.userId,
    symbol.toUpperCase(),
  ]);
  res.json({ message: "Removed from watchlist" });
}

export async function search(req: AuthRequest, res: Response) {
  console.log("Inside api api with body ::: ",req.query)
  const query = (req.query.q as string) || "";
  if (!query) return res.json([]);

  const results = await searchStocks(query);
  res.json(results);
}
