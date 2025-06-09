import Image from "next/image";
import Link from "next/link";
import { Cat } from "../lib/types";

interface CatCardProps {
  readonly cat: Cat;
}

export default function CatCard({ cat }: CatCardProps) {
  return (
    <div
      className="rounded-xl shadow-md hover:shadow-xl transition-shadow border flex flex-col overflow-hidden w-full h-full"
      style={{
        background: "var(--color-background)",
        borderColor: "var(--color-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      <Image
        src={cat.imageUrl}
        alt={cat.title}
        width={400}
        height={220}
        className="object-cover w-full h-48"
        priority
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-xl mb-1" style={{ color: "var(--color-primary)" }}>{cat.title}</h3>
        <p className="text-sm mb-2 line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>{cat.description}</p>
        <span className="text-xs mb-2" style={{ color: "var(--color-secondary)" }}>{new Date(cat.createdAt).toLocaleDateString()}</span>
        <Link
          href={`/cats/${cat.id}`}
          className="mt-auto font-semibold text-sm"
          style={{
            color: "var(--color-accent)",
          }}
        >
          Dettaglio &rarr;
        </Link>
      </div>
    </div>
  );
}
