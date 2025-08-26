"use client";
import { useState } from "react";
import { loginUser } from "../../utils/ServerConnect";
import { useAuth } from "../../utils/useAuth";

export default function LoginPage() {
  const { updateAuthState } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: "linear-gradient(120deg, var(--color-background) 60%, var(--color-secondary) 100%)" 
    }}>
      <div className="relative w-full max-w-md">
        {/* Card container */}
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform hover:rotate-6" style={{
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)"
              }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-bounce" style={{
                background: "var(--color-accent)"
              }}>
                <span className="text-xs">🐱</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-primary)" }}>
              Bentornato!
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Accedi per continuare la tua avventura felina
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="La tua email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5" style={{ color: "var(--color-text-secondary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="La tua password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3"
                  style={{
                    background: "var(--color-surface)",
                    border: "1.5px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    color: "var(--color-text-primary)"
                  }}
                  required
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="card card-danger p-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" style={{ color: "#ff4757" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span style={{ color: "#ff4757" }} className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-3"></div>
                  Accesso in corso...
                </div>
              ) : (
                "Accedi"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: "var(--color-border)" }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ 
                  background: "var(--color-surface)", 
                  color: "var(--color-text-secondary)" 
                }}>oppure</span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Non hai ancora un account?
              </p>
              <a
                href="/register"
                className="btn btn-secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Crea un nuovo account
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
