"use client";
import { useState } from "react";
import { loginUser } from "../../utils/ServerConnect";
import { useAuth } from "../../utils/useAuth";

export default function LoginPage() {
  const { updateAuthState } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const response = await loginUser(email, password);
      if (response?.accessToken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", response.accessToken);
          localStorage.setItem("refreshToken", response.refreshToken);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        // Aggiorna lo stato di autenticazione
        updateAuthState();
        // Reindirizza alla homepage
        window.location.href = "/";
      } else {
        setError("Credenziali non corrette");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Errore durante il login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-4 sm:py-8 px-2 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-xs sm:max-w-md md:max-w-lg fade-in"
      >
        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4 transition-transform hover:scale-105"
            style={{ 
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
              boxShadow: "var(--color-shadow)"
            }}
          >
            👤
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-primary)" }}
          >
            Accedi al tuo account
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Inserisci le tue credenziali per continuare
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="la.tua@email.it"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="La tua password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-md transition-colors"
                aria-label={showPassword ? "Nascondi password" : "Mostra password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/>
                    <path stroke="currentColor" strokeWidth="2" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path stroke="currentColor" strokeWidth="2" d="m3 3 18 18"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border-red-200 bg-red-50 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "🔄 Accesso in corso..." : "🔑 Accedi"}
        </button>
        
        <p className="mt-6 text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Non hai un account?{" "}
          <a
            href="/register"
            className="font-semibold transition-colors"
            style={{ color: "var(--color-secondary)" }}
          >
            Registrati qui
          </a>
        </p>
      </form>
    </div>
  );
}
