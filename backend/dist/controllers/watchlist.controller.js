"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWatchlist = getWatchlist;
exports.addToWatchlist = addToWatchlist;
exports.removeFromWatchlist = removeFromWatchlist;
exports.search = search;
const db_1 = require("../config/db");
const elasticsearch_1 = require("../config/elasticsearch");
async function getWatchlist(req, res) {
    console.log("Inside get Watch list api with body ::: ", req.userId);
    const result = await db_1.pool.query("SELECT symbol, added_at FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC", [req.userId]);
    res.json(result.rows);
}
async function addToWatchlist(req, res) {
    console.log("Inside add to Watch list api with body ::: ", req.userId);
    const { symbol } = req.body;
    if (!symbol)
        return res.status(400).json({ error: "symbol is required" });
    await db_1.pool.query("INSERT INTO watchlist (user_id, symbol) VALUES ($1, $2) ON CONFLICT DO NOTHING", [req.userId, symbol.toUpperCase()]);
    res.status(201).json({ message: "Added to watchlist" });
}
async function removeFromWatchlist(req, res) {
    console.log("Inside remove from Watch list api with body ::: ", req.userId);
    const { symbol } = req.params;
    await db_1.pool.query("DELETE FROM watchlist WHERE user_id = $1 AND symbol = $2", [
        req.userId,
        symbol.toUpperCase(),
    ]);
    res.json({ message: "Removed from watchlist" });
}
async function search(req, res) {
    console.log("Inside api api with body ::: ", req.query);
    const query = req.query.q || "";
    if (!query)
        return res.json([]);
    const results = await (0, elasticsearch_1.searchStocks)(query);
    res.json(results);
}
