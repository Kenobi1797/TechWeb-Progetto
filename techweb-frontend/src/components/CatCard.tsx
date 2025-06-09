import Image from "next/image";
import Link from "next/link";
import { Cat } from "../lib/types";

interface CatCardProps {
  readonly cat: Cat;
}

export default function CatCard({ cat }: CatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-blue-100 flex flex-col overflow-hidden">
      <Image
        src={cat.imageUrl}
        alt={cat.title}
        width={400}
        height={220}
        className="object-cover w-full h-48"
        priority
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-xl text-blue-800 mb-1">{cat.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cat.description}</p>
        <span className="text-xs text-gray-400 mb-2">{new Date(cat.createdAt).toLocaleDateString()}</span>
        <Link
          href={`/cats/${cat.id}`}
          className="mt-auto text-blue-600 hover:underline font-semibold text-sm"
        >
          Dettaglio &rarr;
        </Link>
      </div>
    </div>
  );
}
