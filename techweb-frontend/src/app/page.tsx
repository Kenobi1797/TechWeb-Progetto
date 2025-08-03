"use client";

import { useEffect, useState } from "react";
import { Cat } from "../utils/types";
import dynamic from "next/dynamic";
import CatGrid from "../components/CatGrid";
import { fetchCats, testBackendConnection } from "../utils/ServerConnect";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

export default function HomePage() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'ok'|'fail'|'loading'>('loading');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    testBackendConnection().then((ok) => {
      setBackendStatus(ok ? 'ok' : 'fail');
      if (ok) {
        fetchCats()
          .then(setCats)
          .catch(() => {
            setCats([]);
            setError("Errore nel caricamento degli avvistamenti.");
          })
          .finally(() => setLoading(false));
      } else {
        setError("Connessione al backend fallita.");
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">{error}</div>;
  if (backendStatus === 'fail') {
    return <div className="text-center py-10 text-red-600">Connessione al backend fallita.</div>;
  }

  // Paginazione
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
      <div className="mb-8">
        {pagedCats.length > 0 ? (
          <MapView
            markers={pagedCats.map((cat) => ({
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
          <div className="text-center py-10">Nessun dato disponibile per la mappa.</div>
        )}
      </div>
      <CatGrid cats={pagedCats} />
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
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
  );
}
