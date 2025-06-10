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
    <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 px-2 sm:px-0">
      {cats.map((cat) => (
        <CatCard key={cat.id} cat={cat} />
      ))}
    </div>
  );
}
