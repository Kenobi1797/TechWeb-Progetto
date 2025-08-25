"use client";
import { useState, useEffect, useCallback } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly resultCount?: number;
}

interface FilterOptions {
  sortBy: 'date' | 'title' | 'location';
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'active' | 'adopted' | 'moved';
}

export default function SearchBar({ cats, onResults, resultCount }: SearchBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    dateRange: 'all',
    status: 'all'
  });

  // Apply filters function
  const applyFilters = useCallback((currentFilters: FilterOptions) => {
    let filtered = [...cats];

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
    
    onResults(filtered);
  }, [cats, onResults]);

  // Applica i filtri quando cambiano i dati o i filtri
  useEffect(() => {
    applyFilters(filters);
  }, [applyFilters, filters]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({ sortBy: 'date', dateRange: 'all', status: 'all' });
  };

  const hasActiveFilters = filters.dateRange !== 'all' || filters.status !== 'all' || filters.sortBy !== 'date';

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-6">
      <div className="flex flex-col gap-4">
        {/* Pannello filtri sempre visibile */}
        <div 
          className="p-6 rounded-lg border bg-white shadow-sm"
          style={{ 
            borderColor: "var(--color-border)",
            background: "var(--color-surface)"
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              🔍 Filtri di ricerca
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm px-3 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                Cancella filtri
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                Ordina per:
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'date' | 'title' | 'location' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ 
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                <option value="date">📅 Data (più recenti)</option>
                <option value="title">🔤 Titolo (A-Z)</option>
                <option value="location">📍 Posizione</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                Periodo:
              </label>
              <select
                id="dateRange"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange({ dateRange: e.target.value as 'all' | 'today' | 'week' | 'month' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ 
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
              >
                <option value="all">🕒 Tutti i periodi</option>
                <option value="today">📆 Oggi</option>
                <option value="week">📅 Ultima settimana</option>
                <option value="month">🗓️ Ultimo mese</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                Stato:
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value as 'all' | 'active' | 'adopted' | 'moved' })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ 
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text)"
                }}
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
          <div 
            className="px-4 py-3 rounded-lg border"
            style={{ 
              background: "rgba(108, 155, 207, 0.1)",
              borderColor: "rgba(108, 155, 207, 0.3)",
              color: "var(--color-text-secondary)"
            }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🎯</span>
                <span>
                  {hasActiveFilters ? 'Filtri applicati' : 'Tutti gli avvistamenti'}
                </span>
              </span>
              {resultCount !== undefined && (
                <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {resultCount} risultat{resultCount !== 1 ? 'i' : 'o'}
                </span>
              )}
            </div>
            
            {/* Mostra filtri attivi */}
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.dateRange !== 'all' && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                    📅 {(() => {
                      switch (filters.dateRange) {
                        case 'today': return 'Oggi';
                        case 'week': return 'Ultima settimana';
                        case 'month': return 'Ultimo mese';
                        default: return '';
                      }
                    })()}
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                    📊 {(() => {
                      switch (filters.status) {
                        case 'active': return '🐾 Attivo';
                        case 'adopted': return '🏠 Adottato';
                        case 'moved': return '📍 Ha cambiato posto';
                        default: return '';
                      }
                    })()}
                  </span>
                )}
                {filters.sortBy !== 'date' && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                    ↕️ {filters.sortBy === 'title' ? 'Per titolo' : 'Per posizione'}
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
