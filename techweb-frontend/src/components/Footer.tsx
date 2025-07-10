export default function Footer() {
  return (
    <footer
      className="w-full text-center text-xs py-5 px-2 sm:px-10 break-words flex-shrink-0 mb-0 shadow-xl fade-in"
      style={{
        background: "var(--color-primary)",
        color: "var(--color-accent)",
        marginBottom: 0,
        letterSpacing: "0.5px",
        fontWeight: 600,
        boxShadow: "0 -2px 24px 0 rgba(60,72,88,0.10)",
      }}
      role="contentinfo"
      aria-label="Footer"
    >
      © {new Date().getFullYear()} Streetcats. Tutti i diritti riservati.
    </footer>
  );
}
