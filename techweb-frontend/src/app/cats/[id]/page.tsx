"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { fetchCatById } from "@/utils/ServerConnect";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCatById(id)
      .then((data) => {
        console.log("Dettaglio gatto:", data);
        setCat(data);
      })
      .catch(() => setError("Errore nel caricamento dell'avvistamento"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (error) return <div className="text-center py-10">{error}</div>;
  if (!cat) return <div className="text-center py-10">Avvistamento non trovato.</div>;

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
        {cat.descriptionHtml ? (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: cat.descriptionHtml }}
          />
        ) : null}
        {!cat.descriptionHtml && cat.description ? (
          <MarkdownViewer className="prose prose-sm max-w-none">
            {cat.description}
          </MarkdownViewer>
        ) : null}
        {!cat.descriptionHtml && !cat.description ? (
          <p className="text-gray-500 italic">Nessuna descrizione disponibile</p>
        ) : null}
      </div>

      {/* Mappa con posizione */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Posizione</h2>
        <div className="h-64 mb-2">
          <MapView
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
        </div>
        <p className="text-sm text-gray-600">
          Coordinate: {cat.latitude.toFixed(6)}, {cat.longitude.toFixed(6)}
        </p>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Commenti ({cat.comments.length})</h2>
        {cat.comments.length === 0 ? (
          <div className="text-gray-400 italic bg-gray-50 p-4 rounded">
            Nessun commento ancora. Sii il primo a commentare questo avvistamento!
          </div>
        ) : (
          <div className="space-y-4">
            {cat.comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-blue-600">{comment.username}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <MarkdownViewer className="prose prose-sm max-w-none">
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