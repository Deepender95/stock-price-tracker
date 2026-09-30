import { useState } from "react";
import { api } from "../lib/api";

export default function SearchBar({ onAdd }: { onAdd: (symbol: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ symbol: string; name: string }[]>([]);

  async function handleChange(value: string) {
    setQuery(value);
    if (!value) {
      setResults([]);
      return;
    }
    const { data } = await api.get("/watchlist/search", { params: { q: value } });
    setResults(data);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input
        placeholder="Search stocks (e.g. Apple, TSLA)"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        style={{ padding: 8, width: 280 }}
      />
      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, border: "1px solid #ddd", width: 280 }}>
          {results.map((r) => (
            <li
              key={r.symbol}
              style={{ padding: 8, cursor: "pointer" }}
              onClick={() => {
                onAdd(r.symbol);
                setQuery("");
                setResults([]);
              }}
            >
              {r.symbol} — {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
