"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/utils/ServerConnect";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(username, email, password);
      router.push("/login");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Errore durante la registrazione");
      }
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
              background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%)",
              boxShadow: "var(--color-shadow)"
            }}
          >
            ✨
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-primary)" }}
          >
            Crea il tuo account
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Unisciti alla community di amanti dei gatti
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
              Nome utente
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Il tuo nome utente"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full"
              required
            />
          </div>
          
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
                placeholder="Scegli una password sicura"
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
          className="btn btn-primary w-full mt-6"
        >
          🚀 Registrati
        </button>
        
        <p className="mt-6 text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Hai già un account?{" "}
          <a
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: "var(--color-secondary)" }}
          >
            Accedi qui
          </a>
        </p>
      </form>
    </div>
  );
}
