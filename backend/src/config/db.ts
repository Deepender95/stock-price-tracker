import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      symbol TEXT NOT NULL,
      added_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, symbol)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_price_history (
      id SERIAL PRIMARY KEY,
      symbol TEXT NOT NULL,
      price NUMERIC NOT NULL,
      recorded_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  console.log("Postgres tables ready");
}
