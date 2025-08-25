"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../utils/useAuth";
import { fetchUserCats, updateCatStatus, updateCat } from "../../utils/ServerConnect";
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
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    image: null as File | null
  });
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

  const openEditModal = (cat: Cat) => {
    setEditingCat(cat);
    setEditForm({
      title: cat.title,
      description: cat.description || "",
      image: null
    });
  };

  const closeEditModal = () => {
    setEditingCat(null);
    setEditForm({
      title: "",
      description: "",
      image: null
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) {
      setError("Errore nell'identificazione dell'avvistamento");
      return;
    }

    try {
      setUpdatingCat(editingCat.id);
      const updatedCat = await updateCat(editingCat.id, {
        title: editForm.title,
        description: editForm.description,
        imageFile: editForm.image || undefined // Converti null in undefined
      });
      setCats(cats.map(cat => cat.id === editingCat.id ? updatedCat : cat));
      closeEditModal();
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore nell'aggiornamento dell'avvistamento");
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
                <div className="flex justify-between items-center mb-2">
                  <div className="block text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    Aggiorna stato:
                  </div>
                  <button
                    onClick={() => openEditModal(cat)}
                    className="text-sm px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    ✏️ Modifica
                  </button>
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

      {/* Modal di modifica */}
      {editingCat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                  Modifica avvistamento
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="editTitle" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                    Titolo
                  </label>
                  <input
                    id="editTitle"
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ 
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)"
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="editDescription" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                    Descrizione
                  </label>
                  <textarea
                    id="editDescription"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ 
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)"
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="editImage" className="block text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>
                    Nuova immagine (opzionale)
                  </label>
                  <input
                    id="editImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.files?.[0] || null })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ 
                      borderColor: "var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text)"
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Lascia vuoto per mantenere l&apos;immagine attuale
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    disabled={updatingCat === editingCat.id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingCat === editingCat.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        {' '}Salvando...
                      </span>
                    ) : (
                      'Salva modifiche'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
