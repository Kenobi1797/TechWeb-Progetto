import { Cat, Comment } from "./types";

// Tipi intermedi per la risposta dal backend
type CatApiResponse = {
  id: number;
  user_id?: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  imageUrl?: string;
  created_at?: string;
  createdAt?: string;
};

type CommentApiResponse = {
  id: number;
  user_id?: number;
  cat_id?: number;
  username: string;
  content: string;
  created_at?: string;
  createdAt?: string;
};

type CatWithCommentsApiResponse = CatApiResponse & {
  comments?: CommentApiResponse[];
};

const API_URL = `http://localhost:5000`;

// --- AUTH ---

export async function registerUser(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Errore durante la registrazione");
  }
  return await res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Credenziali non valide");
  }
  return await res.json();
}

// --- GATTI ---

export async function fetchCats(): Promise<Cat[]> {
  const res = await fetch(`${API_URL}/cats`);
  if (!res.ok) throw new Error("API error");
  const data: CatApiResponse[] = await res.json();
  return data.map((cat) => ({
    id: cat.id,
    userId: cat.user_id ?? 0,
    title: cat.title,
    description: cat.description,
    latitude: cat.latitude,
    longitude: cat.longitude,
    imageUrl: (cat.image_url ?? cat.imageUrl ?? "") || "",
    createdAt: cat.created_at ?? cat.createdAt ?? "",
  }));
}

export async function fetchCatById(id: number | string): Promise<Cat & { comments: Comment[] }> {
  const res = await fetch(`${API_URL}/cats/${id}`);
  if (!res.ok) throw new Error("API error");
  const data: CatWithCommentsApiResponse = await res.json();
  return {
    id: data.id,
    userId: data.user_id ?? 0,
    title: data.title,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    imageUrl: (data.image_url ?? data.imageUrl ?? "") || "",
    createdAt: data.created_at ?? data.createdAt ?? "",
    comments: (data.comments ?? []).map((c) => ({
      id: c.id,
      userId: c.user_id ?? 0,
      catId: c.cat_id ?? 0,
      username: c.username,
      content: c.content,
      createdAt: c.created_at ?? c.createdAt ?? "",
    })) as Comment[],
  };
}

export async function createCat(
  cat: Omit<Cat, "id" | "createdAt" | "imageUrl"> & { imageFile?: File }
): Promise<Cat> {
  const formData = new FormData();
  formData.append("title", cat.title);
  formData.append("description", cat.description ?? "");
  formData.append("latitude", String(cat.latitude));
  formData.append("longitude", String(cat.longitude));
  if (cat.imageFile) formData.append("image", cat.imageFile);

  const res = await fetch(`${API_URL}/cats`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("API error");
  const data: CatApiResponse = await res.json();
  return {
    id: data.id,
    userId: data.user_id ?? 0,
    title: data.title,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    imageUrl: (data.image_url ?? data.imageUrl ?? "") || "",
    createdAt: data.created_at ?? data.createdAt ?? "",
  };
}

// --- COMMENTI ---

export async function fetchComments(catId: number | string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/comments/${catId}`);
  if (!res.ok) throw new Error("API error");
  const data: CommentApiResponse[] = await res.json();
  return data.map((c) => ({
    id: c.id,
    userId: c.user_id ?? 0,
    catId: c.cat_id ?? 0,
    username: c.username,
    content: c.content,
    createdAt: c.created_at ?? c.createdAt ?? "",
  })) as Comment[];
}

export async function addComment(
  catId: number | string,
  content: string
): Promise<Comment> {
  const res = await fetch(`${API_URL}/comments/${catId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("API error");
  const data: CommentApiResponse = await res.json();
  return {
    id: data.id,
    userId: data.user_id ?? 0,
    catId: data.cat_id ?? 0,
    username: data.username,
    content: data.content,
    createdAt: data.created_at ?? data.createdAt ?? "",
  } as Comment;
}

// ...eventuali altre funzioni di comunicazione (login, logout, ecc)...
