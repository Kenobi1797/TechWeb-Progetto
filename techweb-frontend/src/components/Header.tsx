"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/useAuth";

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const success = await logout();
      if (success) {
        router.push("/");
      }
    } catch (error) {
      console.error("Errore durante il logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-4 gap-2 sm:gap-0 shadow-xl fade-in"
      style={{ background: "var(--color-primary)", boxShadow: "0 4px 24px 0 rgba(60,72,88,0.13)" }}
    >
      <div className="flex items-center gap-2">
        <span className="font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight transition-transform hover:scale-105" style={{ color: "var(--color-accent)", letterSpacing: "-1px" }}>
          🐱 Streetcats
        </span>
      </div>
      <nav className="flex gap-4 items-center">
        <Link href="/" tabIndex={0} aria-label="Home" className="font-medium" prefetch={true}>🏠 Home</Link>
        <Link href="/cats" tabIndex={0} aria-label="Vai alla pagina Gatti" className="font-medium" prefetch={true}>🐾 Gatti</Link>
        <Link href="/map" tabIndex={0} aria-label="Vai alla mappa" className="font-medium" prefetch={true}>🗺️ Mappa</Link>
        <Link 
          href="/upload" 
          className="px-4 py-1 rounded-lg font-bold transition-all bg-[var(--color-accent)] text-[var(--color-primary)] shadow hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-white/50 border border-yellow-300"
        >
          ＋ Nuovo
        </Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium disabled:opacity-50"
            style={{ color: "var(--color-secondary)" }}
          >
            {isLoading ? "⏳ Logout..." : "🚪 Logout"}
          </button>
        ) : (
          <Link 
            href="/login" 
            className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
            style={{ color: "var(--color-secondary)" }}
          >
            👤 Login
          </Link>
        )}
      </nav>
    </header>
  );
}
