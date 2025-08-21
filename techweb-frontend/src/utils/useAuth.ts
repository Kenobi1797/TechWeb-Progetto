"use client";
import { useState, useEffect } from "react";
import { isAuthenticated, logoutUser } from "./ServerConnect";

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
    window.addEventListener("authStateChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleStorageChange);
    };
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
      setIsLoggedIn(false);
      // Dispatcha un evento personalizzato per notificare altri componenti
      window.dispatchEvent(new Event("authStateChanged"));
      return true;
    } catch (error) {
      console.error("Errore durante il logout:", error);
      return false;
    }
  };

  const updateAuthState = () => {
    setIsLoggedIn(isAuthenticated());
    window.dispatchEvent(new Event("authStateChanged"));
  };

  return {
    isLoggedIn,
    isLoading,
    logout,
    updateAuthState,
  };
}
