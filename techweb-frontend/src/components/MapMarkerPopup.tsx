import { Cat } from "../utils/types";
import Link from "next/link";

interface MapMarkerPopupProps {
  readonly cat: Cat;
}

export default function MapMarkerPopup({ cat }: MapMarkerPopupProps) {
  return (
    <div
      className="cat-popup p-2 min-w-[180px] max-w-[240px] text-sm"
      style={{ color: "var(--color-text-primary)" }}
    >
      <strong style={{ color: "var(--color-primary)" }}>{cat.title}</strong>
      <p style={{ color: "var(--color-text-secondary)" }}>{cat.description}</p>
      <Link href={`/cats/${cat.id}`} style={{ color: "var(--color-accent)" }}>
        Dettaglio
      </Link>
    </div>
  );
}
