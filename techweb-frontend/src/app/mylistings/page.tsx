"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    image: null as File | null
  });
  const router = useRouter();

  // Filtri e ordinamento
  const filteredAndSortedCats = useMemo(() => {
    let filtered = cats;

    // Filtro per status
    if (filterStatus !== "all") {
      filtered = filtered.filter(cat => cat.status === filterStatus);
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cats, filterStatus, sortBy]);

  const statusCounts = useMemo(() => {
    const counts = { all: cats.length, active: 0, adopted: 0, moved: 0 };
    cats.forEach(cat => {
      counts[cat.status as keyof typeof counts]++;
    });
    return counts;
  }, [cats]);

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
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🐾</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                  I miei avvistamenti
                </h1>
                <p className="text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>
                  Gestisci e monitora tutti i tuoi avvistamenti
                </p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-blue-600 text-xs font-medium uppercase tracking-wide">Totali</div>
                <div className="text-blue-900 text-xl font-bold">{statusCounts.all}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-green-600 text-xs font-medium uppercase tracking-wide">Attivi</div>
                <div className="text-green-900 text-xl font-bold">{statusCounts.active}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <div className="text-yellow-600 text-xs font-medium uppercase tracking-wide">Trasferiti</div>
                <div className="text-yellow-900 text-xl font-bold">{statusCounts.moved}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="text-blue-600 text-xs font-medium uppercase tracking-wide">Adottati</div>
                <div className="text-blue-900 text-xl font-bold">{statusCounts.adopted}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/upload')}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-lg">+</span>{' '}
            Nuovo avvistamento
          </button>
        </div>
      </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <h3 className="text-lg font-semibold text-gray-800">Filtra avvistamenti</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">🐾 Attivi</option>
                  <option value="adopted">🏠 Adottati</option>
                  <option value="moved">📍 Trasferiti</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <span className="text-gray-400">▼</span>
                </div>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                >
                  <option value="newest">Più recenti</option>
                  <option value="oldest">Più vecchi</option>
                  <option value="title">Per titolo</option>
                  <option value="status">Per stato</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <span className="text-gray-400">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Display */}
          {filterStatus !== "all" && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtro attivo:</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusLabels[filterStatus as keyof typeof statusLabels]?.color}`}>
                  {statusLabels[filterStatus as keyof typeof statusLabels]?.emoji} {statusLabels[filterStatus as keyof typeof statusLabels]?.label}
                  <button
                    onClick={() => setFilterStatus("all")}
                    className="ml-1 text-current hover:opacity-75"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        {filteredAndSortedCats.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-4xl opacity-60">
                    {cats.length === 0 ? "📝" : "🔍"}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-xl text-gray-900">
                    {cats.length === 0 
                      ? "Non hai ancora effettuato avvistamenti" 
                      : "Nessun risultato trovato"
                    }
                  </h3>
                  <p className="text-gray-600">
                    {cats.length === 0 
                      ? "Inizia a segnalare i gatti che incontri nella tua zona" 
                      : "Prova a modificare i filtri di ricerca"
                    }
                  </p>
                </div>
                {cats.length === 0 && (
                  <button
                    onClick={() => router.push('/upload')}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Segnala il tuo primo avvistamento
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredAndSortedCats.length} avvistament{filteredAndSortedCats.length !== 1 ? 'i' : 'o'} 
                {filterStatus !== "all" ? " trovati" : ""}
              </h2>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCats.map((cat) => (
                <div key={cat.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CatCard cat={cat} showStatus={true} />

                  {/* Improved Management Section */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    {/* Header with Edit Button */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="text-sm font-semibold text-gray-800">Gestione Avvistamento</span>
                      </div>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors font-medium"
                      >
                        <span className="text-xs">✏️</span>{' '}
                        Modifica
                      </button>
                    </div>
                    
                    {/* Current Status Display */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Stato Attuale</span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${statusLabels[cat.status].color}`}>
                        <span>{statusLabels[cat.status].emoji}</span>
                        {statusLabels[cat.status].label}
                      </div>
                    </div>

                    {/* Status Update Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Aggiorna Stato</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>)
                          .filter(status => status !== cat.status)
                          .map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(cat.id, status)}
                            disabled={updatingCat === cat.id}
                            className="flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-2">
                              <span>{statusLabels[status].emoji}</span>
                              <span className="font-medium text-gray-700">Segna come {statusLabels[status].label}</span>
                            </div>
                            {updatingCat === cat.id ? (
                              <span className="animate-spin text-blue-500">⏳</span>
                            ) : (
                              <span className="text-gray-400 text-xs">→</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Creato {new Date(cat.createdAt).toLocaleDateString('it-IT')}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/cats/${cat.id}`)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Visualizza
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Enhanced Edit Modal */}
      {editingCat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              {/* Modal Header */}
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
                {/* Title Field */}
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

                {/* Description Field */}
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

                {/* Image Field */}
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

                {/* Error Display */}
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
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
                    disabled={updatingCat === editingCat?.id}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingCat === editingCat?.id ? (
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
