"use client";
import React, { useState, useEffect, useCallback } from "react";
import CatGrid from "../../components/CatGrid";
import SearchBar from "../../components/SearchBar";
import { useCats } from "../../utils/DataContext";
import { Cat } from "../../utils/types";

export default function CatsPage() {
  const { cats, loading, error } = useCats();
  const [filteredCats, setFilteredCats] = useState(cats);

  // Aggiorna i risultati filtrati quando i gatti cambiano
  useEffect(() => {
    setFilteredCats(cats);
  }, [cats]);

  const handleSearchResults = useCallback((results: Cat[]) => {
    setFilteredCats(results);
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

  // Paginazione rimossa - mostriamo tutti i risultati per migliorare l'esperienza utente

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

        // Mostra tutti i gatti filtrati senza paginazione
        return <CatGrid cats={filteredCats} />;
      })()}
    </main>
  );
}
