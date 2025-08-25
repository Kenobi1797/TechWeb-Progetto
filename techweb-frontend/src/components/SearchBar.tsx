"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly placeholder?: string;
}

interface FilterOptions {
  sortBy: 'date' | 'title' | 'location';
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'active' | 'adopted' | 'moved';
}

export default function SearchBar({ cats, onResults, placeholder = "Cerca gatti per titolo o descrizione..." }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    dateRange: 'all',
    status: 'all'
  });

  // Apply filters function
  const applyFilters = useCallback((term: string, currentFilters: FilterOptions) => {
    let filtered = [...cats];
    
    // Filtro per testo
    if (term.trim()) {
      filtered = filtered.filter(cat => 
        cat.title.toLowerCase().includes(term.toLowerCase()) ||
        cat.description?.toLowerCase().includes(term.toLowerCase())
      );
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
      
      filtered = filtered.filter(cat => 
        new Date(cat.createdAt) >= filterDate
      );
    }

    // Filtro per status
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(cat => cat.status === currentFilters.status);
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'location':
          return a.latitude - b.latitude; // Ordina per latitudine come proxy per posizione
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    onResults(filtered);
  }, [cats, onResults]);

  // Debounced search
  const debouncedSearch = useCallback((term: string, currentFilters: FilterOptions) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      applyFilters(term, currentFilters);
    }, 300); // 300ms debounce
  }, [applyFilters]);

  // Generate suggestions based on existing cat data
  const generateSuggestions = useCallback((term: string) => {
    if (!term.trim() || term.length < 2) {
      setSuggestions([]);
      return;
    }

    const uniqueSuggestions = new Set<string>();
    const lowerTerm = term.toLowerCase();

    cats.forEach(cat => {
      // Add title suggestions
      if (cat.title.toLowerCase().includes(lowerTerm)) {
        uniqueSuggestions.add(cat.title);
      }
      
      // Add description word suggestions
      if (cat.description) {
        const words = cat.description.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length > 3 && word.includes(lowerTerm)) {
            uniqueSuggestions.add(word);
          }
        });
      }
    });

    setSuggestions(Array.from(uniqueSuggestions).slice(0, 5));
  }, [cats]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    generateSuggestions(term);
    
    if (term.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    debouncedSearch(term, filters);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    applyFilters(suggestion, filters);
  };

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    applyFilters(searchTerm, updatedFilters);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilters({ sortBy: 'date', dateRange: 'all', status: 'all' });
    onResults(cats);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-6">
      <div className="flex flex-col gap-4">
        {/* Barra di ricerca principale */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchTerm.length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-16 border rounded-lg transition-colors focus:outline-none focus:ring-2"
            style={{ 
              borderRadius: "var(--radius)",
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text-primary)"
            }}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-lg" style={{ color: "var(--color-text-secondary)" }}>🔍</span>
          </div>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-md transition-colors hover:bg-gray-100"
              title="Filtri di ricerca"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span className="text-lg">⚙️</span>
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="p-2 rounded-md transition-colors hover:bg-gray-100"
                title="Cancella ricerca"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span className="text-lg hover:opacity-70">✕</span>
              </button>
            )}
          </div>

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1"
              style={{ 
                background: "var(--color-surface)",
                borderColor: "var(--color-border)"
              }}
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    index === activeSuggestion ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{ 
                    color: "var(--color-text)",
                    backgroundColor: index === activeSuggestion ? "rgba(59, 130, 246, 0.1)" : undefined
                  }}
                >
                  <span className="text-gray-400 mr-2">🔍</span>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pannello filtri */}
        {showFilters && (
          <div 
            className="p-4 rounded-lg border bg-white shadow-sm"
            style={{ 
              borderColor: "var(--color-border)",
              background: "var(--color-surface)"
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="sortBy" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text)" }}>
                  Ordina per:
                </label>
                <select
                  id="sortBy"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as 'date' | 'title' | 'location' })}
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ 
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                >
                  <option value="date">Data (più recenti)</option>
                  <option value="title">Titolo (A-Z)</option>
                  <option value="location">Posizione</option>
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
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ 
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                >
                  <option value="all">Tutti i periodi</option>
                  <option value="today">Oggi</option>
                  <option value="week">Ultima settimana</option>
                  <option value="month">Ultimo mese</option>
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
                  className="w-full px-3 py-2 border rounded-md"
                  style={{ 
                    borderColor: "var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text)"
                  }}
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="active">🐾 Attivo</option>
                  <option value="adopted">🏠 Adottato</option>
                  <option value="moved">📍 Ha cambiato posto</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicatore risultati */}
      {searchTerm && (
        <div 
          className="mt-3 text-sm px-4 py-2 rounded-lg border"
          style={{ 
            background: "rgba(108, 155, 207, 0.1)",
            borderColor: "rgba(108, 155, 207, 0.3)",
            color: "var(--color-text-secondary)"
          }}
        >
          <span className="flex items-center gap-2">
            <span>🎯</span>
            <span>Risultati per &ldquo;<strong>{searchTerm}</strong>&rdquo;</span>
          </span>
        </div>
      )}
    </div>
  );
}
