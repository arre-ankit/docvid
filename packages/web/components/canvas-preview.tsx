"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackgroundCombobox } from "@/components/background-combobox";
import type { AnimationType, TokenFlowPreset } from "@/app/lib/magicMove/types";
import type { RenderTheme } from "@/app/lib/magicMove/codeLayout";
import { cn } from "@/lib/utils";

const PADDING_PRESETS = [48, 64, 128] as const;

interface CanvasPreviewProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  layoutError: string | null;
  onDismissError: () => void;
  isLoading?: boolean;
  filename: string;
  onFilenameChange: (value: string) => void;
  animationType: AnimationType;
  onAnimationTypeChange: (value: AnimationType) => void;
  tokenFlowPreset: TokenFlowPreset;
  onTokenFlowPresetChange: (value: TokenFlowPreset) => void;
  naturalFlow: boolean;
  onNaturalFlowChange: (value: boolean) => void;
  typingWpm: number;
  onTypingWpmChange: (value: number) => void;
  transitionMs: number;
  onTransitionMsChange: (value: number) => void;
  themeVariant: RenderTheme;
  backgroundPadding: number;
  backgroundThemeId: string;
  onBackgroundThemeIdChange: (id: string) => void;
  backgroundPaddingPx: number;
  onBackgroundPaddingPxChange: (value: number) => void;
  children?: React.ReactNode;
  overlay?: React.ReactNode;
  caption?: React.ReactNode;
  lessonMode?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
  isFullscreen?: boolean;
}

export function CanvasPreview({
  canvasRef,
  layoutError,
  onDismissError,
  isLoading,
  filename,
  onFilenameChange,
  animationType,
  onAnimationTypeChange,
  tokenFlowPreset,
  onTokenFlowPresetChange,
  naturalFlow,
  onNaturalFlowChange,
  typingWpm,
  onTypingWpmChange,
  transitionMs,
  onTransitionMsChange,
  themeVariant,
  backgroundPadding,
  backgroundThemeId,
  onBackgroundThemeIdChange,
  backgroundPaddingPx,
  onBackgroundPaddingPxChange,
  children,
  overlay,
  caption,
  lessonMode,
  containerRef,
  isFullscreen,
}: CanvasPreviewProps) {
  const hasShownRef = useRef(false);
  const shouldAnimate = !isLoading && !hasShownRef.current;

  if (!isLoading) {
    hasShownRef.current = true;
  }

  return (
    <div ref={containerRef} className="flex-1 relative min-h-0 flex flex-col bg-background">
      {layoutError && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-destructive/10 text-destructive border border-destructive/20 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{layoutError}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 hover:bg-destructive/20"
            onClick={onDismissError}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "flex-1 min-h-0 relative flex items-center justify-center p-8 bg-[url('/grid-pattern.svg')] dark:bg-[url('/grid-pattern-dark.svg')] bg-center",
          // Fullscreen: fit the video, no scrolling. Otherwise scroll vertically only.
          isFullscreen ? "overflow-hidden" : "overflow-y-auto overflow-x-hidden",
        )}
      >
        {!isLoading && (
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "relative rounded-lg overflow-hidden",
                backgroundPadding > 0
                  ? ""
                  : "shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-zinc-950",
                shouldAnimate ? "opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]" : "opacity-100",
              )}
            >
              <canvas ref={canvasRef} className="block" />
              {/* Filename input overlay - displays title in preview */}
              <div
                className="absolute left-0 right-0 h-10 flex items-center justify-center"
                style={{ top: backgroundPadding }}
              >
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => onFilenameChange(e.target.value)}
                  className={cn(
                    "bg-transparent text-center text-sm border-none outline-none focus:ring-0 focus:outline-none w-48 px-2 py-1 cursor-text",
                    themeVariant === "dark"
                      ? "text-white/80 placeholder:text-white/25"
                      : "text-black/80 placeholder:text-black/25"
                  )}
                  placeholder="Title ✨"
                />
              </div>
              {/* Lesson intro card, overlaid on the code frame. */}
              {overlay}
            </div>
          </div>
        )}

        {/* Lesson caption — pinned to the bottom of the preview viewport so it's
            always visible (including fullscreen), never clipped by a tall frame.
            The exported video burns the caption into the frame separately. */}
        {caption && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-4">
            {caption}
          </div>
        )}

        {/* In lesson mode the timing follows the audio, so the only relevant
            control (Background) lives next to the audio button instead. */}
        {!lessonMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex w-[min(calc(100%-2rem),56rem)] flex-col items-center gap-2">
          {/* Floating settings pill (typing animation only) */}
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl bg-background/60 px-3 py-1.5 shadow-lg ring-1 ring-black/[0.08] backdrop-blur-xl dark:ring-white/[0.08]">
            <span className="text-sm whitespace-nowrap text-foreground/70">Background:</span>
            <BackgroundCombobox
              backgroundThemeId={backgroundThemeId}
              onBackgroundThemeIdChange={onBackgroundThemeIdChange}
            />

            {backgroundThemeId !== "none" && (
              <>
                <div className="h-4 w-px bg-border/50" />
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm text-foreground/70">Padding:</span>
                  <Tabs
                    value={String(backgroundPaddingPx)}
                    onValueChange={(v) => onBackgroundPaddingPxChange(Number(v))}
                    className="w-fit"
                  >
                    <TabsList variant="transparent">
                      {PADDING_PRESETS.map((px) => (
                        <TabsTrigger key={px} value={String(px)}>
                          {px}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Player controls live below the preview (in normal flow) so they never
          overlap the code frame or its caption, however tall the code gets. */}
      <div className="relative z-10 shrink-0 px-4 pb-3 pt-1">{children}</div>
    </div>
  );
}
