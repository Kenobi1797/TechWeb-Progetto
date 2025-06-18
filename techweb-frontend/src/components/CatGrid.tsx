import { Cat } from "../utils/types";
import CatCard from "./CatCard";

interface CatGridProps {
  readonly cats: readonly Cat[];
}

export default function CatGrid({ cats }: CatGridProps) {
  if (cats.length === 0) {
    return (
      <div className="text-center mt-16 text-base sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
        Nessun avvistamento trovato.
      </div>
    );
  }
  return (
    <section aria-label="Griglia avvistamenti gatti" tabIndex={-1}>
      <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 px-1 sm:px-2 md:px-0">
        {cats.map((cat) => (
          <CatCard key={`${cat.id}-${cat.title}`} cat={cat} />
        ))}
      </div>
    </section>
  );
}
