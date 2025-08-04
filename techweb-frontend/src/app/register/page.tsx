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
          name="username"
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
          name="email"
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
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 dark:placeholder-gray-500 pr-12"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-text-primary)",
              background: "var(--color-background)",
            }}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "32px",
              width: "32px"
            }}
            aria-label={showPassword ? "Nascondi password" : "Mostra password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><path stroke="currentColor" strokeWidth="2" d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path stroke="currentColor" strokeWidth="2" d="m3 3 18 18"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
            )}
          </button>
        </div>
        {error && (
          <p className="error-message text-red-500 mb-3 text-sm text-center">{error}</p>
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
