"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cat } from "../../../../utils/types";

export default function CatDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [cat, setCat] = useState<Cat | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error("API error")))
      .then((data: Cat) => setCat(data))
      .catch(() => setCat(null));
  }, [id]);

  if (!cat) return <p>Caricamento...</p>;

  return (
    <main className="container mx-auto py-8 px-2 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>{cat.title}</h1>
      <img src={cat.imageUrl} alt={cat.title} className="mb-4 w-full max-w-md rounded-xl object-cover" style={{ maxHeight: 350 }} />
      <p className="mb-2" style={{ color: "var(--color-text-secondary)" }}>{cat.description}</p>
      <p className="text-sm mt-2" style={{ color: "var(--color-secondary)" }}>
        Lat: {cat.latitude}, Lng: {cat.longitude}
      </p>
    </main>
  );
}
