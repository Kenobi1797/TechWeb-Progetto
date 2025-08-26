"use client";
import { useEffect, useState } from "react";

export default function DataPage() {
  type DataItem = { id?: string | number; name?: string; title?: string; [key: string]: unknown };
  const [items, setItems] = useState<DataItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/api/data")
      .then(res => res.ok ? res.json() : Promise.reject(new Error("API error")))
      .then(data => setItems(data))
      .catch(() => setError("Errore nel caricamento"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="error-state text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Dati API
      </h1>
      <div className="search-results">
        {items.length === 0 ? (
          <div>Nessun dato disponibile</div>
        ) : (
          items.map((item, i) => (
            <div key={item.id ?? `${item.name ?? item.title ?? i}` } className="data-item border p-2 rounded mb-2">
              {item.name || item.title || JSON.stringify(item)}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
  );
}
