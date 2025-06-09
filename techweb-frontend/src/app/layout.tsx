import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streetcats",
  description: "Avvistamenti di gatti randagi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-white min-h-screen`}>
        <header className="bg-blue-100 border-b border-blue-200 px-8 py-5 mb-8 shadow-sm">
          <nav className="flex items-center gap-8">
            <Link href="/" className="font-bold text-2xl text-blue-800 tracking-tight hover:text-blue-600 transition-colors">Streetcats</Link>
            <div className="flex gap-6 ml-8">
              <Link href="/cats" className="hover:text-blue-600 transition-colors">Gatti</Link>
              <Link href="/about" className="hover:text-blue-600 transition-colors">About</Link>
            </div>
          </nav>
        </header>
        <main className="min-h-[80vh]">{children}</main>
        <footer className="text-center text-xs text-gray-500 py-6 border-t border-blue-100 bg-white/80 mt-12">
          © {new Date().getFullYear()} Streetcats &middot; Powered by Next.js
        </footer>
      </body>
    </html>
  );
}
