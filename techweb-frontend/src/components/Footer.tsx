export default function Footer() {
  return (
    <footer
      className="text-center text-xs py-4"
      style={{
        background: "var(--color-primary)",
        color: "var(--color-accent)",
      }}
    >
      © {new Date().getFullYear()} Streetcats. Tutti i diritti riservati.
    </footer>
  );
}
