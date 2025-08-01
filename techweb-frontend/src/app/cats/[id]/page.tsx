"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { fetchCatById, fetchLocationFromCoordsServer } from "@/utils/ServerConnect";
import { Cat, Comment } from "@/utils/types";
import MarkdownViewer from "@/components/MarkdownViewer";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

type CatWithDetails = Cat & { 
  comments: Comment[]; 
  descriptionHtml?: string;
};

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<CatWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const data = await fetchCatById(id);
        setCat(data);
        if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
          const loc = await fetchLocationFromCoordsServer(data.latitude, data.longitude);
          setLocation(loc);
        }
      } catch {
        setError("Errore nel caricamento dell'avvistamento");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    return <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">Caricamento...</div>;
  }
  if (error) {
    return <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl text-red-600">{error}</div>;
  }
  if (!cat) {
    return <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl text-gray-500">Nessun dato disponibile</div>;
  }

  return (
    <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        {cat.title}
      </h1>
      <div className="mb-4 text-gray-500 text-sm">
        Avvistato il {cat.createdAt ? new Date(cat.createdAt).toLocaleString() : ""}
      </div>
      {cat.imageUrl && (
        <div className="mb-4">
          <Image
            src={cat.imageUrl}
            alt={cat.title}
            width={400}
            height={300}
            className="rounded shadow"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}

      {/* Descrizione */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Descrizione</h2>
        {cat.descriptionHtml && (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: cat.descriptionHtml }}
          />
        )}
        {!cat.descriptionHtml && cat.description && (
          <MarkdownViewer className="prose prose-sm max-w-none">
            {cat.description}
          </MarkdownViewer>
        )}
        {!cat.descriptionHtml && !cat.description && (
          <p className="text-gray-500 italic">Nessuna descrizione disponibile</p>
        )}
      </div>

      {/* Mappa con posizione */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Posizione</h2>
        <div className="h-64 mb-2">
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
            <div className="text-gray-400 italic">Mappa non disponibile</div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Luogo: {luogoValue}
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Commenti ({cat.comments.length})</h2>
        {cat.comments.length === 0 ? (
          <div className="text-gray-400 italic bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow">
            Nessun commento ancora. Sii il primo a commentare questo avvistamento!
          </div>
        ) : (
          <div className="space-y-6">
            {cat.comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-blue-200 rounded-xl p-5 bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center mb-3 gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 via-blue-200 to-blue-500 text-white font-bold text-lg shadow-lg border-2 border-blue-300">
                    {comment.username ? comment.username.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-900 text-base">{comment.username}</div>
                    <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block mt-1 shadow">
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
                <hr className="my-3 border-blue-100" />
                <MarkdownViewer className="prose prose-sm max-w-none text-blue-900">
                  {comment.content}
                </MarkdownViewer>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}