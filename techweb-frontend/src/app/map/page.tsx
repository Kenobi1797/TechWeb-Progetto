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
        <div className="mt-4 p-3 rounded-lg" style={{ background: "rgba(108, 155, 207, 0.1)", borderColor: "rgba(108, 155, 207, 0.3)", border: "1px solid" }}>
          <div className="text-sm flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
            <span>💡</span>
            <span><strong>Suggerimento:</strong> Clicca sui marker per vedere i dettagli degli avvistamenti</span>
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
