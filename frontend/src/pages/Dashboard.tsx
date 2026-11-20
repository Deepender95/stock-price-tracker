import { useState } from "react";
import { api } from "../lib/api";
import SearchBar from "../components/SearchBar";
import Watchlist from "../components/Watchlist";

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [refreshKey, setRefreshKey] = useState(0);

  async function addSymbol(symbol: string) {
    await api.post("/watchlist", { symbol });
    setRefreshKey((k) => k + 1);
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Your Watchlist</h1>
        <button onClick={onLogout}>Log out</button>
      </div>
      <SearchBar onAdd={addSymbol} />
      <Watchlist refreshKey={refreshKey} />
    </div>
  );
}
