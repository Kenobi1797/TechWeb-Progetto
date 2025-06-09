"use client";
import { useEffect, useState } from "react";
import { Cat } from "../lib/types";
import CatCard from "../components/CatCard";

export default function HomePage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API error"))))
      .then((data: Cat[]) => setCats(data))
      .catch(() => setCats([]));
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-2 text-blue-800 tracking-tight">Avvistamenti di gatti</h1>
      <p className="mb-8 text-gray-600 text-lg max-w-2xl">
        Esplora gli ultimi avvistamenti di gatti randagi nella tua città. Clicca su una card per vedere i dettagli e aiutare la community!
      </p>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>
      {cats.length === 0 && (
        <div className="text-center text-gray-400 mt-16 text-lg">Nessun avvistamento trovato.</div>
      )}
    </div>
  );
}
