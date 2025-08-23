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
}

// Funzioni helper per il rendering - refactored per SonarLint
function getRichContentImageHeight() {
  return 'h-48 sm:h-52';
}

function getStandardImageHeight() {
  return 'h-40 sm:h-44';
}

function getMinimalPlaceholderHeight() {
  return 'h-24';
}

function getStandardPlaceholderHeight() {
  return 'h-32';
}

function getTitleSize(titleLength: number) {
  return titleLength > 30 ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
}

function getRichContentLineClamp() {
  return 'line-clamp-4';
}

function getMinimalContentLineClamp() {
  return 'line-clamp-2';
}

function getStandardLineClamp() {
  return 'line-clamp-3';
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

export default function CatCard({ cat }: CatCardProps) {
  // Funzione dinamica per il troncamento basata sulla lunghezza del titolo
  const getDescriptionMaxLength = (title: string) => {
    if (title.length > 40) return 60;  // Titolo lungo = descrizione più corta
    if (title.length > 20) return 100; // Titolo medio = descrizione media
    return 140; // Titolo corto = descrizione più lunga
  };

  const truncateDescription = (text: string | null, title: string) => {
    if (!text) return null;
    const maxLength = getDescriptionMaxLength(title);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Determina se la card ha contenuto ricco (immagine + descrizione lunga)
  const hasRichContent = cat.imageUrl && cat.description && cat.description.length > 50;
  const hasMinimalContent = !cat.imageUrl && (!cat.description || cat.description.length < 30);

  // Calcola l'altezza minima dinamicamente
  const getCardHeight = () => {
    if (hasRichContent) return 'min-h-[320px]';
    if (hasMinimalContent) return 'min-h-[180px]';
    return 'min-h-[240px]';
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
      if (window._geoCache?.[key]) {
        setLocation(window._geoCache[key] ?? null);
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
            window._geoCache ??= {};
            window._geoCache[key] = loc;
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
      className={`cat-card group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border flex flex-col overflow-hidden w-full transform hover:scale-105 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${getCardHeight()}`}
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      <div className={`relative overflow-hidden ${cat.imageUrl ? 'flex-shrink-0' : ''}`}>
        {cat.imageUrl ? (
          <div className="relative group">
            <Image
              src={cat.imageUrl}
              alt={cat.title}
              width={400}
              height={hasRichContent ? 220 : 180}
              className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${hasRichContent ? getRichContentImageHeight() : getStandardImageHeight()}`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className={`bg-gradient-to-br from-gray-100 to-gray-200 w-full flex items-center justify-center text-gray-400 ${hasMinimalContent ? getMinimalPlaceholderHeight() : getStandardPlaceholderHeight()}`}>
            <div className="text-center">
              <div className="text-3xl mb-1">🐱</div>
              <div className="text-xs">Nessuna immagine</div>
            </div>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full shadow-lg">
          {new Date(cat.createdAt).toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </div>
      </div>
      
      <div className={`p-3 sm:p-4 flex flex-col flex-grow ${hasMinimalContent ? 'justify-center' : ''}`}>
        <h3 className={`font-bold mb-2 leading-tight ${getTitleSize(cat.title.length)}`} style={{ color: "var(--color-primary)" }}>
          {cat.title}
        </h3>
        
        {cat.description && (
          <p className={`text-sm mb-3 flex-grow leading-relaxed ${getLineClampClass()}`} style={{ color: "var(--color-text-secondary)" }}>
            {truncateDescription(cat.description, cat.title)}
          </p>
        )}
        
        <div className={`flex items-center justify-between mt-auto pt-3 border-t ${
          hasMinimalContent ? 'pt-2' : 'pt-3'
        }`} style={{ borderColor: "var(--color-border)" }}>
          <span className="text-xs opacity-75 flex-1 mr-2" style={{ color: "var(--color-text-secondary)" }}>
            {formatLocation(location, cat)}
          </span>
          <Link
            href={`/cats/${cat.id}`}
            className="inline-flex items-center gap-1 font-semibold text-sm px-3 py-1.5 rounded-full transition-all hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
            style={{ color: "var(--color-secondary)" }}
            aria-label={`Visualizza dettagli di ${cat.title}`}
          >
            Dettagli{" "}
            <span className="transform transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
