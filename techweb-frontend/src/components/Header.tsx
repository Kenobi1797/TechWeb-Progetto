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
        <Link href="/" tabIndex={0} aria-label="Home" className="btn btn-secondary btn-small font-medium hover:scale-105 transition-transform" prefetch={true}>🏠 Home</Link>
        <Link href="/cats" tabIndex={0} aria-label="Vai alla pagina Gatti" className="btn btn-secondary btn-small font-medium hover:scale-105 transition-transform" prefetch={true}>🐾 Gatti</Link>
        <Link href="/map" tabIndex={0} aria-label="Vai alla mappa" className="btn btn-secondary btn-small font-medium hover:scale-105 transition-transform" prefetch={true}>🗺️ Mappa</Link>
        {isLoggedIn && (
          <Link href="/my-listings" tabIndex={0} aria-label="I miei avvistamenti" className="btn btn-secondary btn-small font-medium hover:scale-105 transition-transform" prefetch={true}>📝 I miei</Link>
        )}
        <Link 
          href="/upload" 
          className="btn btn-primary font-bold"
        >
          ＋ Nuovo
        </Link>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="btn btn-danger btn-small font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳ Logout..." : "🚪 Logout"}
          </button>
        ) : (
          <Link 
            href="/login" 
            className="btn btn-success btn-small font-medium"
          >
            👤 Login
          </Link>
        )}
      </nav>
    </header>
  );
}
