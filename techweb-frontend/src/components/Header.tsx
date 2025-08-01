import Link from "next/link";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 py-4 gap-2 sm:gap-0 shadow-xl fade-in"
      style={{ background: "var(--color-primary)", boxShadow: "0 4px 24px 0 rgba(60,72,88,0.13)" }}
    >
      <Link
        href="/"
        className="font-extrabold text-2xl sm:text-3xl lg:text-4xl tracking-tight transition-transform hover:scale-105"
        style={{ color: "var(--color-accent)", letterSpacing: "-1px" }}
      >
        🐱 Streetcats
      </Link>
      <nav className="flex flex-wrap gap-3 sm:gap-5 lg:gap-8 mt-2 sm:mt-0 text-base sm:text-lg">
        <Link 
          href="/cats" 
          className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
          style={{ color: "var(--color-secondary)" }}
        >
          🏠 Home
        </Link>
        <Link 
          href="/cats" 
          className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
          style={{ color: "var(--color-secondary)" }}
        >
          🐾 Gatti
        </Link>
        <Link 
          href="/map" 
          className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
          style={{ color: "var(--color-secondary)" }}
        >
          🗺️ Mappa
        </Link>
        <Link 
          href="/upload" 
          className="px-4 py-1 rounded-lg font-bold transition-all bg-[var(--color-accent)] text-[var(--color-primary)] shadow hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-white/50 border border-yellow-300"
        >
          ＋ Nuovo
        </Link>
        <Link 
          href="/login" 
          className="px-3 py-1 rounded-lg transition-all hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 font-medium"
          style={{ color: "var(--color-secondary)" }}
        >
          👤 Login
        </Link>
      </nav>
    </header>
  );
}
