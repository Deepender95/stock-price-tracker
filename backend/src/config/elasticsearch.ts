import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ES_NODE || "http://localhost:9200",
});

const STOCKS_INDEX = "stocks";

export async function initElasticsearch() {
  const exists = await esClient.indices.exists({ index: STOCKS_INDEX });
  if (!exists) {
    await esClient.indices.create({
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

export async function searchStocks(query: string) {
  const result = await esClient.search({
    index: STOCKS_INDEX,
    query: {
      multi_match: {
        query,
        fields: ["symbol", "name"],
        fuzziness: "AUTO",
      },
    },
  });
  return result.hits.hits.map((hit: any) => hit._source);
}

export async function indexStock(symbol: string, name: string) {
  await esClient.index({
    index: STOCKS_INDEX,
    id: symbol,
    document: { symbol, name },
  });
}
