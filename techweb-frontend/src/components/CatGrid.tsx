import { Cat } from "../utils/types";
import CatCard from "./CatCard";

interface CatGridProps {
  readonly cats: readonly Cat[];
}

export default function CatGrid({ cats }: CatGridProps) {
  if (cats === undefined) {
    // Skeleton loader per caricamento dati
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map(() => (
          <div key="skeleton" className="animate-pulse bg-gray-200 rounded-xl h-64 w-full" />
        ))}
      </div>
    );
  }
  if (cats.length === 0) {
    return (
      <div className="text-center mt-8 text-base sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
        <div className="inline-flex flex-col items-center gap-4 p-8 rounded-lg" style={{ background: "var(--color-surface)" }}>
          <div className="text-6xl opacity-50">🐱</div>
          <p className="font-semibold">Al momento non ci sono avvistamenti da mostrare</p>
          <p className="text-sm opacity-75">Sii il primo a condividere un avvistamento nella tua zona!</p>
        </div>
      </div>
    );
  }
  return (
    <section aria-label="Griglia avvistamenti gatti" tabIndex={-1}>
      <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 px-1 sm:px-2 md:px-0">
        {cats.map((cat) => (
          <CatCard key={`${cat.id}-${cat.title}`} cat={cat} />
        ))}
      </div>
    </section>
  );
}
