import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 sm:py-4 gap-2 sm:gap-0 shadow-lg"
      style={{ background: "var(--color-primary)" }}
    >
      <Link
        href="/"
        className="font-bold text-xl sm:text-2xl lg:text-3xl transition-transform hover:scale-105"
        style={{ color: "var(--color-accent)" }}
      >
        🐱 Streetcats
      </Link>
      <nav className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6 mt-2 sm:mt-0 text-sm sm:text-base">
        <Link 
          href="/" 
          className="px-2 py-1 rounded transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: "var(--color-secondary)" }}
        >
          🏠 Home
        </Link>
        <Link 
          href="/map" 
          className="px-2 py-1 rounded transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: "var(--color-secondary)" }}
        >
          🗺️ Mappa
        </Link>
        <Link 
          href="/upload" 
          className="px-3 py-1 rounded font-semibold transition-all hover:bg-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: "var(--color-accent)" }}
        >
          ➕ Nuovo
        </Link>
        <Link 
          href="/login" 
          className="px-2 py-1 rounded transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
          style={{ color: "var(--color-secondary)" }}
        >
          👤 Login
        </Link>
      </nav>
    </header>
  );
}
