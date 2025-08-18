import { Cat } from "../utils/types";
import Link from "next/link";
import Image from "next/image";

interface MapMarkerPopupProps {
  readonly cat: Cat;
}

// Funzione per un rendering markdown semplificato e sicuro per i popup
function renderSimpleMarkdown(text: string): string {
  if (!text) return "";
  
  return text
    // Rimuovi markdown complesso che può causare problemi di layout
    .replace(/#{1,6}\s+/g, '') // Rimuovi headers
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic
    .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>') // Links
    .replace(/\n/g, '<br>') // Line breaks
    // Rimuovi altri elementi markdown complessi per stabilità
    .replace(/^[-*+]\s+/gm, '• ') // Liste semplici
    .replace(/^\d+\.\s+/gm, '• '); // Liste numerate come bullet
}

export default function MapMarkerPopup({ cat }: MapMarkerPopupProps) {
  // Trunca la descrizione per il popup se è troppo lunga
  const truncateDescription = (text: string | null, maxLength: number = 120) => {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength).trim() + "...";
  };

  const truncatedDescription = truncateDescription(cat.description);
  const simplifiedHtml = truncatedDescription ? renderSimpleMarkdown(truncatedDescription) : "";

  return (
    <div
      className="cat-popup p-3 min-w-[200px] max-w-[280px] text-sm"
      style={{ 
        color: "var(--color-text-primary)",
        minHeight: "120px", // Altezza minima fissa per evitare sbalzi
        maxHeight: "200px", // Altezza massima per evitare popup troppo grandi
        overflow: "hidden"
      }}
    >
      <div className="mb-2">
        <strong className="text-base block mb-1 leading-tight" style={{ color: "var(--color-primary)" }}>
          {cat.title}
        </strong>
        {cat.createdAt && (
          <small className="text-xs opacity-75 block">
            {new Date(cat.createdAt).toLocaleDateString('it-IT')}
          </small>
        )}
      </div>
      
      {simplifiedHtml && (
        <div 
          className="mb-3 text-xs leading-relaxed"
          style={{ 
            minHeight: "40px", // Altezza minima per il contenuto
            maxHeight: "60px",
            overflow: "hidden"
          }}
          dangerouslySetInnerHTML={{ __html: simplifiedHtml }}
        />
      )}
      
      {cat.imageUrl && (
        <div className="mb-2 relative w-full h-16"> {/* Ridotta altezza immagine */}
          <Image 
            src={cat.imageUrl} 
            alt={cat.title}
            fill
            className="object-cover rounded-md"
            sizes="(max-width: 280px) 100vw, 280px"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-auto">
        <Link 
          href={`/cats/${cat.id}`} 
          className="inline-flex px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 transition-colors no-underline"
          style={{ color: "var(--color-accent)" }}
        >
          📋 Dettagli
        </Link>
        <small className="text-xs opacity-60 font-mono">
          {cat.latitude.toFixed(3)}, {cat.longitude.toFixed(3)}
        </small>
      </div>
    </div>
  );
}
