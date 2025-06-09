"use client";
import { useEffect, useState } from "react";
import { Cat } from "../../lib/types";
import CatGrid from "../../components/CatGrid";
import { fetchCats } from "../../lib/api";

export default function CatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    fetchCats()
      .then(setCats)
      .catch(() => setCats([]));
  }, []);

  return (
    <main className="container mx-auto py-8 px-2 sm:py-12 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
        Tutti gli avvistamenti
      </h1>
      <CatGrid cats={cats} />
    </main>
  );
}
