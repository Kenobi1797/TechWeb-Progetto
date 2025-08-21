"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CatGrid from "../components/CatGrid";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { CatGridSkeleton } from "../components/CatCardSkeleton";
import { useCats } from "../utils/DataContext";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {
  const { cats, loading, error } = useCats();
  const [page, setPage] = useState(1);
  const [filteredCats, setFilteredCats] = useState(cats);
  const pageSize = 20;

  // Aggiorna i risultati filtrati quando i gatti cambiano
  useEffect(() => {
    setFilteredCats(cats);
  }, [cats]);

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

  // Paginazione sui risultati filtrati
  const totalPages = Math.ceil(filteredCats.length / pageSize);
  const pagedCats = filteredCats.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        Avvistamenti di gatti
      </h1>
      <p className="mb-6 text-sm sm:text-lg max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
        Esplora gli ultimi avvistamenti di gatti randagi nella tua città. Clicca su una card per vedere i dettagli e aiutare la community!
      </p>
      
      <SearchBar 
        cats={cats} 
        onResults={setFilteredCats}
        placeholder="Cerca gatti per titolo o descrizione..."
      />
      
      <div className="search-results mb-8">
        {filteredCats.length > 0 ? (
          <MapView
            markers={filteredCats.map((cat) => ({
              lat: cat.latitude,
              lng: cat.longitude,
              title: cat.title,
              imageUrl: cat.imageUrl ?? "",
              id: cat.id,
              createdAt: cat.createdAt,
              description: cat.description ?? ""
            }))}
          />
        ) : (
          <div className="text-center py-10">Nessun avvistamento trovato.</div>
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
