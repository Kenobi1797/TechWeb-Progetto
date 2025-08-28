"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { fetchLocationFromCoordsServer } from "@/utils/ServerConnect";
import MarkdownViewer from "@/components/MarkdownViewer";
import { useCatDetails } from "@/utils/DataContext";
import { Cat, Comment } from "@/utils/types";
import { useAuth } from "@/utils/useAuth";
import CommentForm from "@/components/CommentForm";

const MapView = dynamic(() => import("@/components/MapView"), { 
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full" 
         style={{ background: "var(--color-surface)" }}>
      <div className="text-4xl mb-2 animate-pulse">🗺️</div>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Caricamento mappa...
      </p>
    </div>
  )
});

interface CatWithComments extends Cat {
  comments?: Comment[];
}

// Helper function per calcolare il valore del luogo
const calculateLocationValue = (cat: CatWithComments | null, location: string | null): string => {
  if (!cat || typeof cat.latitude !== "number" || typeof cat.longitude !== "number") {
    return "Non disponibili";
  }
  
  if (location === null) {
    return "Caricamento luogo...";
  }
  
  if (location) {
    return location;
  }
  
  return `${cat.latitude.toFixed(6)}, ${cat.longitude.toFixed(6)}`;
};

// Helper function per verificare se le coordinate sono valide
const hasValidCoordinates = (cat: CatWithComments | null): boolean => {
  return cat !== null && typeof cat.latitude === "number" && typeof cat.longitude === "number";
};

// Componente per lo stato di loading
const LoadingState = () => (
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

// Componente per lo stato di errore
const ErrorState = ({ error }: { error: string }) => (
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

// Componente per lo stato di gatto non trovato
const NotFoundState = () => (
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

// Componente per l'header del gatto
const CatHeader = ({ cat }: { cat: CatWithComments }) => (
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
);

// Componente per l'immagine del gatto
const CatImage = ({ cat }: { cat: CatWithComments }) => {
  if (!cat.imageUrl) return null;
  
  return (
    <div className="mb-6">
      <Image
        src={cat.imageUrl}
        alt={cat.title}
        width={400}
        height={300}
        className="rounded-lg shadow-md w-full h-auto"
      />
    </div>
  );
};

// Componente per la descrizione del gatto
const CatDescription = ({ cat }: { cat: CatWithComments }) => (
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
);

// Componente per la sezione della mappa
const CatLocationSection = ({ cat, luogoValue }: { cat: CatWithComments; luogoValue: string }) => (
  <div className="mb-6">
    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
      <span>📍</span>
      <span>Posizione</span>
    </h2>
    <div className="rounded-lg overflow-hidden shadow-md mb-3" style={{ height: "250px" }}>
      {typeof window !== "undefined" && hasValidCoordinates(cat) ? (
        <div className="w-full h-full">
          <MapView
            key={`map-${cat.id}-${cat.latitude}-${cat.longitude}`}
            markers={[{
              lat: cat.latitude,
              lng: cat.longitude,
              title: cat.title,
              imageUrl: cat.imageUrl ?? "",
              id: cat.id,
              createdAt: cat.createdAt,
              description: cat.description ?? ""
            }]}
            showPopups={false}
            showControls={false}
            zoom={16}
            center={[cat.latitude, cat.longitude]}
            height="250px"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full" 
             style={{ background: "var(--color-surface)" }}>
          <div className="text-4xl mb-2">
            {!hasValidCoordinates(cat) ? "⚠️" : "🗺️"}
          </div>
          <p className="text-sm text-center px-4" style={{ color: "var(--color-text-secondary)" }}>
            {!hasValidCoordinates(cat) ? "Posizione non disponibile" : "Caricamento mappa..."}
          </p>
          {!hasValidCoordinates(cat) && (
            <p className="text-xs text-center px-4 mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Coordinate non valide per questo avvistamento
            </p>
          )}
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
);

// Componente per un singolo commento
const CommentCard = ({ comment }: { comment: Comment }) => (
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
);

// Componente per la sezione commenti
const CommentsSection = ({ cat }: { cat: CatWithComments }) => {
  const { isLoggedIn, isLoading } = useAuth();
  let actionContent = null;
  if (!isLoading) {
    if (isLoggedIn) {
      actionContent = <CommentForm catId={String(cat.id)} />;
    } else {
      actionContent = (
        <a
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition inline-block"
          style={{ marginTop: "1rem" }}
        >
          🔒 Login per commentare
        </a>
      );
    }
  }
  return (
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
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      )}
      <div className="mt-6 text-center">
        {actionContent}
      </div>
    </div>
  );
};

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { cat, loading, error } = useCatDetails(id);
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    if (hasValidCoordinates(cat)) {
      const timeoutId = setTimeout(() => {
        fetchLocationFromCoordsServer(cat!.latitude, cat!.longitude)
          .then(setLocation)
          .catch(() => setLocation(null));
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [cat]);

  const luogoValue = calculateLocationValue(cat, location);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!cat) return <NotFoundState />;

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
        <div className="card mb-6">
          <CatHeader cat={cat} />
          <CatImage cat={cat} />
          <CatDescription cat={cat} />
          <CatLocationSection cat={cat} luogoValue={luogoValue} />
        </div>
        <CommentsSection cat={cat} />
      </div>
    </div>
  );
}