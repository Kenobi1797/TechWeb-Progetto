import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // oppure un altro tema highlight.js

interface MarkdownViewerProps {
  readonly children: string;
  readonly className?: string;
}

export default function MarkdownViewer({ children, className }: MarkdownViewerProps) {
  return (
    <div className={className ?? "prose max-w-none"}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
