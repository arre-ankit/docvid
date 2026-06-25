"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanel } from "@/components/ui/resizable";
import { StepsEditorHeader } from "./steps-editor-header";
import { StepEditorItem } from "./step-editor-item";
import type { SimpleStep } from "@/app/lib/magicMove/types";
import type { ShikiThemeChoice } from "@/app/lib/magicMove/shikiHighlighter";
import type { DocsBlock } from "@/app/lib/teach/types";

interface StepsEditorProps {
  steps: SimpleStep[];
  selectedLang: string;
  onLangChange: (lang: string) => void;
  theme: ShikiThemeChoice;
  onThemeChange: (theme: ShikiThemeChoice) => void;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (checked: boolean) => void;
  startLine: number;
  onStartLineChange: (value: number) => void;
  fps: number;
  onFpsChange: (value: number) => void;
  startHoldMs: number;
  onStartHoldMsChange: (value: number) => void;
  betweenHoldMs: number;
  onBetweenHoldMsChange: (value: number) => void;
  endHoldMs: number;
  onEndHoldMsChange: (value: number) => void;
  onAddStep: () => void;
  onInsertStep: (atIndex: number) => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, code: string) => void;
  onClearStep: (index: number) => void;
  scrollToEndTrigger?: number;
  /** Summarized source code blocks (the docs "gist"), if any. */
  docsBlocks?: DocsBlock[] | null;
  docsTitle?: string | null;
  sourceUrl?: string | null;
}

export function StepsEditor({
  steps,
  selectedLang,
  onLangChange,
  theme,
  onThemeChange,
  showLineNumbers,
  onShowLineNumbersChange,
  startLine,
  onStartLineChange,
  fps,
  onFpsChange,
  startHoldMs,
  onStartHoldMsChange,
  betweenHoldMs,
  onBetweenHoldMsChange,
  endHoldMs,
  onEndHoldMsChange,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onClearStep,
  scrollToEndTrigger,
  docsBlocks,
}: StepsEditorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollToEndTrigger) return;
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [scrollToEndTrigger]);

  return (
    <ResizablePanel
      defaultSize={60}
      minSize={35}
      className="flex flex-col h-full bg-muted/10 overflow-hidden"
    >
      <StepsEditorHeader
        stepCount={steps.length}
        selectedLang={selectedLang}
        onLangChange={onLangChange}
        theme={theme}
        onThemeChange={onThemeChange}
        showLineNumbers={showLineNumbers}
        onShowLineNumbersChange={onShowLineNumbersChange}
        startLine={startLine}
        onStartLineChange={onStartLineChange}
        fps={fps}
        onFpsChange={onFpsChange}
        startHoldMs={startHoldMs}
        onStartHoldMsChange={onStartHoldMsChange}
        betweenHoldMs={betweenHoldMs}
        onBetweenHoldMsChange={onBetweenHoldMsChange}
        endHoldMs={endHoldMs}
        onEndHoldMsChange={onEndHoldMsChange}
        onAddStep={onAddStep}
        hideAddStep
      />

      <ScrollArea ref={scrollRef} className="flex-1 w-full min-h-0">
        <div className="py-3 px-4 space-y-7 max-w-4xl mx-auto w-full pb-6">
          {/* Lesson viewer: steps are read-only (no add/remove/clear). */}
          {steps.map((step, index) => (
            <StepEditorItem
              key={step.id}
              index={index}
              code={step.code}
              onCodeChange={onUpdateStep}
              onClear={onClearStep}
              onRemove={onRemoveStep}
              canRemove={false}
              language={selectedLang}
              theme={theme}
              title={docsBlocks?.[index]?.title}
              description={docsBlocks?.[index]?.summary}
              readOnly
            />
          ))}
        </div>
      </ScrollArea>
    </ResizablePanel>
  );
}
