"use client";
import { useEffect, useState } from "react";
import { Cat } from "../../lib/types";
import CatCard from "../../components/CatCard";

export default function CatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("API error"))))
      .then((data: Cat[]) => setCats(data))
      .catch(() => setCats([]));
  }, []);

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">Tutti gli avvistamenti</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>
    </main>
  );
}
