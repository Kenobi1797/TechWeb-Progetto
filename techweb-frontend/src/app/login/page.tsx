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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-xs sm:max-w-md transition-all"
      >
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2 w-full rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded w-full font-semibold transition"
        >
          Accedi
        </button>
        <p className="mt-4 text-xs sm:text-sm text-center text-gray-600 dark:text-gray-300">
          Non hai un account?{" "}
          <a href="/register" className="text-blue-600 hover:underline dark:text-blue-400">Registrati</a>
        </p>
      </form>
    </div>
  );
}
