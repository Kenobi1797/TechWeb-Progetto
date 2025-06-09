import Link from "next/link";

export default function Header() {
  return (
    <header
      className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 shadow"
      style={{ background: "var(--color-primary)" }}
    >
      <Link
        href="/"
        className="font-bold text-2xl sm:text-xl"
        style={{ color: "var(--color-accent)" }}
      >
        Streetcats
      </Link>
      <nav className="flex gap-4 mt-2 sm:mt-0">
        <Link href="/" style={{ color: "var(--color-secondary)" }}>Home</Link>
        <Link href="/map" style={{ color: "var(--color-secondary)" }}>Mappa</Link>
        <Link href="/upload" style={{ color: "var(--color-accent)" }}>Nuovo</Link>
        <Link href="/login" style={{ color: "var(--color-secondary)" }}>Login</Link>
      </nav>
    </header>
  );
}
