"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { fetchCatById } from "@/utils/ServerConnect";
import { Cat, Comment } from "@/utils/types";

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<(Cat & { comments: Comment[] }) | null>(null);
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
      <div className="mb-4">
        <strong>Descrizione:</strong>
        <div>{cat.description || <span className="italic text-gray-400">Nessuna descrizione</span>}</div>
      </div>
      <div className="mb-4">
        <strong>Posizione:</strong>
        <div>
          Lat: {cat.latitude}, Lon: {cat.longitude}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Commenti</h2>
        {cat.comments.length === 0 && (
          <div className="text-gray-400 italic">Nessun commento.</div>
        )}
        <ul>
          {cat.comments.map((comment) => (
            <li key={comment.id} className="mb-3 border-b pb-2">
              <div className="font-semibold">{comment.username}</div>
              <div className="text-sm text-gray-600">{new Date(comment.createdAt).toLocaleString()}</div>
              <div>{comment.content}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}