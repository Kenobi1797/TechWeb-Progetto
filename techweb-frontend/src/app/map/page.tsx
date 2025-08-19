"use client";
import dynamic from "next/dynamic";
import { useCats } from "../../contexts/DataContext";

// Import dinamico per evitare errori SSR con leaflet
const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

export default function MapPage() {
  const { cats, loading, error } = useCats();

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">Errore nel caricamento degli avvistamenti.</div>;

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Mappa degli avvistamenti
      </h1>
      <MapView
        markers={cats.map(cat => ({
          id: cat.id,
          lat: cat.latitude,
          lng: cat.longitude,
          title: cat.title,
          imageUrl: cat.imageUrl ?? undefined,
        }))}
      />
    </div>
  );
}
