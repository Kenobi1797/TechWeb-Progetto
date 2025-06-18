"use client";

import { useEffect, useState } from "react";
import { Cat } from "../utils/types";
import dynamic from "next/dynamic";
import CatGrid from "../components/CatGrid";
import { fetchCats } from "../utils/ServerConnect";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCats()
      .then(setCats)
      .catch(() => {
        setCats([]);
        setError("Errore nel caricamento degli avvistamenti.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">{error}</div>;

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        Avvistamenti di gatti
      </h1>
      <p className="mb-6 text-sm sm:text-lg max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
        Esplora gli ultimi avvistamenti di gatti randagi nella tua città. Clicca su una card per vedere i dettagli e aiutare la community!
      </p>
      <div className="mb-8">
        {cats.length > 0 ? (
          <MapView
            markers={cats.map((cat) => ({
              lat: cat.latitude,
              lng: cat.longitude,
              title: cat.title,
              imageUrl: cat.imageUrl ?? "",
            }))}
          />
        ) : (
          <div className="text-center py-10">Nessun dato disponibile per la mappa.</div>
        )}
      </div>
      <CatGrid cats={cats} />
    </div>
  );
}
