"use client";
import { useState, useEffect, useCallback } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly resultCount?: number;
}

interface FilterOptions {
  sortBy: 'title' | 'created_at';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  status: 'all' | 'active' | 'adopted' | 'moved';
  searchText?: string;
}

export default function SearchBar({ cats, onResults, resultCount }: SearchBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'created_at',
    dateRange: 'all',
    customDateStart: undefined,
    customDateEnd: undefined,
    status: 'all',
    searchText: ''
  });

  // Apply filters function migliorata
  const applyFilters = useCallback((currentFilters: FilterOptions) => {
    let filtered = [...cats];

    // Filtro per testo
    if (currentFilters.searchText?.trim()) {
      const searchLower = currentFilters.searchText.toLowerCase().trim();
      filtered = filtered.filter(cat => 
        cat.title?.toLowerCase().includes(searchLower) ||
        cat.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro per data
    if (currentFilters.dateRange !== 'all') {
      const now = new Date();
      let filterDateStart = new Date();
      let filterDateEnd = new Date();
      
      switch (currentFilters.dateRange) {
        case 'today':
          filterDateStart.setHours(0, 0, 0, 0);
          filterDateEnd.setHours(23, 59, 59, 999);
          break;
        case 'week':
          filterDateStart.setDate(now.getDate() - 7);
          filterDateStart.setHours(0, 0, 0, 0);
          filterDateEnd.setHours(23, 59, 59, 999);
          break;
        case 'month':
          filterDateStart.setMonth(now.getMonth() - 1);
          filterDateStart.setHours(0, 0, 0, 0);
          filterDateEnd.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          if (currentFilters.customDateStart) {
            filterDateStart = new Date(currentFilters.customDateStart);
            filterDateStart.setHours(0, 0, 0, 0);
          } else {
            filterDateStart = new Date(0);
          }
          if (currentFilters.customDateEnd) {
            filterDateEnd = new Date(currentFilters.customDateEnd);
            filterDateEnd.setHours(23, 59, 59, 999);
          } else {
            filterDateEnd = new Date();
            filterDateEnd.setHours(23, 59, 59, 999);
          }
          break;
      }
      
      filtered = filtered.filter(cat => {
        const catDate = new Date(cat.createdAt);
        return catDate >= filterDateStart && catDate <= filterDateEnd;
      });
    }

    // Filtro per status
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(cat => cat.status === currentFilters.status);
    }

    // Ordinamento migliorato
    filtered.sort((a, b) => {
      if (currentFilters.sortBy === 'created_at') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title, 'it', { numeric: true });
    });
    
    return filtered;
  }, [cats]);

  // Applica i filtri quando cambiano i dati o i filtri
  useEffect(() => {
    const results = applyFilters(filters);
    onResults(results);
  }, [applyFilters, filters, onResults]);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const hasActiveFilters = filters.dateRange !== 'all' || 
                          filters.status !== 'all' || 
                          (filters.searchText?.trim().length ?? 0) > 0;

  const clearAllFilters = () => {
    setFilters({
      sortBy: 'created_at',
      dateRange: 'all',
      customDateStart: undefined,
      customDateEnd: undefined,
      status: 'all',
      searchText: ''
    });
  };

  return (
    <div className="mb-6">
      {/* Barra di ricerca principale elegante */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="🔍 Cerca gatti per nome, descrizione..."
            value={filters.searchText || ''}
            onChange={(e) => handleFilterChange({ searchText: e.target.value })}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 transition-all duration-300 focus:ring-4 focus:ring-offset-1 text-lg placeholder-opacity-70"
            style={{
              background: "var(--color-surface)",
              borderColor: filters.searchText ? "var(--color-primary)" : "var(--color-border)",
              color: "var(--color-text-primary)",
              boxShadow: filters.searchText ? "var(--color-shadow)" : "var(--color-shadow-light)"
            }}
          />
          {filters.searchText && (
            <button
              onClick={() => handleFilterChange({ searchText: '' })}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
              title="Cancella ricerca"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200" 
                   style={{ background: "var(--color-error)", color: "white" }}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Filtri ultra-compatti e moderni */}
      <div className="rounded-2xl border-2 p-3" style={{ 
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--color-shadow-light)"
      }}>
        <div className="flex flex-wrap items-center gap-2">
          {/* Ordinamento elegante */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Ordina:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'title' | 'created_at' })}
              className="px-3 py-1.5 rounded-xl border text-sm transition-all duration-200 focus:ring-2"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)"
              }}
            >
              <option value="created_at">🕒 Recenti</option>
              <option value="title">🔤 A-Z</option>
            </select>
          </div>

          <div className="h-6 w-px" style={{ background: "var(--color-border)" }}></div>

          {/* Status filters super compatti */}
          {(['active', 'adopted', 'moved'] as const).map(status => (
            <button
              key={status}
              onClick={() => handleFilterChange({ status: filters.status === status ? 'all' : status })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.status === status ? 'scale-105 shadow-lg' : 'hover:scale-105'
              }`}
              style={{
                background: filters.status === status 
                  ? 'var(--color-primary)' 
                  : 'var(--color-surface)',
                color: filters.status === status 
                  ? 'white' 
                  : 'var(--color-text-primary)',
                border: `2px solid ${filters.status === status ? 'var(--color-primary)' : 'var(--color-border)'}`
              }}
            >
              <span className="text-base">
                {status === 'active' && '🐾'}
                {status === 'adopted' && '🏠'}
                {status === 'moved' && '📍'}
              </span>
              <span className="hidden sm:inline font-semibold">
                {status === 'active' && 'Attivi'}
                {status === 'adopted' && 'Adottati'}
                {status === 'moved' && 'Spostati'}
              </span>
            </button>
          ))}

          <div className="h-6 w-px" style={{ background: "var(--color-border)" }}></div>

          {/* Date filters eleganti */}
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => handleFilterChange({ dateRange: filters.dateRange === range ? 'all' : range })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                filters.dateRange === range ? 'scale-105 shadow-lg' : 'hover:scale-105'
              }`}
              style={{
                background: filters.dateRange === range 
                  ? 'var(--color-secondary)' 
                  : 'var(--color-surface)',
                color: filters.dateRange === range 
                  ? 'white' 
                  : 'var(--color-text-primary)',
                border: `2px solid ${filters.dateRange === range ? 'var(--color-secondary)' : 'var(--color-border)'}`
              }}
            >
              <span className="text-base">
                {range === 'today' && '📆'}
                {range === 'week' && '📅'}
                {range === 'month' && '🗓️'}
              </span>
              <span className="hidden sm:inline font-semibold">
                {range === 'today' && 'Oggi'}
                {range === 'week' && '7gg'}
                {range === 'month' && '30gg'}
              </span>
            </button>
          ))}

          {/* Custom date range premium */}
          <button
            onClick={() => {
              if (filters.dateRange === 'custom') {
                handleFilterChange({ dateRange: 'all', customDateStart: undefined, customDateEnd: undefined });
              } else {
                handleFilterChange({ dateRange: 'custom' });
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              filters.dateRange === 'custom' ? 'scale-105 shadow-lg' : 'hover:scale-105'
            }`}
            style={{
              background: filters.dateRange === 'custom' 
                ? 'var(--color-accent)' 
                : 'var(--color-surface)',
              color: filters.dateRange === 'custom' 
                ? 'white' 
                : 'var(--color-text-primary)',
              border: `2px solid ${filters.dateRange === 'custom' ? 'var(--color-accent)' : 'var(--color-border)'}`
            }}
          >
            <span className="text-base">🗓️</span>
            <span className="hidden sm:inline font-semibold">Range</span>
          </button>

          {/* Reset button premium */}
          {hasActiveFilters && (
            <>
              <div className="h-6 w-px" style={{ background: "var(--color-border)" }}></div>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-110 shadow-md"
                style={{
                  background: "var(--color-error)",
                  color: "white",
                  border: "2px solid var(--color-error)"
                }}
                title="Cancella tutti i filtri"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline font-semibold">Reset</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Custom date picker ultra-compatto */}
      {filters.dateRange === 'custom' && (
        <div className="mt-4 rounded-2xl border-2" style={{ 
          background: "var(--color-surface)",
          borderColor: "var(--color-accent)",
          boxShadow: "var(--color-shadow)"
        }}>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--color-accent)" }}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg" style={{ color: "var(--color-text-primary)" }}>Range Personalizzato</h3>
            </div>
            
            <div className="space-y-3">
              {/* Date inputs eleganti */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="date-start" className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    📅 Data Inizio
                  </label>
                  <input
                    id="date-start"
                    type="date"
                    value={filters.customDateStart || ''}
                    onChange={(e) => handleFilterChange({ customDateStart: e.target.value || undefined })}
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 transition-all duration-200 focus:ring-4"
                    style={{ 
                      background: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)"
                    }}
                    max={filters.customDateEnd || new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="date-end" className="block text-sm font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>
                    🏁 Data Fine
                  </label>
                  <input
                    id="date-end"
                    type="date"
                    value={filters.customDateEnd || ''}
                    onChange={(e) => handleFilterChange({ customDateEnd: e.target.value || undefined })}
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 transition-all duration-200 focus:ring-4"
                    style={{ 
                      background: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)"
                    }}
                    min={filters.customDateStart}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              {/* Quick action buttons premium */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    handleFilterChange({ customDateStart: today, customDateEnd: today });
                  }}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ 
                    background: "var(--color-primary)",
                    color: "white"
                  }}
                >
                  📆 Oggi
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    handleFilterChange({ 
                      customDateStart: weekAgo.toISOString().split('T')[0], 
                      customDateEnd: today.toISOString().split('T')[0] 
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ 
                    background: "var(--color-secondary)",
                    color: "white"
                  }}
                >
                  📅 7 giorni
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    handleFilterChange({ 
                      customDateStart: monthAgo.toISOString().split('T')[0], 
                      customDateEnd: today.toISOString().split('T')[0] 
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ 
                    background: "var(--color-accent)",
                    color: "white"
                  }}
                >
                  🗓️ 30 giorni
                </button>
                <button
                  onClick={() => handleFilterChange({ customDateStart: undefined, customDateEnd: undefined })}
                  className="px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-md"
                  style={{ 
                    background: "var(--color-surface)",
                    color: "var(--color-text-secondary)",
                    border: `2px solid var(--color-border)`
                  }}
                  title="Cancella date"
                >
                  🗑️ Cancella
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicatore risultati premium */}
      {resultCount !== undefined && (
        <div className="mt-4 rounded-2xl border-2 p-4" style={{ 
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--color-shadow-light)"
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                   style={{ background: "var(--color-primary)" }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {resultCount} {resultCount === 1 ? 'gatto' : 'gatti'}
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {hasActiveFilters ? 'Risultati filtrati' : 'Totale avvistamenti'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
