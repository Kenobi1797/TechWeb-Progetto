"use client";
import React, { useState } from "react";
import CatGrid from "../../components/CatGrid";
import { useCats } from "../../contexts/DataContext";

export default function CatsPage() {
  const { cats, loading, error } = useCats();
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">Errore nel caricamento degli avvistamenti.</div>;
  if (!cats || cats.length === 0) return <div className="text-center py-10">Nessun gatto trovato.</div>;

  // Paginazione locale sui dati cache
  const totalPages = Math.ceil(cats.length / pageSize);
  const pagedCats = cats.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Gatti
      </h1>
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
    </main>
  );
}
