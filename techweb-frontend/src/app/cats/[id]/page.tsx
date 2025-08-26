"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { fetchLocationFromCoordsServer } from "@/utils/ServerConnect";
import MarkdownViewer from "@/components/MarkdownViewer";
import { useCatDetails } from "@/utils/DataContext";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { cat, loading, error } = useCatDetails(id);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (cat && typeof cat.latitude === "number" && typeof cat.longitude === "number") {
      // Ritarda il geocoding per la pagina di dettaglio
      const timeoutId = setTimeout(() => {
        fetchLocationFromCoordsServer(cat.latitude, cat.longitude)
          .then(setLocation)
          .catch(() => setLocation(null));
      }, 500); // Ritardo di 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [cat]);

  // Calcola il valore del luogo in modo sicuro
let luogoValue = "Non disponibili";
if (cat && typeof cat.latitude === "number" && typeof cat.longitude === "number" && location === null) {
  luogoValue = "Caricamento luogo...";
} else if (location) {
  luogoValue = location;
} else if (cat && typeof cat.latitude === "number" && typeof cat.longitude === "number") {
  luogoValue = `${cat.latitude.toFixed(6)}, ${cat.longitude.toFixed(6)}`;
}

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
        <div className="text-center py-10">
          <div className="card inline-flex flex-col items-center gap-4 p-8">
            <div className="animate-pulse text-4xl">🐱</div>
            <p className="font-semibold text-lg" style={{ color: "var(--color-primary)" }}>
              Caricamento dettagli...
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
        <div className="text-center py-10">
          <div className="card inline-flex flex-col items-center gap-4 p-8 border-red-200">
            <div className="text-4xl">⚠️</div>
            <p className="font-semibold text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    </div>
    );
  }
  
  if (!cat) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
        <div className="text-center py-10">
          <div className="card inline-flex flex-col items-center gap-4 p-8">
            <div className="text-4xl opacity-60">🔍</div>
            <p className="font-semibold text-lg" style={{ color: "var(--color-primary)" }}>
              Avvistamento non trovato
            </p>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
      <div className="card mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl gradient-primary"
            style={{ 
              boxShadow: "var(--color-shadow)"
            }}
          >
            🐾
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
              {cat.title}
            </h1>
            <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Avvistato il {cat.createdAt ? new Date(cat.createdAt).toLocaleString() : ""}
            </div>
          </div>
        </div>
        
        {cat.imageUrl && (
          <div className="mb-6">
            <Image
              src={cat.imageUrl}
              alt={cat.title}
              width={400}
              height={300}
              className="rounded-lg shadow-md w-full h-auto"
            />
          </div>
        )}

        {/* Descrizione */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
            <span>📝</span>
            <span>Descrizione</span>
          </h2>
          {cat.description ? (
            <div className="prose prose-sm max-w-none" style={{ color: "var(--color-text-primary)" }}>
              <MarkdownViewer>
                {cat.description}
              </MarkdownViewer>
            </div>
          ) : (
            <p className="italic" style={{ color: "var(--color-text-secondary)" }}>
              Nessuna descrizione disponibile
            </p>
          )}
        </div>

        {/* Posizione */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
            <span>📍</span>
            <span>Posizione</span>
          </h2>
          <div className="rounded-lg overflow-hidden shadow-md mb-3" style={{ height: "250px" }}>
            {typeof window !== "undefined" &&
              cat && typeof cat.latitude === "number" && typeof cat.longitude === "number" ? (
              <MapView
                key={cat.id}
                markers={[{
                  lat: cat.latitude,
                  lng: cat.longitude,
                  title: cat.title,
                  imageUrl: cat.imageUrl ?? "",
                  id: cat.id,
                  createdAt: cat.createdAt,
                  description: cat.description ?? ""
                }]}
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ background: "var(--color-surface)" }}>
                <p className="italic" style={{ color: "var(--color-text-secondary)" }}>
                  Mappa non disponibile
                </p>
              </div>
            )}
          </div>
          <p className="text-sm px-3 py-2 rounded-lg" style={{ 
            background: "var(--color-surface)", 
            color: "var(--color-text-primary)" 
          }}>
            <strong>Luogo:</strong> {luogoValue}
          </p>
        </div>
      </div>

      {/* Sezione commenti */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
          <span>💬</span>
          <span>Commenti ({cat.comments?.length || 0})</span>
        </h2>
        
        {!cat.comments || cat.comments.length === 0 ? (
          <div className="text-center py-8 rounded-lg" style={{ background: "var(--color-surface)" }}>
            <div className="text-4xl opacity-60 mb-3">💭</div>
            <p className="italic" style={{ color: "var(--color-text-secondary)" }}>
              Nessun commento ancora. Sii il primo a commentare questo avvistamento!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cat.comments.map((comment) => (
              <div
                key={comment.id}
                className="card border-2"
                style={{ borderColor: "var(--color-secondary)" }}
              >
                <div className="flex items-center mb-3 gap-3">
                  <div 
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg gradient-accent"
                    style={{ 
                      boxShadow: "var(--color-shadow)"
                    }}
                  >
                    {comment.username ? comment.username.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{ color: "var(--color-primary)" }}>
                      {comment.username}
                    </div>
                    <div className="text-xs px-2 py-1 rounded inline-block mt-1" style={{ 
                      background: "var(--color-accent)", 
                      color: "var(--color-primary)" 
                    }}>
                      {new Date(comment.createdAt).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <hr className="my-3" style={{ borderColor: "var(--color-border)" }} />
                <div className="prose prose-sm max-w-none" style={{ color: "var(--color-text-primary)" }}>
                  <MarkdownViewer>
                    {comment.content}
                  </MarkdownViewer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}