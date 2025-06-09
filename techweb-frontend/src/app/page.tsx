"use client";
import { useEffect, useState } from "react";
import { Cat } from "../lib/types";
import CatCard from "../components/CatCard";
import MapView from "../components/MapView";

export default function HomePage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API error"))))
      .then((data: Cat[]) => setCats(data))
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
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>
      {cats.length === 0 && (
        <div className="text-center mt-16 text-base sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
          Nessun avvistamento trovato.
        </div>
      )}
    </div>
  );
}
