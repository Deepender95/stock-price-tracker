"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDb = initDb;
const pg_1 = require("pg");
exports.pool = new pg_1.Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
});
async function initDb() {
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, symbol)
    );
  `);
    await exports.pool.query(`
    CREATE TABLE IF NOT EXISTS stock_price_history (
      id SERIAL PRIMARY KEY,
      symbol TEXT NOT NULL,
      price NUMERIC NOT NULL,
      recorded_at TIMESTAMPTZ DEFAULT now()
    );
  `);
    console.log("Postgres tables ready");
}
