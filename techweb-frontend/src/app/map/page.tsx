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
      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="font-bold text-sm mb-3 text-gray-800 flex items-center gap-2">
          <span>🎨</span>
          <span>Legenda colori della mappa:</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-purple-100">
            <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
            <span className="font-medium">5+ gatti <span className="text-purple-600">(Hotspot)</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-green-100">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <span className="font-medium">3-4 gatti <span className="text-green-600">(Frequentata)</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-orange-100">
            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
            <span className="font-medium">2 gatti <span className="text-orange-600">(Gruppo)</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-blue-100">
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
            <span className="font-medium">1 gatto <span className="text-blue-600">(con foto)</span></span>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-red-100">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="font-medium">1 gatto <span className="text-red-600">(senza foto)</span></span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600 text-center">
          💡 <span className="font-medium">Tip:</span> Usa i controlli sulla destra per navigare facilmente nella mappa
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
