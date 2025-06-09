import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] px-2 sm:px-8 py-4">{children}</main>
      <Footer />
    </>
  );
}
