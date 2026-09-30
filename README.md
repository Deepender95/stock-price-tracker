# Real-Time Stock Tracker

A full-stack real-time stock watchlist app. Users register, search for stocks
(Elasticsearch-backed), add them to a personal watchlist, and see live price
updates pushed over WebSocket as they happen.

## Architecture

```
React (Vite) ──HTTP──▶ Express API ──▶ Postgres (users, watchlist, price history)
      │                     │
      │                     ├──▶ Elasticsearch (stock search)
      │                     │
      └──WebSocket──▶ Socket.io ◀── Redis pub/sub ◀── price poller (background job)
```

- **Backend**: Node.js, TypeScript, Express, Socket.io, PostgreSQL, Redis, Elasticsearch
- **Frontend**: React, Vite, Chart.js, Socket.io-client
- **Auth**: JWT-based
- **Real-time**: a background job polls a stock price API every 10s, stores
  history in Postgres, and publishes updates on Redis. Socket.io subscribes to
  that Redis channel and fans updates out to connected clients — so the design
  works even if you later run multiple backend instances behind a load balancer.

## Local setup

1. **Get a free stock API key** at [finnhub.io](https://finnhub.io) (free tier is enough).

2. **Backend env**:
   ```bash
   cd backend
   cp .env.example .env
   # edit .env — set JWT_SECRET and STOCK_API_KEY
   ```

3. **Start everything** (Postgres, Redis, Elasticsearch, backend) from the repo root:
   ```bash
   docker compose up --build
   ```
   Backend will be live at `http://localhost:4000`. Check `http://localhost:4000/health`.

4. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173`.

5. Register a user, search for a stock (you'll need to index a few stocks into
   Elasticsearch first — see `backend/src/config/elasticsearch.ts`'s `indexStock`
   helper, or add a small seed script), add it to your watchlist, and watch the
   price update live once the poller picks it up.

## Deploying (AWS free tier)

See the deployment notes below — the short version: one EC2 t2.micro/t3.micro
running everything via `docker compose`, frontend deployed free on
Vercel/Netlify pointing at the EC2 backend's public IP.

## Why I built this

Built to demonstrate real-time backend architecture (Redis pub/sub fan-out,
WebSocket delivery), search (Elasticsearch), and full-stack delivery — patterns
from building a production real-time data platform, applied here from scratch
on new, original infrastructure.
