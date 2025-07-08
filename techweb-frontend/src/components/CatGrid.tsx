import { Cat } from "../utils/types";
import CatCard from "./CatCard";

interface CatGridProps {
  readonly cats: readonly Cat[];
}

export default function CatGrid({ cats }: CatGridProps) {
  if (cats.length === 0) {
    return (
      <div className="text-center mt-16 text-base sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-lg" style={{ background: "var(--color-surface)" }}>
          <div className="text-6xl opacity-50">🐱</div>
          <p className="font-semibold">Nessun avvistamento trovato</p>
          <p className="text-sm opacity-75">Sii il primo a condividere un avvistamento!</p>
        </div>
      </div>
    );
  }
  return (
    <section aria-label="Griglia avvistamenti gatti" tabIndex={-1}>
      <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-1 sm:px-2 md:px-0">
        {cats.map((cat) => (
          <CatCard key={`${cat.id}-${cat.title}`} cat={cat} />
        ))}
      </div>
    </section>
  );
}
