import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-blue-100 shadow">
      <Link href="/" className="font-bold text-xl text-blue-800">Streetcats</Link>
      <nav className="flex gap-4">
        <Link href="/">Home</Link>
        <Link href="/map">Mappa</Link>
        <Link href="/upload">Nuovo</Link>
        <Link href="/login">Login</Link>
      </nav>
    </header>
  );
}
