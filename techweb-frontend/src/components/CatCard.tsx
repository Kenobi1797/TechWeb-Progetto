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

export default function CatCard({ cat }: CatCardProps) {
  const truncateDescription = (text: string | null, maxLength: number = 80) => {
    if (!text) return null;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
        });
    }
  }, [cat.latitude, cat.longitude]);

  return (
    <article
      className="cat-card group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border flex flex-col overflow-hidden w-full h-full transform hover:scale-105 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      <div className="relative overflow-hidden">
        {cat.imageUrl ? (
          <Image
            src={cat.imageUrl}
            alt={cat.title}
            width={300}
            height={200}
            className="rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="bg-gray-200 rounded-lg w-full h-48 flex items-center justify-center text-gray-400">
            Nessuna immagine
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {new Date(cat.createdAt).toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </div>
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg sm:text-xl mb-2 leading-tight" style={{ color: "var(--color-primary)" }}>
          {cat.title}
        </h3>
        
        {cat.description && (
          <p className="text-sm mb-3 flex-1" style={{ color: "var(--color-text-secondary)" }}>
            {truncateDescription(cat.description)}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
          <span className="text-xs opacity-75" style={{ color: "var(--color-text-secondary)" }}>
            {(() => {
              // Se la geocodifica è in corso (location === null), mostra placeholder
              if (typeof cat.latitude === "number" && typeof cat.longitude === "number" && location === null) {
                return "📍 Caricamento luogo...";
              }
              // Se la geocodifica ha successo
              if (location) {
                return `📍 ${location}`;
              }
              // Se la geocodifica fallisce (location === "" o altro valore falsy)
              if (typeof cat.latitude === "number" && typeof cat.longitude === "number") {
                return `📍 Lat: ${cat.latitude.toFixed(3)}, Lon: ${cat.longitude.toFixed(3)}`;
              }
              return "Coordinate non disponibili";
            })()}
          </span>
          <Link
            href={`/cats/${cat.id}`}
            className="inline-flex items-center gap-1 font-semibold text-sm px-3 py-1 rounded-full transition-all hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
