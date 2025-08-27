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
  status?: 'active' | 'adopted' | 'moved';
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

type AuthResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
};

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

// Estrae l'errore dalla risposta
async function extractError(res: Response, defaultMsg: string): Promise<string> {
  let data: Record<string, unknown> = {};
  try { 
    data = await res.json(); 
  } catch { 
    return defaultMsg;
  }
  
  return typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
    ? data.error
    : defaultMsg;
}

// Gestisce il logout forzato
function forceLogout(message: string): void {
  clearTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("authStateChanged"));
    window.location.href = "/login";
  }
  throw new Error(message);
}

// Gestisce il token scaduto con refresh
async function handleExpiredToken(fetchFunction: () => Promise<Response>): Promise<Response> {
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    // Riprova la richiesta con il nuovo token
    return await fetchFunction();
  } else {
    // Sessione scaduta completamente - forza logout
    forceLogout("Sessione scaduta, effettua il login");
    throw new Error(); // Non raggiungerà mai questo punto
  }
}

// Gestisce errori di autenticazione 401
async function handle401Error(res: Response, fetchFunction: () => Promise<Response>): Promise<Response> {
  const errorData = await res.clone().json().catch(() => ({}));
  
  // Solo se il token è scaduto, prova il refresh
  if (errorData.code === 'TOKEN_EXPIRED') {
    return await handleExpiredToken(fetchFunction);
  } else {
    // Token non valido o altro errore - forza logout
    forceLogout("Autenticazione non valida, effettua il login");
    throw new Error(); // Non raggiungerà mai questo punto
  }
}

// Utility per gestire errori fetch con auto-refresh (refactored)
async function handleAuthenticatedFetch<T>(fetchFunction: () => Promise<Response>, defaultMsg = "API error"): Promise<T> {
  try {
    let res = await fetchFunction();
    
    // Se il token è scaduto, prova a rinnovarlo
    if (res.status === 401) {
      res = await handle401Error(res, fetchFunction);
    }
    
    if (!res.ok) {
      const errorMessage = await extractError(res, defaultMsg);
      throw new Error(errorMessage);
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
    status: cat.status ?? 'active',
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

export async function registerUser(username: string, email: string, password: string): Promise<AuthResponse> {
  return handleFetch<AuthResponse>(
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    }),
    "Errore durante la registrazione"
  );
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await handleFetch<AuthResponse>(
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
  );
  
  // Salva i token dopo il login riuscito
  if (response.accessToken && response.refreshToken) {
    setTokens(response.accessToken, response.refreshToken);
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }
  }
  
  return response;
}

export async function logoutUser(): Promise<{ message: string }> {
  const refreshToken = getRefreshToken();
  return handleFetch<{ message: string }>(
    fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
  );
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("accessToken");
  return token !== null;
}

export function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") || "";
}

export function getRefreshToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("refreshToken") || "";
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

// Refresh access token
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    
    // Aggiorna anche i dati utente se presenti
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    
    return true;
  } catch (error) {
    console.error("Errore durante il refresh del token:", error);
    clearTokens();
    return false;
  }
}

// --- GATTI ---

export async function fetchCats(page = 1, limit = 20): Promise<Cat[]> {
  const data = await handleFetch<CatApiResponse[]>(
    fetch(`${API_URL}/cats?page=${page}&limit=${limit}`)
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

  const data = await handleAuthenticatedFetch<CatApiResponse>(
    () => fetch(`${API_URL}/cats`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: formData,
    })
  );
  return mapCatApiResponse(data);
}

// --- MAPTILER KEY ---
export async function fetchMaptilerKey(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/maptiler-key`);
    const data = await res.json();
    return data.key ?? "";
  } catch {
    return "";
  }
}

export async function fetchComments(catId: number | string): Promise<Comment[]> {
  const data = await handleFetch<CommentApiResponse[]>(
    fetch(`${API_URL}/${catId}/comments`)
  );
  return data.map(mapCommentApiResponse);
}

export async function addComment(
  catId: number | string,
  content: string
): Promise<Comment> {
  const data = await handleAuthenticatedFetch<CommentApiResponse>(
    () => fetch(`${API_URL}/${catId}/comments`, {
      method: "POST",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ content }),
    })
  );
  return mapCommentApiResponse(data);
}

// Geocoding inverso: ottieni luogo da lat/lon
export async function fetchLocationFromCoordsServer(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/geocode?lat=${lat}&lon=${lon}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.location || null;
  } catch {
    return null;
  }
}

// --- USER CATS ---

export async function fetchUserCats(): Promise<Cat[]> {
  const data = await handleAuthenticatedFetch<CatApiResponse[]>(
    () => fetch(`${API_URL}/cats/my-cats`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json"
      }
    })
  );
  return data.map(mapCatApiResponse);
}

export async function updateCatStatus(
  catId: number,
  status: 'active' | 'adopted' | 'moved'
): Promise<Cat> {
  const data = await handleAuthenticatedFetch<CatApiResponse>(
    () => fetch(`${API_URL}/cats/${catId}/status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    })
  );
  return mapCatApiResponse(data);
}

export async function updateCat(
  catId: number,
  updates: {
    title?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    imageFile?: File;
  }
): Promise<Cat> {
  const formData = new FormData();
  
  if (updates.title) formData.append("title", updates.title);
  if (updates.description) formData.append("description", updates.description);
  if (updates.latitude) formData.append("latitude", String(updates.latitude));
  if (updates.longitude) formData.append("longitude", String(updates.longitude));
  if (updates.imageFile) formData.append("image", updates.imageFile);

  const data = await handleAuthenticatedFetch<CatApiResponse>(
    () => fetch(`${API_URL}/cats/${catId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`
      },
      body: formData,
    })
  );
  return mapCatApiResponse(data);
}