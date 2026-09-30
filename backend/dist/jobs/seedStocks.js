"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const elasticsearch_1 = require("../config/elasticsearch");
const STARTER_STOCKS = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "NFLX", name: "Netflix Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
];
async function seed() {
    await (0, elasticsearch_1.initElasticsearch)();
    for (const stock of STARTER_STOCKS) {
        await (0, elasticsearch_1.indexStock)(stock.symbol, stock.name);
        console.log(`Indexed ${stock.symbol}`);
    }
    console.log("Done seeding.");
    process.exit(0);
}
seed().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
