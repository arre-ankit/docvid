"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Streamdown } from "streamdown";
import type { DocsBlock } from "@/app/lib/teach/types";

interface DocsViewProps {
  blocks: DocsBlock[];
  sourceUrl?: string | null;
  title?: string | null;
}

// Compact, readable typography for the narrow side panel. Code blocks are left
// to Streamdown (Shiki highlighting + copy buttons).
const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-6 mb-1 flex items-baseline gap-2 text-base font-semibold tracking-tight text-foreground first:mt-0">
      {children}
    </h2>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-2 text-[13px] leading-relaxed text-foreground/70">{children}</p>
  ),
};

/**
 * The docs "gist": each source code block as a step with an AI title + one-line
 * summary + the highlighted code. Built from a separate summarization call, not
 * the raw page markdown.
 */
export function DocsView({ blocks, sourceUrl, title }: DocsViewProps) {
  // Compose a small markdown doc so Streamdown can highlight the code blocks.
  const markdown = useMemo(() => {
    return blocks
      .map((b, i) => {
        const lang = b.lang || "";
        return `## ${i + 1}. ${b.title}\n\n${b.summary}\n\n\`\`\`${lang}\n${b.code}\n\`\`\``;
      })
      .join("\n\n");
  }, [blocks]);

  return (
    <div className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="mx-auto w-full min-w-0 max-w-2xl px-5 py-4">
        {title && <h1 className="mb-1 text-lg font-bold tracking-tight text-foreground">{title}</h1>}
        <p className="mb-4 text-xs text-muted-foreground">
          Key code examples from the docs, summarized.
        </p>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mb-4 flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{sourceUrl}</span>
          </a>
        )}
        <Streamdown
          className={[
            "min-w-0 max-w-full text-[13px] leading-relaxed [overflow-wrap:anywhere]",
            "[&_*]:max-w-full [&_pre]:overflow-x-auto [&_pre]:text-xs",
          ].join(" ")}
          components={components}
        >
          {markdown}
        </Streamdown>
      </div>
    </div>
  );
}
