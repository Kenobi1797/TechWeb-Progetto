"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen gradient-bg">
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
          <div className="text-center py-8 mt-6">
            <div className="card inline-flex flex-col items-center gap-4 p-8 max-w-md mx-auto">
              <div className="text-6xl opacity-60">🗺️</div>
              <h3 className="font-bold text-xl" style={{ color: "var(--color-primary)" }}>
                Nessun avvistamento disponibile
              </h3>
              <p className="text-sm opacity-80" style={{ color: "var(--color-text-secondary)" }}>
                La mappa è pronta per mostrare nuovi avvistamenti nella tua zona. Sii il primo a condividere un avvistamento!
              </p>
              <Link href="/upload" className="btn btn-primary mt-2">
                ＋ Segnala avvistamento
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <CatGrid cats={pagedCats} />
      <div className="flex flex-col items-center gap-4 mt-8">
        {totalPages > 1 && (
          <div className="card flex justify-center items-center gap-4 py-4">
            <button
              className="btn btn-secondary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Pagina precedente"
            >
              ← Indietro
            </button>
            <span className="font-bold px-4 py-2 rounded-lg" style={{ 
              background: "var(--color-accent)", 
              color: "var(--color-primary)" 
            }}>
              Pagina {page} di {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Pagina successiva"
            >
              Avanti →
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
