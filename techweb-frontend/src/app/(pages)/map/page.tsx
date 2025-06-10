"use client";
import { useEffect, useState } from "react";
import { Cat } from "../../../utils/types";
import dynamic from "next/dynamic";
import { fetchCats } from "../../../utils/api";

// Import dinamico per evitare errori SSR con leaflet
const MapView = dynamic(() => import("../../../components/MapView"), { ssr: false });

export default function MapPage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetchCats()
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
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
