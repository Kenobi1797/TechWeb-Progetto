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

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">Errore nel caricamento degli avvistamenti.</div>;

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
              <div className="inline-flex flex-col items-center gap-3 p-6 rounded-lg" style={{ background: "var(--color-surface)" }}>
                <div className="text-4xl opacity-60">🔍</div>
                <p className="font-semibold text-lg" style={{ color: "var(--color-text)" }}>
                  Nessun risultato trovato
                </p>
                <p className="text-sm opacity-75" style={{ color: "var(--color-text-secondary)" }}>
                  Prova a modificare i termini di ricerca
                </p>
              </div>
            </div>
          );
        }
        
        if (filteredCats.length === 0) {
          return <div className="text-center py-10">Nessun gatto trovato.</div>;
        }

        return (
          <>
            <CatGrid cats={pagedCats} />
            <div className="flex flex-col items-center gap-4 mt-8">
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                    onClick={() => setPage((p: number) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Indietro
                  </button>
                  <span className="font-bold">Pagina {page} di {totalPages}</span>
                  <button
                    className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                    onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Avanti
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
