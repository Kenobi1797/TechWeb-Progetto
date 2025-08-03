"use client";
import { useEffect, useState } from "react";
import { Cat } from "../../utils/types";
import CatGrid from "../../components/CatGrid";
import { fetchCats } from "../../utils/ServerConnect";

export default function CatsPage() {

  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setLoading(true);
    fetchCats()
      .then(setCats)
      .catch(() => {
        setCats([]);
        setError("Errore nel caricamento degli avvistamenti.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">{error}</div>;

  const totalPages = Math.ceil(cats.length / pageSize);
  const pagedCats = cats.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Gatti
      </h1>
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
    </main>
  );
}
