import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { DataProvider } from "../contexts/DataContext";

export const metadata: Metadata = {
  title: "Home | Streetcats",
  description: "Avvistamenti di gatti randagi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{ background: "var(--color-background)", color: "var(--color-text-primary)" }}
      >
        <DataProvider>
          <Header />
          <main className="min-h-[80vh] flex-1 px-1 sm:px-0">{children}</main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}
