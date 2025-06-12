"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Comment = {
  id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
};

type Cat = {
  id: number;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  created_at: string;
  comments?: Comment[];
};

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/cats/${id}`)
      .then(res => res.json())
      .then(setCat)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-10">Caricamento...</div>;
  if (!cat) return <div className="text-center py-10">Avvistamento non trovato.</div>;

  return (
    <div className="container mx-auto py-8 px-2 sm:px-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
        {cat.title}
      </h1>
      <div className="mb-4 text-gray-500 text-sm">
        Avvistato il {new Date(cat.created_at).toLocaleString()}
      </div>
      {cat.image_url && (
        <div className="mb-4">
          <Image
            src={cat.image_url}
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
      {cat.comments && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Commenti</h2>
          {cat.comments.length === 0 && (
            <div className="text-gray-400 italic">Nessun commento.</div>
          )}
          <ul>
            {cat.comments.map(comment => (
              <li key={comment.id} className="mb-3 border-b pb-2">
                <div className="font-semibold">{comment.username}</div>
                <div className="text-sm text-gray-600">{new Date(comment.created_at).toLocaleString()}</div>
                <div>{comment.text}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
