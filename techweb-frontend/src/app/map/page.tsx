"use client";
import { useEffect, useState } from "react";
import { Cat } from "../../lib/types";
import dynamic from "next/dynamic";

// Import dinamico per evitare errori SSR con leaflet
const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

export default function MapPage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API error"))))
      .then((data: Cat[]) => setCats(data))
      .catch(() => setCats([]));
  }, []);

  return (
    <div className="container mx-auto py-8 px-2 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Mappa degli avvistamenti
      </h1>
      <MapView
        markers={cats.map(cat => ({
          lat: cat.latitude,
          lng: cat.longitude,
          title: cat.title,
          imageUrl: cat.imageUrl,
        }))}
      />
    </div>
  );
}
