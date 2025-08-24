"use client";
import { useState } from "react";
import { Cat } from "../utils/types";

interface SearchBarProps {
  readonly cats: Cat[];
  readonly onResults: (results: Cat[]) => void;
  readonly placeholder?: string;
}

export default function SearchBar({ cats, onResults, placeholder = "Cerca gatti per titolo o descrizione..." }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      onResults(cats);
      return;
    }

    const filtered = cats.filter(cat => 
      cat.title.toLowerCase().includes(term.toLowerCase()) ||
      cat.description?.toLowerCase().includes(term.toLowerCase())
    );
    
    onResults(filtered);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onResults(cats);
  };

  return (
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-12 border rounded-lg transition-colors"
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
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
            title="Cancella ricerca"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span className="text-lg hover:opacity-70">✕</span>
          </button>
        )}
      </div>
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
