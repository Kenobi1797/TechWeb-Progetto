"use client";
import React, { useState } from "react";
import useSWR from "swr";

import CatGrid from "../../components/CatGrid";
import { fetchCats } from "../../utils/ServerConnect";

export default function CatsPage() {

  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const { data: cats, error, isLoading } = useSWR(["cats", page], () => fetchCats(page, pageSize), { refreshInterval: 30000 });

  if (isLoading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">Errore nel caricamento degli avvistamenti.</div>;
  if (!cats) return null;

  // Supponiamo che il backend restituisca solo la pagina richiesta, quindi non serve slice
  const pagedCats = cats;
  // Se vuoi mostrare il totale delle pagine, serve un endpoint che restituisca il totale
  // Per ora lo nascondiamo, ma lasciamo la logica di navigazione
  const totalPages = cats.length === pageSize ? page + 1 : page;

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
