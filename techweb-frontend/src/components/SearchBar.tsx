"use client";
import { useState, useEffect, useCallback } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly resultCount?: number;
}

interface FilterOptions {
  sortBy: 'title';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  customDateStart?: string;
  customDateEnd?: string;
  status: 'all' | 'active' | 'adopted' | 'moved';
}

export default function SearchBar({ cats, onResults, resultCount }: SearchBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'title',
    dateRange: 'all',
    customDateStart: undefined,
    customDateEnd: undefined,
    status: 'all'
  });

  // Apply filters function semplificata
  const applyFilters = useCallback((currentFilters: FilterOptions) => {
    let filtered = [...cats];

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
            filterDateStart = new Date(0); // Date molto antica se non specificata
          }
          if (currentFilters.customDateEnd) {
            filterDateEnd = new Date(currentFilters.customDateEnd);
            filterDateEnd.setHours(23, 59, 59, 999);
          } else {
            filterDateEnd = new Date(); // Oggi se non specificata
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

    // Ordinamento semplificato
    filtered.sort((a, b) => {
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
                          filters.status !== 'all';

  const formatDateRange = () => {
    if (filters.dateRange === 'custom') {
      const start = filters.customDateStart ? new Date(filters.customDateStart).toLocaleDateString('it-IT') : '';
      const end = filters.customDateEnd ? new Date(filters.customDateEnd).toLocaleDateString('it-IT') : '';
      if (start && end) return `${start} - ${end}`;
      if (start) return `da ${start}`;
      if (end) return `fino a ${end}`;
      return 'Range personalizzato';
    }
    return '';
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 px-1 sm:px-4">
        {/* Filtri rapidi con design migliorato */}
        <div className="rounded-xl border p-4" style={{ 
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--color-shadow)"
        }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Filtri
              </span>
              <div className="h-4 w-px" style={{ background: "var(--color-border)" }}></div>
            </div>
            
            {/* Ordinamento alfabetico */}
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 text-emerald-700 hover:from-emerald-200 hover:to-green-200 hover:shadow-md transform hover:scale-105">
              <span className="text-base">🔤</span>
              <span className="hidden sm:inline">Alfabetico</span>
            </button>
            
            {/* Status filters con design migliorato */}
            {['active', 'adopted', 'moved'].map(status => (
              <button
                key={status}
                onClick={() => handleFilterChange({ status: filters.status === status ? 'all' : status as 'active' | 'adopted' | 'moved' })}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.status === status 
                    ? 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 text-orange-700 shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <span className="text-base">
                  {status === 'active' && '🐾'}
                  {status === 'adopted' && '🏠'}
                  {status === 'moved' && '📍'}
                </span>
                <span className="hidden sm:inline">
                  {status === 'active' && 'Attivi'}
                  {status === 'adopted' && 'Adottati'}
                  {status === 'moved' && 'Spostati'}
                </span>
              </button>
            ))}
            
            <div className="h-4 w-px bg-gray-300"></div>
            
            {/* Date range filters con design migliorato */}
            {['today', 'week', 'month'].map(range => (
              <button
                key={range}
                onClick={() => handleFilterChange({ dateRange: filters.dateRange === range ? 'all' : range as 'today' | 'week' | 'month' })}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filters.dateRange === range 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 text-blue-700 shadow-md' 
                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <span className="text-base">
                  {range === 'today' && '📆'}
                  {range === 'week' && '📅'}
                  {range === 'month' && '🗓️'}
                </span>
                <span className="hidden sm:inline">
                  {range === 'today' && 'Oggi'}
                  {range === 'week' && 'Settimana'}
                  {range === 'month' && 'Mese'}
                </span>
              </button>
            ))}

            {/* Date picker personalizzato con design migliorato */}
            <button
              onClick={() => {
                if (filters.dateRange === 'custom') {
                  handleFilterChange({ dateRange: 'all', customDateStart: undefined, customDateEnd: undefined });
                } else {
                  handleFilterChange({ dateRange: 'custom' });
                }
              }}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                filters.dateRange === 'custom'
                  ? 'bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200 text-purple-700 shadow-md' 
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:shadow-sm'
              }`}
            >
              <span className="text-base">📊</span>
              <span className="hidden sm:inline">Range</span>
            </button>

            {/* Reset button con design migliorato */}
            {hasActiveFilters && (
              <>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={() => setFilters({ sortBy: 'title', dateRange: 'all', customDateStart: undefined, customDateEnd: undefined, status: 'all' })}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-600 hover:from-red-100 hover:to-pink-100 hover:shadow-md transform hover:scale-105"
                  title="Cancella tutti i filtri"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Date picker personalizzato con design migliorato */}
        {filters.dateRange === 'custom' && (
          <div className="rounded-xl border overflow-hidden" style={{ 
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--color-shadow)"
          }}>
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-4 py-3">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg">Seleziona Range di Date</h3>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date-start" className="block text-sm font-semibold text-purple-700">
                      📅 Data Inizio
                    </label>
                    <input
                      id="date-start"
                      type="date"
                      value={filters.customDateStart || ''}
                      onChange={(e) => handleFilterChange({ customDateStart: e.target.value || undefined })}
                      className="w-full px-4 py-3 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                      max={filters.customDateEnd || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="date-end" className="block text-sm font-semibold text-purple-700">
                      🏁 Data Fine
                    </label>
                    <input
                      id="date-end"
                      type="date"
                      value={filters.customDateEnd || ''}
                      onChange={(e) => handleFilterChange({ customDateEnd: e.target.value || undefined })}
                      className="w-full px-4 py-3 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white shadow-sm transition-all duration-200"
                      min={filters.customDateStart}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        handleFilterChange({ customDateStart: today, customDateEnd: today });
                      }}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
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
                      className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                    >
                      📅 Ultimi 7 giorni
                    </button>
                    <button
                      onClick={() => handleFilterChange({ customDateStart: undefined, customDateEnd: undefined })}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                      title="Cancella date"
                    >
                      🗑️ Cancella
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicatore risultati con design migliorato */}
        {resultCount !== undefined && (
          <div className="rounded-xl border p-4" style={{ 
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--color-shadow-light)"
          }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        {hasActiveFilters ? 'Risultati filtrati:' : 'Totale gatti:'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border" 
                            style={{ 
                              background: "var(--color-accent-light)", 
                              color: "var(--color-accent-dark)",
                              borderColor: "var(--color-accent)"
                            }}>
                        {resultCount}
                      </span>
                    </div>
                    {hasActiveFilters && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Filtri attivi applicati alla ricerca
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Filtri attivi migliorati */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium flex items-center" style={{ color: "var(--color-text-secondary)" }}>
                    Attivi:
                  </span>
                  
                  {filters.dateRange !== 'all' && (
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 text-xs font-medium border border-purple-200 shadow-sm">
                      <span>📅</span>
                      <span>
                        {(() => {
                          switch (filters.dateRange) {
                            case 'today': return 'Oggi';
                            case 'week': return 'Settimana';
                            case 'month': return 'Mese';
                            case 'custom': return formatDateRange();
                            default: return '';
                          }
                        })()}
                      </span>
                      <button
                        onClick={() => handleFilterChange({ dateRange: 'all', customDateStart: undefined, customDateEnd: undefined })}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors duration-150"
                        title="Rimuovi filtro data"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {filters.status !== 'all' && (
                    <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium border border-orange-200 shadow-sm">
                      <span>
                        {(() => {
                          switch (filters.status) {
                            case 'active': return '🐾';
                            case 'adopted': return '🏠';
                            case 'moved': return '📍';
                            default: return '🏷️';
                          }
                        })()}
                      </span>
                      <span>
                        {(() => {
                          switch (filters.status) {
                            case 'active': return 'Attivi';
                            case 'adopted': return 'Adottati';
                            case 'moved': return 'Spostati';
                            default: return '';
                          }
                        })()}
                      </span>
                      <button
                        onClick={() => handleFilterChange({ status: 'all' })}
                        className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors duration-150"
                        title="Rimuovi filtro status"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
