"use client";

export default function CatCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse">
      {/* Immagine skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Contenuto skeleton */}
      <div className="p-4 space-y-3">
        {/* Titolo skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        
        {/* Descrizione skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        {/* Data skeleton */}
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        
        {/* Posizione skeleton */}
        <div className="h-3 bg-gray-200 rounded w-3/5"></div>
      </div>
    </div>
  );
}

interface CatGridSkeletonProps {
  readonly count?: number;
}

export function CatGridSkeleton({ count = 6 }: CatGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <CatCardSkeleton key={i} />
      ))}
    </div>
  );
}
