"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const { token } = await res.json();
      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
      }
      router.push("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Credenziali non valide");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-4 sm:py-8 px-2 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-md w-full max-w-xs sm:max-w-md md:max-w-lg transition-all"
        style={{
          background: "var(--color-background)",
          color: "var(--color-text-primary)",
          fontFamily: "inherit",
        }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center" style={{ color: "var(--color-primary)" }}>
          Login
        </h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
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
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-text-primary)",
            background: "var(--color-background)",
          }}
          required
        />
        {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
        <button
          type="submit"
          className="rounded py-2 w-full font-semibold transition"
          style={{
            background: "var(--color-primary)",
            color: "#fff",
          }}
        >
          Accedi
        </button>
        <p className="mt-3 text-xs sm:text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
          Non hai un account?{" "}
          <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">Registrati</a>
        </p>
      </form>
    </div>
  );
}
