import { Cat } from "../utils/types";
import Link from "next/link";
import Image from "next/image";

interface MapMarkerPopupProps {
  readonly cat: Cat;
}

export default function MapMarkerPopup({ cat }: MapMarkerPopupProps) {
  return (
    <div className="cat-popup relative overflow-hidden">
      {/* Contenuto principale del popup */}
      <div className="p-4 min-w-[200px] max-w-[300px] w-full">
        {/* Titolo con design moderno */}
        <div className="mb-3">
          <h3 
            className="text-lg font-bold leading-tight text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            {cat.title}
          </h3>
        </div>
        
        {/* Immagine con effetti moderni */}
        {cat.imageUrl && (
          <div className="mb-4 relative w-full h-32 overflow-hidden rounded-2xl group">
            <Image 
              src={cat.imageUrl} 
              alt={cat.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 300px) 100vw, 300px"
            />
            {/* Overlay gradient sottile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
        
        {/* Bottone moderno con micro-interazioni */}
        <div className="text-center">
          <Link 
            href={`/cats/${cat.id}`} 
            className="group relative inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 no-underline overflow-hidden"
          >
            {/* Effetto shimmer di sfondo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
            
            {/* Contenuto del bottone */}
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg transform group-hover:rotate-12 transition-transform duration-300">🐾</span>
              <span className="font-medium">Scopri di più</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
      
      {/* Decorazione sottile */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-60"></div>
    </div>
  );
}
