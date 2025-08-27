import React, { useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import Link from "next/link";
import "highlight.js/styles/github.css";

interface MarkdownViewerProps {
  readonly children: string;
  readonly className?: string;
  readonly compact?: boolean;
}

// Componente per immagini con fallback e caricamento lazy
const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className="relative w-full max-w-md mx-auto my-4 p-4 border-2 border-dashed rounded-lg text-center"
           style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="text-2xl mb-2">🖼️</div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {imageError ? "Errore caricamento immagine" : "Immagine non disponibile"}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-pulse text-gray-400">Caricamento...</div>
        </div>
      )}
      <Image
        src={src}
        alt={alt || 'Immagine'}
        width={400}
        height={300}
        className="rounded-lg shadow-md w-full h-auto max-h-64 object-cover transition-opacity duration-300"
        style={{ maxWidth: '100%', height: 'auto' }}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoading(false)}
        loading="lazy"
      />
    </div>
  );
};

// Componente per link personalizzati
const MarkdownLink = ({ href, children }: { href?: string; children: React.ReactNode }) => {
  if (!href) return <span>{children}</span>;
  
  // Controllo sicuro per window
  const isExternal = typeof window !== 'undefined' && href.startsWith('http') && !href.includes(window.location.hostname);
  
  if (isExternal) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:underline"
        style={{ color: "var(--color-secondary)" }}
      >
        {children}
        <span className="text-xs">↗</span>
      </a>
    );
  }
  
  return (
    <Link href={href} className="hover:underline" style={{ color: "var(--color-secondary)" }}>
      {children}
    </Link>
  );
};

// Componente per blockquote personalizzati
const MarkdownBlockquote = ({ children }: { children: React.ReactNode }) => (
  <blockquote 
    className="border-l-4 pl-4 py-2 my-4 italic rounded-r-lg"
    style={{ 
      borderColor: "var(--color-secondary)", 
      background: "var(--color-surface)",
      color: "var(--color-text-secondary)"
    }}
  >
    {children}
  </blockquote>
);

// Componente per codice personalizzato
const MarkdownCode = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const isBlock = className?.includes('language-');
  
  if (isBlock) {
    return (
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
        <code className={className}>{children}</code>
      </pre>
    );
  }
  
  return (
    <code 
      className="px-2 py-1 rounded text-sm font-mono"
      style={{ 
        background: "var(--color-surface)", 
        color: "var(--color-primary)",
        border: "1px solid var(--color-border)"
      }}
    >
      {children}
    </code>
  );
};

// Componenti per titoli personalizzati
const MarkdownH1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-bold mb-4 mt-6 text-center" style={{ color: "var(--color-primary)" }}>
    {children}
  </h1>
);

const MarkdownH2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-semibold mb-3 mt-5 text-center" style={{ color: "var(--color-primary)" }}>
    {children}
  </h2>
);

const MarkdownH3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium mb-2 mt-4 text-center" style={{ color: "var(--color-primary)" }}>
    {children}
  </h3>
);

// Componenti per testo
const MarkdownParagraph = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 leading-relaxed text-center" style={{ color: "var(--color-text-primary)" }}>
    {children}
  </p>
);

const MarkdownStrong = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-semibold" style={{ color: "var(--color-primary)" }}>
    {children}
  </strong>
);

const MarkdownEm = ({ children }: { children: React.ReactNode }) => (
  <em style={{ color: "var(--color-text-secondary)" }}>
    {children}
  </em>
);

// Configurazione dei componenti per ReactMarkdown
const markdownComponents: Components = {
  // Immagini personalizzate
  img: (props) => (
    <MarkdownImage 
      src={typeof props.src === 'string' ? props.src : undefined} 
      alt={props.alt} 
    />
  ),
  
  // Link personalizzati  
  a: (props) => (
    <MarkdownLink href={props.href}>
      {props.children}
    </MarkdownLink>
  ),
  
  // Blockquote personalizzati
  blockquote: (props) => (
    <MarkdownBlockquote>
      {props.children}
    </MarkdownBlockquote>
  ),
  
  // Codice personalizzato
  code: (props) => (
    <MarkdownCode className={props.className}>
      {props.children}
    </MarkdownCode>
  ),
  
  // Titoli personalizzati
  h1: (props) => (
    <MarkdownH1>
      {props.children}
    </MarkdownH1>
  ),
  h2: (props) => (
    <MarkdownH2>
      {props.children}
    </MarkdownH2>
  ),
  h3: (props) => (
    <MarkdownH3>
      {props.children}
    </MarkdownH3>
  ),
  
  // Paragrafi e testo
  p: (props) => (
    <MarkdownParagraph>
      {props.children}
    </MarkdownParagraph>
  ),
  strong: (props) => (
    <MarkdownStrong>
      {props.children}
    </MarkdownStrong>
  ),
  em: (props) => (
    <MarkdownEm>
      {props.children}
    </MarkdownEm>
  ),
};

export default function MarkdownViewer({ children, className, compact = false }: MarkdownViewerProps) {
  if (!children?.trim()) {
    return (
      <div className="text-center py-4" style={{ color: "var(--color-text-secondary)" }}>
        <em>Nessun contenuto da visualizzare</em>
      </div>
    );
  }

  const baseClass = compact 
    ? "prose prose-sm max-w-none" 
    : "prose prose-sm sm:prose lg:prose-lg max-w-none";

  return (
    <section
      className={`${className ?? baseClass} markdown-content text-center`}
      aria-label="Contenuto formattato"
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </section>
  );
}
