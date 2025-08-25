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
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
      <div className="flex flex-col gap-3">
        {/* Barra di ricerca principale compatta */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Campo di ricerca */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-lg">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Cerca gatti..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange({ searchText: e.target.value })}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
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

            {/* Ordinamento rapido */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'date' | 'title' | 'location' | 'relevance' })}
                className="px-3 py-2 border rounded-lg text-sm min-w-[140px]"
                style={{ 
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-primary)"
                }}
              >
                <option value="date">📅 Più recenti</option>
                <option value="relevance">🎯 Rilevanza</option>
                <option value="title">🔤 A-Z</option>
                <option value="location">📍 Posizione</option>
              </select>

              {/* Pulsante filtri avanzati */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  hasActiveFilters ? 'border-orange-400 bg-orange-50' : ''
                }`}
                style={{ 
                  borderColor: hasActiveFilters ? "var(--color-accent)" : "var(--color-border)",
                  background: hasActiveFilters ? "var(--color-accent)" : "var(--color-surface)",
                  color: "var(--color-text-primary)"
                }}
              >
                🎛️ Filtri {hasActiveFilters && '●'}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                  title="Cancella tutti i filtri"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtri avanzati collassabili */}
        {showAdvancedFilters && (
          <div className="card p-4 border-l-4" style={{ borderLeftColor: "var(--color-accent)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="location" className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Città:
                </label>
                <select
                  id="location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange({ location: e.target.value })}
                  className="w-full text-sm"
                >
                  <option value="">🌍 Tutte</option>
                  {availableLocations.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="dateRange" className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Periodo:
                </label>
                <select
                  id="dateRange"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange({ dateRange: e.target.value as 'all' | 'today' | 'week' | 'month' })}
                  className="w-full text-sm"
                >
                  <option value="all">🕒 Tutti</option>
                  <option value="today">📆 Oggi</option>
                  <option value="week">📅 Settimana</option>
                  <option value="month">🗓️ Mese</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
                  Stato:
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value as 'all' | 'active' | 'adopted' | 'moved' })}
                  className="w-full text-sm"
                >
                  <option value="all">📊 Tutti</option>
                  <option value="active">🐾 Attivo</option>
                  <option value="adopted">🏠 Adottato</option>
                  <option value="moved">📍 Spostato</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Indicatore risultati compatto */}
        {resultCount !== undefined && (
          <div className="flex items-center justify-between text-sm px-2">
            <span style={{ color: "var(--color-text-secondary)" }}>
              {hasActiveFilters ? '🎯 Filtrato:' : '📊 Totale:'} 
              <span className="font-medium ml-1" style={{ color: "var(--color-primary)" }}>
                {resultCount} risultat{resultCount !== 1 ? 'i' : 'o'}
              </span>
            </span>
            
            {/* Filtri attivi in forma compatta */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1">
                {filters.searchText && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    &ldquo;{filters.searchText}&rdquo;
                  </span>
                )}
                {filters.location && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    📍 {filters.location}
                  </span>
                )}
                {filters.dateRange !== 'all' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                    📅 {(() => {
                      switch (filters.dateRange) {
                        case 'today': return 'Oggi';
                        case 'week': return 'Settimana';
                        case 'month': return 'Mese';
                        default: return '';
                      }
                    })()}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                    {(() => {
                      switch (filters.status) {
                        case 'active': return '🐾 Attivo';
                        case 'adopted': return '🏠 Adottato';
                        case 'moved': return '📍 Spostato';
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
