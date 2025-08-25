"use client";
import { useState, useEffect, useCallback } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly resultCount?: number;
}

interface FilterOptions {
  searchText: string;
  sortBy: 'date' | 'title' | 'location' | 'relevance';
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'active' | 'adopted' | 'moved';
  location: string;
}

export default function SearchBar({ cats, onResults, resultCount }: SearchBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    sortBy: 'date',
    dateRange: 'all',
    status: 'all',
    location: ''
  });

  // Estrai città uniche dai gatti per il filtro location
  const availableLocations = Array.from(new Set(
    cats.map(cat => {
      // Estrai la città dalla descrizione se presente
      const match = cat.description?.match(/\(([^)]+)\)$/);
      return match ? match[1] : '';
    }).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, 'it'));

  // Funzione per calcolare la rilevanza di un gatto rispetto al testo di ricerca
  const calculateRelevance = useCallback((cat: Cat, searchText: string): number => {
    if (!searchText) return 0;
    
    const lowerSearch = searchText.toLowerCase();
    let score = 0;
    
    // Punteggio per il titolo (peso maggiore)
    if (cat.title.toLowerCase().includes(lowerSearch)) {
      score += 10;
      if (cat.title.toLowerCase().startsWith(lowerSearch)) {
        score += 5; // Bonus se inizia con il termine
      }
    }
    
    // Punteggio per la descrizione
    if (cat.description?.toLowerCase().includes(lowerSearch)) {
      score += 5;
    }
    
    // Punteggio per la città nella descrizione
    const cityMatch = cat.description?.match(/\(([^)]+)\)$/);
    if (cityMatch?.[1]?.toLowerCase().includes(lowerSearch)) {
      score += 8;
    }
    
    // Punteggio per matches parziali nelle parole
    const words = lowerSearch.split(' ');
    words.forEach(word => {
      if (word.length >= 3) {
        if (cat.title.toLowerCase().includes(word)) score += 2;
        if (cat.description?.toLowerCase().includes(word)) score += 1;
      }
    });
    
    return score;
  }, []);

  // Apply filters function
  const applyFilters = useCallback((currentFilters: FilterOptions) => {
    let filtered = [...cats];

    // Filtro per testo di ricerca
    if (currentFilters.searchText.trim()) {
      const searchTerm = currentFilters.searchText.trim().toLowerCase();
      filtered = filtered.filter(cat => {
        const titleMatch = cat.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = cat.description?.toLowerCase().includes(searchTerm);
        const cityMatch = cat.description?.match(/\(([^)]+)\)$/)?.[1]?.toLowerCase().includes(searchTerm);
        return titleMatch || descriptionMatch || cityMatch;
      });
    }

    // Filtro per località
    if (currentFilters.location) {
      filtered = filtered.filter(cat => {
        const cityMatch = cat.description?.match(/\(([^)]+)\)$/);
        return cityMatch && cityMatch[1] === currentFilters.location;
      });
    }

    // Filtro per data
    if (currentFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (currentFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(cat => {
        const catDate = new Date(cat.createdAt);
        return catDate >= filterDate;
      });
    }

    // Filtro per status
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(cat => cat.status === currentFilters.status);
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'relevance': {
          if (!currentFilters.searchText.trim()) {
            // Se non c'è testo di ricerca, ordina per data
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          const scoreA = calculateRelevance(a, currentFilters.searchText);
          const scoreB = calculateRelevance(b, currentFilters.searchText);
          return scoreB - scoreA; // Ordinamento decrescente per rilevanza
        }
        case 'title':
          return a.title.localeCompare(b.title, 'it', { numeric: true });
        case 'location': {
          // Ordina per distanza dal centro (0,0) come proxy per posizione
          const distanceA = Math.sqrt(a.latitude ** 2 + a.longitude ** 2);
          const distanceB = Math.sqrt(b.latitude ** 2 + b.longitude ** 2);
          return distanceA - distanceB;
        }
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [cats, calculateRelevance]);

  // Applica i filtri quando cambiano i dati o i filtri
  useEffect(() => {
    const results = applyFilters(filters);
    onResults(results);
  }, [applyFilters, filters, onResults]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({ 
      searchText: '',
      sortBy: 'date', 
      dateRange: 'all', 
      status: 'all',
      location: ''
    });
  };

  const hasActiveFilters = filters.searchText.trim() !== '' || 
                          filters.dateRange !== 'all' || 
                          filters.status !== 'all' || 
                          filters.sortBy !== 'date' ||
                          filters.location !== '';

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6">
      <div className="flex flex-col gap-4">
        {/* Barra di ricerca principale */}
        <div className="card">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-xl">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Cerca per titolo, descrizione o città..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange({ searchText: e.target.value })}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)"
                }}
              />
              {filters.searchText && (
                <button
                  onClick={() => handleFilterChange({ searchText: '' })}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  aria-label="Cancella ricerca"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Pannello filtri sempre visibile */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: "var(--color-primary)" }}>
              🎛️ Filtri avanzati
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn btn-small btn-secondary"
              >
                Cancella tutto
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Ordina per:
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'date' | 'title' | 'location' | 'relevance' })}
                className="w-full"
              >
                <option value="date">📅 Data (più recenti)</option>
                <option value="relevance">🎯 Rilevanza</option>
                <option value="title">🔤 Titolo (A-Z)</option>
                <option value="location">📍 Posizione</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Città:
              </label>
              <select
                id="location"
                value={filters.location}
                onChange={(e) => handleFilterChange({ location: e.target.value })}
                className="w-full"
              >
                <option value="">🌍 Tutte le città</option>
                {availableLocations.map(city => (
                  <option key={city} value={city}>📍 {city}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Periodo:
              </label>
              <select
                id="dateRange"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as 'all' | 'today' | 'week' | 'month' })}
                className="w-full"
              >
                <option value="all">🕒 Tutti i periodi</option>
                <option value="today">📆 Oggi</option>
                <option value="week">📅 Ultima settimana</option>
                <option value="month">🗓️ Ultimo mese</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
                Stato:
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value as 'all' | 'active' | 'adopted' | 'moved' })}
                className="w-full"
              >
                <option value="all">📊 Tutti gli stati</option>
                <option value="active">🐾 Attivo</option>
                <option value="adopted">🏠 Adottato</option>
                <option value="moved">📍 Ha cambiato posto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Indicatore risultati */}
        {(hasActiveFilters || resultCount !== undefined) && (
          <div className="card border-2" style={{ borderColor: "var(--color-secondary)" }}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🎯</span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {hasActiveFilters ? 'Filtri applicati' : 'Tutti gli avvistamenti'}
                </span>
              </span>
              {resultCount !== undefined && (
                <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ 
                  background: "var(--color-accent)", 
                  color: "var(--color-primary)" 
                }}>
                  {resultCount} risultat{resultCount !== 1 ? 'i' : 'o'}
                </span>
              )}
            </div>
            
            {/* Mostra filtri attivi */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.searchText && (
                  <span className="text-xs px-2 py-1 rounded-md flex items-center gap-1" style={{ 
                    background: "var(--color-surface)", 
                    color: "var(--color-text-secondary)" 
                  }}>
                    🔍 &ldquo;{filters.searchText}&rdquo;
                    <button
                      onClick={() => handleFilterChange({ searchText: '' })}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label="Rimuovi filtro testo"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.location && (
                  <span className="text-xs px-2 py-1 rounded-md flex items-center gap-1" style={{ 
                    background: "var(--color-surface)", 
                    color: "var(--color-text-secondary)" 
                  }}>
                    📍 {filters.location}
                    <button
                      onClick={() => handleFilterChange({ location: '' })}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label="Rimuovi filtro città"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.dateRange !== 'all' && (
                  <span className="text-xs px-2 py-1 rounded-md flex items-center gap-1" style={{ 
                    background: "var(--color-surface)", 
                    color: "var(--color-text-secondary)" 
                  }}>
                    📅 {(() => {
                      switch (filters.dateRange) {
                        case 'today': return 'Oggi';
                        case 'week': return 'Ultima settimana';
                        case 'month': return 'Ultimo mese';
                        default: return '';
                      }
                    })()}
                    <button
                      onClick={() => handleFilterChange({ dateRange: 'all' })}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label="Rimuovi filtro data"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="text-xs px-2 py-1 rounded-md flex items-center gap-1" style={{ 
                    background: "var(--color-surface)", 
                    color: "var(--color-text-secondary)" 
                  }}>
                    📊 {(() => {
                      switch (filters.status) {
                        case 'active': return '🐾 Attivo';
                        case 'adopted': return '🏠 Adottato';
                        case 'moved': return '📍 Ha cambiato posto';
                        default: return '';
                      }
                    })()}
                    <button
                      onClick={() => handleFilterChange({ status: 'all' })}
                      className="ml-1 text-red-500 hover:text-red-700"
                      aria-label="Rimuovi filtro stato"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.sortBy !== 'date' && (
                  <span className="text-xs px-2 py-1 rounded-md" style={{ 
                    background: "var(--color-surface)", 
                    color: "var(--color-text-secondary)" 
                  }}>
                    ↕️ {(() => {
                      switch (filters.sortBy) {
                        case 'relevance': return 'Per rilevanza';
                        case 'title': return 'Per titolo';
                        case 'location': return 'Per posizione';
                        default: return '';
                      }
                    })()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
