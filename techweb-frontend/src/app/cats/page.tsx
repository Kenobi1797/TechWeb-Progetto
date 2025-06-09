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
    <main className="container mx-auto py-8 px-2 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Tutti gli avvistamenti
      </h1>
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} />
        ))}
      </div>
    </main>
  );
}
