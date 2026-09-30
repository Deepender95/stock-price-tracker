import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { api } from "../lib/api";

type WatchItem = { symbol: string; price?: number };

export default function Watchlist({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io("http://localhost:4000");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    api.get("/watchlist").then(({ data }) => {
      setItems(data.map((d: any) => ({ symbol: d.symbol })));
    });
  }, [refreshKey]);

  useEffect(() => {
    if (!socket) return;

    items.forEach((item) => socket.emit("subscribe", item.symbol));

    socket.on("price-update", (update: { symbol: string; price: number }) => {
      setItems((prev) =>
        prev.map((it) => (it.symbol === update.symbol ? { ...it, price: update.price } : it))
      );
    });

    return () => {
      socket.off("price-update");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, items.length]);

  async function remove(symbol: string) {
    await api.delete(`/watchlist/${symbol}`);
    setItems((prev) => prev.filter((it) => it.symbol !== symbol));
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Symbol</th>
          <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Price</th>
          <th style={{ borderBottom: "1px solid #ddd", padding: 8 }}></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.symbol}>
            <td style={{ padding: 8 }}>{item.symbol}</td>
            <td style={{ padding: 8 }}>{item.price ? `$${item.price.toFixed(2)}` : "—"}</td>
            <td style={{ padding: 8 }}>
              <button onClick={() => remove(item.symbol)}>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
