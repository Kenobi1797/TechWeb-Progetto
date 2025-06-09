"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cat } from "../../../lib/types";

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
    <main>
      <h1 className="text-2xl font-bold mb-4">{cat.title}</h1>
      <img src={cat.imageUrl} alt={cat.title} className="mb-4 max-w-md" />
      <p>{cat.description}</p>
      <p className="text-sm text-gray-500 mt-2">Lat: {cat.latitude}, Lng: {cat.longitude}</p>
    </main>
  );
}
