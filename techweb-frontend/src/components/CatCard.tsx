import Image from "next/image";
import Link from "next/link";
import { Cat } from "../utils/types";
import { useEffect, useState } from "react";
import { fetchLocationFromCoordsServer } from "../utils/ServerConnect";

// Tipizzazione globale per la cache geocoding su window
declare global {
  interface Window {
    _geoCache?: Record<string, string | null>;
  }
}

interface CatCardProps {
  readonly cat: Cat;
  readonly showStatus?: boolean;
}

const statusLabels = {
  active: { label: "Attivo", emoji: "🐾", color: "bg-green-100 text-green-800" },
  adopted: { label: "Adottato", emoji: "🏠", color: "bg-blue-100 text-blue-800" },
  moved: { label: "Ha cambiato posto", emoji: "📍", color: "bg-yellow-100 text-yellow-800" }
};

// Funzioni helper per il rendering - ottimizzate per layout compatto
function getRichContentImageHeight() {
  return 'h-36 sm:h-40';
}

function getStandardImageHeight() {
  return 'h-32 sm:h-36';
}

function getMinimalPlaceholderHeight() {
  return 'h-20';
}

function getStandardPlaceholderHeight() {
  return 'h-24';
}

function getTitleSize(titleLength: number) {
  return titleLength > 25 ? 'text-sm sm:text-base' : 'text-base sm:text-lg';
}

function getRichContentLineClamp() {
  return 'line-clamp-2';
}

function getMinimalContentLineClamp() {
  return 'line-clamp-1';
}

function getStandardLineClamp() {
  return 'line-clamp-2';
}

function formatLocation(location: string | null, cat: Cat) {
  if (typeof cat.latitude === "number" && typeof cat.longitude === "number" && location === null) {
    return "📍 Caricamento...";
  }
  if (location) {
    return `📍 ${location.length > 20 ? location.substring(0, 20) + '...' : location}`;
  }
  if (typeof cat.latitude === "number" && typeof cat.longitude === "number") {
    return `📍 ${cat.latitude.toFixed(2)}, ${cat.longitude.toFixed(2)}`;
  }
  return "📍 Non disponibile";
}

export default function CatCard({ cat, showStatus = false }: CatCardProps) {
  // Funzione dinamica per il troncamento basata sulla lunghezza del titolo - ottimizzata
  const getDescriptionMaxLength = (title: string) => {
    if (title.length > 30) return 40;  // Titolo lungo = descrizione molto corta
    if (title.length > 15) return 60;  // Titolo medio = descrizione corta
    return 80; // Titolo corto = descrizione media
  };

  const truncateDescription = (text: string | null, title: string) => {
    if (!text) return null;
    const maxLength = getDescriptionMaxLength(title);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Determina se la card ha contenuto ricco (immagine + descrizione lunga) - ottimizzato
  const hasImage = cat.imageUrl;
  const hasRichContent = hasImage && cat.description && cat.description.length > 30;
  const hasMinimalContent = !hasImage && (!cat.description || cat.description.length < 20);

  // Calcola l'altezza minima dinamicamente - più compatto, considerando possibili immagini nel markdown
  const getCardHeight = () => {
    if (hasRichContent) return 'min-h-[260px]'; // Più spazio per possibili immagini markdown
    if (hasMinimalContent) return 'min-h-[140px]';
    return 'min-h-[200px]'; // Leggermente più alto per il bottone dettagli
  };

  // Calcola la classe per il line clamp
  const getLineClampClass = () => {
    if (hasRichContent) return getRichContentLineClamp();
    if (hasMinimalContent) return getMinimalContentLineClamp();
    return getStandardLineClamp();
  };

  // Cache geocoding in memoria (valida per la sessione)
  const [location, setLocation] = useState<string | null>(null);
  useEffect(() => {
    if (typeof cat.latitude === "number" && typeof cat.longitude === "number") {
      const key = `${cat.latitude},${cat.longitude}`;
      const geoCache = (globalThis as any)._geoCache;
      if (geoCache?.[key]) {
        setLocation(geoCache[key] ?? null);
        return;
      }
      
      // Ritarda il geocoding per evitare troppe richieste simultanee
      const timeoutId = setTimeout(() => {
        fetchLocationFromCoordsServer(cat.latitude, cat.longitude)
          .then(loc => {
            setLocation(loc);
            if (!loc) {
              console.warn(`Geocoding fallito per coordinate: ${cat.latitude}, ${cat.longitude}`);
            }
            const cache = globalThis as any;
            cache._geoCache ??= {};
            cache._geoCache[key] = loc;
          })
          .catch(err => {
            console.error("Errore geocoding:", err);
            setLocation(null);
          });
      }, Math.random() * 2000); // Ritardo casuale fino a 2 secondi
      
      return () => clearTimeout(timeoutId);
    }
  }, [cat.latitude, cat.longitude]);

  return (
    <article
      className={`cat-card group rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border flex flex-col overflow-hidden w-full transform hover:scale-[1.02] focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-blue-400 ${getCardHeight()}`}
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      <div className={`relative overflow-hidden ${hasImage ? 'flex-shrink-0' : ''}`}>
        {hasImage ? (
          <div className="relative group">
            <Image
              src={cat.imageUrl || ''}
              alt={cat.title}
              width={300}
              height={hasRichContent ? 160 : 140}
              className={`w-full object-cover transition-transform duration-200 group-hover:scale-105 ${hasRichContent ? getRichContentImageHeight() : getStandardImageHeight()}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
        ) : (
          <div className={`bg-gradient-to-br from-gray-100 to-gray-200 w-full flex items-center justify-center text-gray-400 ${hasMinimalContent ? getMinimalPlaceholderHeight() : getStandardPlaceholderHeight()}`}>
            <div className="text-center">
              <div className="text-2xl mb-0.5">🐱</div>
              <div className="text-xs">Nessuna immagine</div>
            </div>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm">
          {new Date(cat.createdAt).toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </div>
        {showStatus && cat.status !== 'active' && (
          <div className="absolute top-1.5 left-1.5">
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-medium ${statusLabels[cat.status].color}`}>
              <span className="text-xs">{statusLabels[cat.status].emoji}</span>
              <span className="hidden sm:inline">{statusLabels[cat.status].label}</span>
            </span>
          </div>
        )}
      </div>
      
      <div className={`p-2 sm:p-3 flex flex-col flex-grow ${hasMinimalContent ? 'justify-center' : ''}`}>
        <h3 className={`font-bold mb-1.5 leading-tight ${getTitleSize(cat.title.length)}`} style={{ color: "var(--color-primary)" }}>
          {cat.title}
        </h3>
        
        {cat.description && (
          <p className={`text-xs sm:text-sm mb-2 flex-grow leading-relaxed ${getLineClampClass()}`} style={{ color: "var(--color-text-secondary)" }}>
            {truncateDescription(cat.description, cat.title)}
          </p>
        )}
        
        <div className={`flex items-center justify-between mt-auto pt-2 border-t ${
          hasMinimalContent ? 'pt-1.5' : 'pt-2'
        }`} style={{ borderColor: "var(--color-border)" }}>
          <span className="text-xs opacity-75 flex-1 mr-2 truncate" style={{ color: "var(--color-text-secondary)" }}>
            {formatLocation(location, cat)}
          </span>
          <Link
            href={`/cats/${cat.id}`}
            className="inline-flex items-center gap-1 font-semibold text-xs sm:text-sm px-2 py-1 rounded-md transition-all hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400 flex-shrink-0"
            style={{ color: "var(--color-secondary)" }}
            aria-label={`Visualizza dettagli di ${cat.title}`}
          >
            <span className="hidden sm:inline">Dettagli</span>
            <span className="sm:hidden">→</span>
            <span className="hidden sm:inline transform transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
