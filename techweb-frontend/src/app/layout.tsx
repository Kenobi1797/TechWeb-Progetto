import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { DataProvider } from "../utils/DataContext";
import { ToastProvider } from "../utils/toast";

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
        className="antialiased min-h-screen flex flex-col gradient-bg"
        style={{ color: "var(--color-text-primary)" }}
      >
        <ToastProvider>
          <DataProvider>
            <Header />
            <main className="min-h-[80vh] flex-1 px-1 sm:px-0 gradient-bg">{children}</main>
            <Footer />
          </DataProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
