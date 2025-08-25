"use client";
import dynamic from "next/dynamic";
import { useCats } from "../../utils/DataContext";

// Import dinamico per evitare errori SSR con leaflet
const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

export default function MapPage() {
  const { cats, loading, error } = useCats();

  if (loading) return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="text-center py-10">
        <div className="card inline-flex flex-col items-center gap-4 p-8">
          <div className="animate-pulse text-4xl">🗺️</div>
          <p className="font-semibold text-lg" style={{ color: "var(--color-primary)" }}>
            Caricamento mappa...
          </p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="text-center py-10">
        <div className="card inline-flex flex-col items-center gap-4 p-8 border-red-200">
          <div className="text-4xl">⚠️</div>
          <p className="font-semibold text-lg text-red-600">
            Errore nel caricamento della mappa
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {error}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl transition-transform hover:scale-105"
            style={{ 
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              boxShadow: "var(--color-shadow)"
            }}
          >
            🗺️
          </div>
          <h1 className="text-xl sm:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
            Mappa degli avvistamenti
          </h1>
        </div>
        <p className="text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          Esplora tutti gli avvistamenti di gatti nella tua zona. Clicca sui marker per maggiori dettagli!
        </p>
      </div>
      
      {/* Legenda migliorata */}
      <div className="card mb-6">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
          <span>🎨</span>
          <span>Legenda della mappa</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
            <div>
              <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>5+ gatti</div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Zona molto frequentata</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <div>
              <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>3-4 gatti</div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Zona frequentata</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="w-4 h-4 rounded-full bg-orange-500 shadow-sm"></div>
            <div>
              <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>2 gatti</div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Piccolo gruppo</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
            <div>
              <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>1 gatto</div>
              <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Avvistamento singolo</div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg border-2" style={{ 
          background: "var(--color-surface)", 
          borderColor: "var(--color-secondary)" 
        }}>
          <div className="text-sm flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
            <span>💡</span>
            <span><strong>Suggerimento:</strong> Clicca sui marker per vedere i dettagli degli avvistamenti. I colori indicano la densità di gatti nella zona.</span>
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
