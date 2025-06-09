import { Cat } from "../lib/types";
import Link from "next/link";

interface MapMarkerPopupProps {
  readonly cat: Cat;
}

export default function MapMarkerPopup({ cat }: MapMarkerPopupProps) {
  return (
    <div className="cat-popup">
      <strong>{cat.title}</strong>
      <p>{cat.description}</p>
      <Link href={`/cats/${cat.id}`}>Dettaglio</Link>
    </div>
  );
}
