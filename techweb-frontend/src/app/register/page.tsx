"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Errore durante la registrazione");
      }
    } catch {
      setError("Impossibile contattare il server. Verifica la connessione.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-4 sm:py-8 px-2 sm:px-0 bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800/90 p-5 sm:p-8 rounded-xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg transition-all border border-gray-200 dark:border-gray-700"
        style={{
          background: "var(--color-background, #fff)",
          color: "var(--color-text-primary)",
          fontFamily: "inherit",
        }}
      >
        <h2
          className="text-2xl sm:text-3xl font-extrabold mb-6 text-center tracking-tight"
          style={{ color: "var(--color-primary)" }}
        >
          Registrati
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 p-3 w-full rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 dark:placeholder-gray-500"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
            background: "var(--color-background)",
          }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 p-3 w-full rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 dark:placeholder-gray-500"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
            background: "var(--color-background)",
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 p-3 w-full rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 dark:placeholder-gray-500"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
            background: "var(--color-background)",
          }}
          required
        />
        {error && (
          <p className="text-red-500 mb-3 text-sm text-center">{error}</p>
        )}
        <button
          type="submit"
          className="rounded-lg py-2.5 w-full font-bold transition bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{
            background: "var(--color-primary)",
            color: "#fff",
          }}
        >
          Registrati
        </button>
        <p className="mt-5 text-xs sm:text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Hai già un account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline dark:text-blue-400 font-semibold transition-colors"
          >
            Accedi
          </a>
        </p>
      </form>
    </div>
  );
}
