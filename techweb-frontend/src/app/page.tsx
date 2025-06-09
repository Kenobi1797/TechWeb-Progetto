"use client";
import { useEffect, useState } from "react";
import { Cat } from "../lib/types";
import MapView from "../components/MapView";
import CatGrid from "../components/CatGrid";
import { fetchCats } from "../lib/api";

export default function HomePage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetchCats()
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  return (
    <div className="container mx-auto py-8 px-2 sm:py-12 sm:px-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        Avvistamenti di gatti
      </h1>
      <p className="mb-8 text-base sm:text-lg max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
        Esplora gli ultimi avvistamenti di gatti randagi nella tua città. Clicca su una card per vedere i dettagli e aiutare la community!
      </p>
      <div className="mb-8">
        <MapView
          markers={cats.map((cat) => ({
            lat: cat.latitude,
            lng: cat.longitude,
            title: cat.title,
            imageUrl: cat.imageUrl,
          }))}
        />
      </div>
      <CatGrid cats={cats} />
    </div>
  );
}
