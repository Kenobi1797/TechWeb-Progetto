"use client";
import React, { useState, useEffect, useCallback } from "react";
import CatGrid from "../../components/CatGrid";
import SearchBar from "../../components/SearchBar";
import { useCats } from "../../utils/DataContext";
import { Cat } from "../../utils/types";

export default function CatsPage() {
  const { cats, loading, error } = useCats();
  const [page, setPage] = useState<number>(1);
  const [filteredCats, setFilteredCats] = useState(cats);
  const pageSize = 20;

  // Aggiorna i risultati filtrati quando i gatti cambiano
  useEffect(() => {
    setFilteredCats(cats);
    setPage(1); // Reset pagina quando cambiano i dati
  }, [cats]);

  const handleSearchResults = useCallback((results: Cat[]) => {
    setFilteredCats(results);
    setPage(1); // Reset pagina quando cambia la ricerca
  }, []);

  if (loading) return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="text-center py-10">
        <div className="card inline-flex flex-col items-center gap-4 p-8">
          <div className="animate-spin text-4xl">🐾</div>
          <p className="font-semibold text-lg" style={{ color: "var(--color-primary)" }}>
            Caricamento gatti...
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
            Errore nel caricamento degli avvistamenti
          </p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {error}
          </p>
        </div>
      </div>
    </div>
  );

  // Paginazione sui risultati filtrati
  const totalPages = Math.ceil(filteredCats.length / pageSize);
  const pagedCats = filteredCats.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Gatti
      </h1>
      
      <SearchBar 
        cats={cats} 
        onResults={handleSearchResults}
        resultCount={filteredCats.length}
      />

      {(() => {
        if (filteredCats.length === 0 && cats.length > 0) {
          return (
            <div className="text-center py-10">
              <div className="card inline-flex flex-col items-center gap-4 p-8 max-w-md mx-auto">
                <div className="text-6xl opacity-60">🔍</div>
                <h3 className="font-bold text-xl" style={{ color: "var(--color-primary)" }}>
                  Nessun risultato trovato
                </h3>
                <p className="text-sm opacity-80" style={{ color: "var(--color-text-secondary)" }}>
                  Prova a modificare i termini di ricerca o a esplorare categorie diverse
                </p>
              </div>
            </div>
          );
        }
        
        if (filteredCats.length === 0) {
          return (
            <div className="text-center py-10">
              <div className="card inline-flex flex-col items-center gap-4 p-8 max-w-md mx-auto">
                <div className="text-6xl opacity-60">🐱</div>
                <h3 className="font-bold text-xl" style={{ color: "var(--color-primary)" }}>
                  Nessun gatto trovato
                </h3>
                <p className="text-sm opacity-80" style={{ color: "var(--color-text-secondary)" }}>
                  Sii il primo a segnalare un avvistamento!
                </p>
              </div>
            </div>
          );
        }

        return (
          <>
            <CatGrid cats={pagedCats} />
            <div className="flex flex-col items-center gap-4 mt-8">
              {totalPages > 1 && (
                <div className="card flex justify-center items-center gap-4 py-4">
                  <button
                    className="btn btn-secondary btn-small disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
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
                    onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label="Pagina successiva"
                  >
                    Avanti →
                  </button>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </main>
  );
}
