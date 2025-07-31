import { Cat } from "./types";
import type { Comment } from "./types";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Utility per gestire errori fetch
async function handleFetch<T>(promise: Promise<Response>, defaultMsg = "API error"): Promise<T> {
  try {
    const res = await promise;
    if (!res.ok) {
      let data: Record<string, unknown> = {};
      try { data = await res.json(); } catch { /* ignore */ }
      throw new Error(typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
        ? data.error
        : defaultMsg
      );
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message || defaultMsg);
    }
    throw new Error(defaultMsg);
  }
}

// Uniforma i dati Cat dal backend
function mapCatApiResponse(cat: CatApiResponse): Cat {
  return {
    id: cat.id,
    userId: cat.user_id ?? 0,
    title: cat.title,
    description: cat.description,
    latitude: cat.latitude,
    longitude: cat.longitude,
    imageUrl: cat.image_url ?? cat.imageUrl ?? "",
    createdAt: cat.created_at ?? cat.createdAt ?? "",
  };
}

// Uniforma i dati Comment dal backend
function mapCommentApiResponse(c: CommentApiResponse): Comment {
  return {
    id: c.id,
    userId: c.user_id ?? 0,
    catId: c.cat_id ?? 0,
    username: c.username,
    content: c.content,
    createdAt: c.created_at ?? c.createdAt ?? "",
  };
}

// --- AUTH ---

export async function registerUser(username: string, email: string, password: string) {
  return handleFetch(
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    }),
    "Errore durante la registrazione"
  );
}

export async function loginUser(email: string, password: string) {
  return handleFetch(
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
    "Credenziali non valide"
  );
}

// --- GATTI ---

export async function fetchCats(): Promise<Cat[]> {
  const data = await handleFetch<CatApiResponse[]>(
    fetch(`${API_URL}/cats`)
  );
  return data.map(mapCatApiResponse);
}

export async function fetchCatById(id: number | string): Promise<Cat & { comments: Comment[] }> {
  const data = await handleFetch<CatWithCommentsApiResponse>(
    fetch(`${API_URL}/cats/${id}`)
  );
  return {
    ...mapCatApiResponse(data),
    comments: (data.comments ?? []).map(mapCommentApiResponse),
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

  const data = await handleFetch<CatApiResponse>(
    fetch(`${API_URL}/cats`, {
      method: "POST",
      credentials: "include",
      body: formData,
    })
  );
  return mapCatApiResponse(data);
}

// --- COMMENTI ---

export async function fetchComments(catId: number | string): Promise<Comment[]> {
  const data = await handleFetch<CommentApiResponse[]>(
    fetch(`${API_URL}/comments/${catId}`)
  );
  return data.map(mapCommentApiResponse);
}

export async function addComment(
  catId: number | string,
  content: string
): Promise<Comment> {
  const data = await handleFetch<CommentApiResponse>(
    fetch(`${API_URL}/${catId}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
  );
  return mapCommentApiResponse(data);
}
