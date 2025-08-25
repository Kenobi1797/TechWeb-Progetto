"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CatGrid from "../components/CatGrid";
import LoadingSpinner from "../components/LoadingSpinner";
import { CatGridSkeleton } from "../components/CatCardSkeleton";
import { useCats } from "../utils/DataContext";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {
  const { cats, loading, error } = useCats();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  if (loading) return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Avvistamenti di gatti
      </h1>
      <LoadingSpinner size="lg" text="Caricamento avvistamenti..." />
      <CatGridSkeleton count={6} />
    </div>
  );
  if (error) return <div className="text-center py-10">{error}</div>;

  // Paginazione sui risultati
  const totalPages = Math.ceil(cats.length / pageSize);
  const pagedCats = cats.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        Avvistamenti di gatti
      </h1>
      <p className="mb-6 text-sm sm:text-lg max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
        Esplora gli ultimi avvistamenti di gatti randagi nella tua città. Clicca su una card per vedere i dettagli e aiutare la community!
      </p>
      
      <div className="search-results mb-8">
        <MapView
          markers={cats.map((cat) => ({
            lat: cat.latitude,
            lng: cat.longitude,
            title: cat.title,
            imageUrl: cat.imageUrl ?? "",
            id: cat.id,
            createdAt: cat.createdAt,
            description: cat.description ?? ""
          }))}
        />
        {cats.length === 0 && (
          <div className="text-center py-6 mt-4">
            <div className="inline-flex flex-col items-center gap-3 p-6 rounded-lg" style={{ background: "var(--color-surface)" }}>
              <div className="text-4xl opacity-60">🗺️</div>
              <p className="font-semibold text-lg" style={{ color: "var(--color-text)" }}>
                Al momento non ci sono avvistamenti
              </p>
              <p className="text-sm opacity-75" style={{ color: "var(--color-text-secondary)" }}>
                La mappa è pronta per mostrare nuovi avvistamenti nella tua zona
              </p>
            </div>
          </div>
        )}
      </div>
      
      <CatGrid cats={pagedCats} />
      <div className="flex flex-col items-center gap-4 mt-8">
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Indietro
            </button>
            <span className="font-bold">Pagina {page} di {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Avanti
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
