"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  shikiTokenizeToLines,
  type ShikiThemeChoice,
  type TokenLine,
  getThemeVariant,
} from "@/app/lib/magicMove/shikiHighlighter";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme: ShikiThemeChoice;
  className?: string;
  placeholder?: string;
  maxHeight?: number;
  maxLines?: number;
}

export function CodeEditor({
  value,
  onChange,
  language,
  theme,
  className,
  placeholder,
  maxHeight = 320,
  maxLines,
}: CodeEditorProps) {
  const [lines, setLines] = useState<TokenLine[] | null>(null);
  const [bg, setBg] = useState<string>("transparent");
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const variant = getThemeVariant(theme);

  // Measure the rendered code height (accounts for wrapped long lines) so the
  // card grows to fit instead of clipping. Re-measures on width/content changes.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const update = () => setMeasuredHeight(el.scrollHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lines, value]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      shikiTokenizeToLines({ code: value, lang: language, theme }).then((res) => {
        if (!cancelled) {
          setLines(res.lines);
          setBg(res.bg);
        }
      });
    }, 20); // 20ms debounce
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, language, theme]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setScroll({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLines) {
      const lines = newValue.split("\n");
      if (lines.length > maxLines) {
        onChange(lines.slice(0, maxLines).join("\n"));
        return;
      }
    }
    onChange(newValue);
  };

  const lineCount = value.split("\n").length;
  // Auto-size the editor to its content (so short steps get short cards) up to
  // maxHeight, then scroll. Prefer the measured height (handles wrapped lines);
  // fall back to a per-line estimate before the first measure.
  const LINE_PX = 24;
  const PAD_PX = 40;
  const MIN_PX = 80;
  const estimated = lineCount * LINE_PX + PAD_PX;
  const contentHeight = Math.max(MIN_PX, Math.min(maxHeight, measuredHeight || estimated));

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        className={cn(
          "relative font-mono text-sm leading-relaxed overflow-hidden transition-colors focus-within:ring-1 focus-within:ring-white/10",
          className,
        )}
        style={{ height: contentHeight }}
      >
        {/* Highlighting layer */}
        <div
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ backgroundColor: bg }}
        >
          <div
            ref={contentRef}
            className="p-5 whitespace-pre-wrap break-words font-mono text-[15px] leading-[1.7]"
            style={{
              transform: `translate(${-scroll.left}px, ${-scroll.top}px)`,
              willChange: "transform",
            }}
          >
            {lines ? (
              lines.map((line, i) => (
                <div key={i} className="min-h-[1.5em]">
                  {line.tokens.map((token, j) => (
                    <span key={j} style={{ color: token.color }}>
                      {token.content}
                    </span>
                  ))}
                  {line.tokens.length === 0 && <br />}
                </div>
              ))
            ) : (
              <div className="opacity-50 whitespace-pre-wrap">{value}</div>
            )}
          </div>
        </div>

        {/* Editing layer */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          spellCheck={false}
          placeholder={placeholder}
          style={{
            caretColor: variant === "dark" ? "white" : "black",
            height: contentHeight,
          }}
          className={cn(
            "relative z-10 block w-full p-5 m-0 bg-transparent text-transparent selection:text-transparent resize-none outline-none border-none rounded-none font-mono text-[15px] leading-[1.7] whitespace-pre-wrap break-words placeholder:text-muted-foreground/50 focus:ring-0 overflow-auto",
            variant === "dark" ? "selection:bg-white/30" : "selection:bg-black/20",
          )}
        />
      </div>
    </div>
  );
}
