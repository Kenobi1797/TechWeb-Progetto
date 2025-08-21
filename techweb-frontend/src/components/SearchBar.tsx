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
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
            title="Cancella ricerca"
          >
            <span className="text-gray-400 hover:text-gray-600">✕</span>
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="mt-2 text-sm text-gray-600">
          Risultati della ricerca per &ldquo;{searchTerm}&rdquo;
        </div>
      )}
    </div>
  );
}
