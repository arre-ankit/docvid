"use client";

import { Eraser } from "lucide-react";
import { memo, useState } from "react";
import { CodeEditor } from "./code-editor";
import type { ShikiThemeChoice } from "@/app/lib/magicMove/shikiHighlighter";
import { getThemeBgColor, getThemeVariant } from "@/app/lib/magicMove/shikiHighlighter";

interface StepEditorItemProps {
  index: number;
  code: string;
  // Index-based so the parent can pass stable callbacks (keeps this memoized).
  onCodeChange: (index: number, code: string) => void;
  onClear: (index: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
  language: string;
  theme: ShikiThemeChoice;
  /** Optional AI title/description shown above the code (docs gist). */
  title?: string;
  description?: string;
  /** Read-only display (AI lesson): hide remove/clear controls. */
  readOnly?: boolean;
}

export const StepEditorItem = memo(function StepEditorItem({
  index,
  code,
  onCodeChange,
  onClear,
  onRemove,
  canRemove,
  language,
  theme,
  title,
  description,
  readOnly,
}: StepEditorItemProps) {
  const [closeHovered, setCloseHovered] = useState(false);
  const bgColor = getThemeBgColor(theme);
  const variant = getThemeVariant(theme);
  const dotColor = variant === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";

  const maxLines = 30;

  const showRemove = canRemove && !readOnly;

  return (
    <div className="flex flex-col gap-1.5">
      {/* AI title + description (docs gist), shown above the code. */}
      {(title || description) && (
        <div className="px-1">
          {title && (
            <div className="text-sm font-semibold text-foreground">
              {index + 1}. {title}
            </div>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="group relative shadow-2xl rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
        {/* Title bar */}
        <div
          className="flex items-center h-8 px-3.5"
          style={{ backgroundColor: bgColor }}
        >
          {/* macOS dots */}
          <div className="flex items-center gap-2">
            {showRemove ? (
              <button
                onClick={() => onRemove(index)}
                onMouseEnter={() => setCloseHovered(true)}
                onMouseLeave={() => setCloseHovered(false)}
                className="relative flex items-center justify-center w-3 h-3 rounded-full"
                style={{ backgroundColor: closeHovered ? "#ff5f57" : dotColor }}
              >
                {closeHovered && (
                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none" className="absolute">
                    <path d="M1 1L6 6M6 1L1 6" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </button>
            ) : (
              <span
                className="block w-3 h-3 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
            )}
            <span
              className="block w-3 h-3 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <span
              className="block w-3 h-3 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
          </div>
          {/* No step label — the title/description above the card identifies it. */}
        </div>

        {/* Code Editor */}
        <CodeEditor
          language={language}
          theme={theme}
          value={code}
          onChange={(next) => onCodeChange(index, next)}
          placeholder={`// Enter code for step ${index + 1}...`}
          maxLines={maxLines}
          maxHeight={maxLines * 22 + 48}
        />
      </div>
      {!readOnly && (
        <div className="flex items-center justify-end gap-1 p-[6px]">
          <button
            type="button"
            onClick={() => onClear(index)}
            aria-label={`Clear step ${index + 1}`}
            className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground focus-visible:outline-none"
          >
            <Eraser className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});
