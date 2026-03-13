"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

function normalizeMarkdownInput(content) {
  const text = String(content || "");
  const fencedMarkdownMatch = text.match(
    /^\s*```(?:md|markdown)?\s*\n([\s\S]*?)\n```\s*$/i,
  );
  if (fencedMarkdownMatch?.[1]) return fencedMarkdownMatch[1];
  return text;
}

export default function MarkdownText({ children, className = "" }) {
  const normalizedContent = normalizeMarkdownInput(children);

  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ ...props }) => <p className="my-0 leading-relaxed" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
          ),
          li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
          pre: ({ children }) => <>{children}</>,
          code: ({ className: codeClassName, children: codeChildren, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            if (match) {
              return <CodeBlock language={match[1]}>{codeChildren}</CodeBlock>;
            }
            return (
              <code
                className="font-mono text-accent/90 bg-accent/10 border border-accent/20 px-1 py-0.5 rounded text-[12px]"
                {...props}
              >
                {codeChildren}
              </code>
            );
          },
          table: ({ ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              className="border border-white/[0.1] bg-white/[0.03] px-2 py-1 text-left"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td className="border border-white/[0.08] px-2 py-1" {...props} />
          ),
          a: ({ href, children: anchorChildren }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {anchorChildren}
            </a>
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
