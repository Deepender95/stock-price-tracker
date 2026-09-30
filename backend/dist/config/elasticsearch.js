"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esClient = void 0;
exports.initElasticsearch = initElasticsearch;
exports.searchStocks = searchStocks;
exports.indexStock = indexStock;
const elasticsearch_1 = require("@elastic/elasticsearch");
exports.esClient = new elasticsearch_1.Client({
    node: process.env.ES_NODE || "http://localhost:9200",
});
const STOCKS_INDEX = "stocks";
async function initElasticsearch() {
    const exists = await exports.esClient.indices.exists({ index: STOCKS_INDEX });
    if (!exists) {
        await exports.esClient.indices.create({
            index: STOCKS_INDEX,
            mappings: {
                properties: {
                    symbol: { type: "keyword" },
                    name: { type: "text" },
                },
            },
        });
        console.log("Created Elasticsearch index:", STOCKS_INDEX);
    }
}
async function searchStocks(query) {
    const result = await exports.esClient.search({
        index: STOCKS_INDEX,
        query: {
            multi_match: {
                query,
                fields: ["symbol", "name"],
                fuzziness: "AUTO",
            },
        },
    });
    return result.hits.hits.map((hit) => hit._source);
}
async function indexStock(symbol, name) {
    await exports.esClient.index({
        index: STOCKS_INDEX,
        id: symbol,
        document: { symbol, name },
    });
}
