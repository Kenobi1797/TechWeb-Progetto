"use client";
import { useState, useEffect } from "react";
import { isAuthenticated, logoutUser, clearTokens, getAuthToken } from "./ServerConnect";

// Utility per decodificare JWT e ottenere il tempo di scadenza
function getTokenExpiration(): number | null {
  if (typeof globalThis.window === "undefined") return null;
  const token = getAuthToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.exp ? decoded.exp * 1000 : null; // Converti a millisecondi
  } catch (error) {
    console.warn("Failed to decode token:", error);
    return null;
  }
}

// Utility per controllare se il token è scaduto
function isTokenExpired(): boolean {
  const expiration = getTokenExpiration();
  if (!expiration) return false;
  return Date.now() > expiration;
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica lo stato di autenticazione iniziale
    const checkAuth = () => {
      setIsLoggedIn(isAuthenticated());
      setIsLoading(false);
    };

    checkAuth();

    // Ascolta i cambiamenti nel localStorage
    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Evento personalizzato per aggiornare lo stato dopo login/logout
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.addEventListener("authStateChanged", handleStorageChange);
    }

    // Interval per controllare la scadenza del token (ogni 1 minuto)
    const tokenCheckInterval = setInterval(() => {
      if (isAuthenticated() && isTokenExpired()) {
        // Token scaduto - effettua logout automatico
        handleAutoLogout();
      }
    }, 60000); // Check ogni 60 secondi

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.removeEventListener("authStateChanged", handleStorageChange);
      }
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const handleAutoLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Errore durante auto-logout:", error);
    } finally {
      clearTokens();
      setIsLoggedIn(false);
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.dispatchEvent(new Event("authStateChanged"));
      }
      
      // Redirect a login
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.location.href = "/login?session=expired";
      }
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      clearTokens();
      setIsLoggedIn(false);
      // Dispatcha un evento personalizzato per notificare altri componenti
      if (typeof globalThis.window !== "undefined") {
        globalThis.window.dispatchEvent(new Event("authStateChanged"));
      }
      return true;
    } catch (error) {
      console.error("Errore durante il logout:", error);
      // Anche se il logout fallisce server-side, pulisci i token locali
      clearTokens();
      setIsLoggedIn(false);
      window.dispatchEvent(new Event("authStateChanged"));
      return false;
    }
  };

  const updateAuthState = () => {
    setIsLoggedIn(isAuthenticated());
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.dispatchEvent(new Event("authStateChanged"));
    }
  };

  return {
    isLoggedIn,
    isLoading,
    logout,
    updateAuthState,
  };
}
