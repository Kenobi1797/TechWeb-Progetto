export default function Footer() {
  return (
    <footer
      className="w-full text-center text-xs py-4 px-2 sm:px-8 break-words mb-0"
      style={{
        background: "var(--color-primary)",
        color: "var(--color-accent)",
      }}
    >
      © {new Date().getFullYear()} Streetcats. Tutti i diritti riservati.
    </footer>
  );
}
