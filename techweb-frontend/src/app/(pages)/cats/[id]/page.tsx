"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Cat } from "../../../../utils/types";
import Image from "next/image";

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
    <main className="container mx-auto py-6 px-1 sm:py-12 sm:px-4">
      <h1 className="text-xl sm:text-3xl font-bold mb-4" style={{ color: "var(--color-primary)" }}>{cat.title}</h1>
      <div className="mb-4 w-full max-w-md">
        <Image
          src={cat.image_url}
          alt={cat.title}
          width={600}
          height={350}
          className="rounded-xl object-cover w-full"
          style={{ maxHeight: 350 }}
          priority
        />
      </div>
      <p className="mb-2 text-sm sm:text-base" style={{ color: "var(--color-text-secondary)" }}>{cat.description}</p>
      <p className="text-xs sm:text-sm mt-2" style={{ color: "var(--color-secondary)" }}>
        Lat: {cat.latitude}, Lng: {cat.longitude}
      </p>
    </main>
  );
}
