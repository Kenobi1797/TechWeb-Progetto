"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../utils/useAuth";
import { fetchUserCats, updateCatStatus } from "../../utils/ServerConnect";
import { Cat } from "../../utils/types";
import CatCard from "../../components/CatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRouter } from "next/navigation";

const statusLabels = {
  active: { label: "Attivo", emoji: "🐾", color: "bg-green-100 text-green-800" },
  adopted: { label: "Adottato", emoji: "🏠", color: "bg-blue-100 text-blue-800" },
  moved: { label: "Ha cambiato posto", emoji: "📍", color: "bg-yellow-100 text-yellow-800" }
};

export default function MyListingsPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingCat, setUpdatingCat] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
      return;
    }

    if (isLoggedIn) {
      loadUserCats();
    }
  }, [isLoggedIn, authLoading, router]);

  const loadUserCats = async () => {
    try {
      setLoading(true);
      const userCats = await fetchUserCats();
      setCats(userCats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nel caricamento degli avvistamenti");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (catId: number, newStatus: 'active' | 'adopted' | 'moved') => {
    try {
      setUpdatingCat(catId);
      const updatedCat = await updateCatStatus(catId, newStatus);
      setCats(cats.map(cat => cat.id === catId ? updatedCat : cat));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'aggiornamento dello status");
    } finally {
      setUpdatingCat(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
        <LoadingSpinner size="lg" text="Caricamento avvistamenti..." />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Il redirect è gestito nell'useEffect
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
        <div className="text-center py-10">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadUserCats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
            I miei avvistamenti
          </h1>
          <p className="text-sm sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
            Gestisci i tuoi avvistamenti e aggiorna il loro stato
          </p>
        </div>
        <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {cats.length} avvistament{cats.length !== 1 ? 'i' : 'o'}
        </div>
      </div>

      {cats.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex flex-col items-center gap-3 p-6 rounded-lg" style={{ background: "var(--color-surface)" }}>
            <div className="text-4xl opacity-60">📝</div>
            <p className="font-semibold text-lg" style={{ color: "var(--color-text)" }}>
              Non hai ancora effettuato avvistamenti
            </p>
            <p className="text-sm opacity-75" style={{ color: "var(--color-text-secondary)" }}>
              Inizia a segnalare i gatti che incontri nella tua zona
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Segnala un avvistamento
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((cat) => (
            <div key={cat.id} className="relative">
              <CatCard cat={cat} showStatus={true} />

              {/* Status Update Controls */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                  Aggiorna stato:
                </div>
                <div className="flex gap-2">
                  {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(cat.id, status)}
                      disabled={cat.status === status || updatingCat === cat.id}
                      className={`flex-1 px-3 py-2 text-xs rounded-md font-medium transition-colors ${
                        cat.status === status
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {updatingCat === cat.id ? (
                        <span className="animate-spin">⏳</span>
                      ) : (
                        <>
                          <span className="mr-1">{statusLabels[status].emoji}</span>
                          {statusLabels[status].label}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
