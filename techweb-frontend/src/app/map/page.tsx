"use client";
import dynamic from "next/dynamic";
import { useCats } from "../../utils/DataContext";

// Import dinamico per evitare errori SSR con leaflet
const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

export default function MapPage() {
  const { cats, loading, error } = useCats();

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">Errore nel caricamento degli avvistamenti.</div>;

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>
        Mappa degli avvistamenti
      </h1>
      
      {/* Spiegazione del sistema di colori */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-semibold text-sm mb-3 text-gray-800">Come interpretare la mappa:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>5+ gatti (Hotspot felino)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>3-4 gatti (Zona frequentata)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>2 gatti (Piccolo gruppo)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>1 gatto con foto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>1 gatto senza foto</span>
          </div>
        </div>
      </div>
      
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
