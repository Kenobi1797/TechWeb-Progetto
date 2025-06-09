import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="min-h-[80vh]">{children}</main>
      <Footer />
    </>
  );
}
