import { Cat } from "./types";

export async function fetchCats(): Promise<Cat[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/cats`);
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data.map((cat: Cat) => ({
    ...cat,
    imageUrl: cat.imageUrl,
    createdAt: cat.createdAt,
    latitude: cat.latitude,
    longitude: cat.longitude,
    title: cat.title,
    description: cat.description,
    id: cat.id,
  }));
}
