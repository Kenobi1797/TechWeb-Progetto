import { Cat } from "../utils/types";
import Link from "next/link";
import Image from "next/image";
import MarkdownViewer from "./MarkdownViewer";

interface MapMarkerPopupProps {
  readonly cat: Cat;
}

export default function MapMarkerPopup({ cat }: MapMarkerPopupProps) {
  // Trunca la descrizione per il popup se è troppo lunga
  const truncateDescription = (text: string | null, maxLength: number = 150) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength).trim() + "...";
  };

  const truncatedDescription = truncateDescription(cat.description);

  return (
    <div
      className="cat-popup p-3 min-w-[200px] max-w-[280px] text-sm"
      style={{ color: "var(--color-text-primary)" }}
    >
      <div className="mb-2">
        <strong className="text-base block mb-1" style={{ color: "var(--color-primary)" }}>
          {cat.title}
        </strong>
        {cat.createdAt && (
          <small className="text-xs opacity-75">
            {new Date(cat.createdAt).toLocaleDateString('it-IT')}
          </small>
        )}
      </div>
      
      {truncatedDescription && (
        <div className="mb-3">
          <MarkdownViewer 
            className="prose prose-xs max-w-none text-sm [&>*]:mb-1 [&>p]:mb-1 [&>h1]:text-sm [&>h2]:text-sm [&>h3]:text-sm"
          >
            {truncatedDescription}
          </MarkdownViewer>
        </div>
      )}
      
      {cat.imageUrl && (
        <div className="mb-2 relative w-full h-20">
          <Image 
            src={cat.imageUrl} 
            alt={cat.title}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 280px) 100vw, 280px"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <Link 
          href={`/cats/${cat.id}`} 
          className="inline-flex px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 transition-colors"
          style={{ color: "var(--color-accent)" }}
        >
          📋 Dettagli
        </Link>
        <small className="text-xs opacity-60">
          {cat.latitude.toFixed(4)}, {cat.longitude.toFixed(4)}
        </small>
      </div>
    </div>
  );
}
