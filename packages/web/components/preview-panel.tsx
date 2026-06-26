"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResizablePanel } from "@/components/ui/resizable";
import { CanvasPreview } from "./canvas-preview";
import { PlayerControls } from "./player-controls";
import { PLAYER_SHORTCUTS, type PlayerShortcutId } from "./keyboard-shortcuts";
import type { AnimationType, TokenFlowPreset } from "@/app/lib/magicMove/types";
import type { RenderTheme } from "@/app/lib/magicMove/codeLayout";
import type { ExportFormat } from "@/app/lib/video/types";

// How far an arrow-key seek jumps.
const SEEK_STEP_MS = 2000;

interface PreviewPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  layoutError: string | null;
  onDismissError: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playheadMs: number;
  totalMs: number;
  onSeek: (ms: number) => void;
  onReset: () => void;
  stepLayouts: unknown[] | null;
  transitionMs: number;
  onTransitionMsChange: (value: number) => void;
  downloadUrl: string | null;
  downloadFormat: ExportFormat | null;
  isExporting: boolean;
  exportPhase: "rendering" | "saving" | null;
  exportProgress: number;
  onExport: (format: ExportFormat) => void;
  canExport: boolean;
  filename: string;
  onFilenameChange: (value: string) => void;
  animationType: AnimationType;
  onAnimationTypeChange: (value: AnimationType) => void;
  tokenFlowPreset: TokenFlowPreset;
  onTokenFlowPresetChange: (value: TokenFlowPreset) => void;
  typingWpm: number;
  onTypingWpmChange: (value: number) => void;
  naturalFlow: boolean;
  onNaturalFlowChange: (value: boolean) => void;
  themeVariant: RenderTheme;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  backgroundPadding: number;
  backgroundThemeId: string;
  onBackgroundThemeIdChange: (id: string) => void;
  captionThemeId: string;
  onCaptionThemeIdChange: (id: string) => void;
  lessonVoice: string;
  onRevoice: (voice: string) => void;
  isRevoicing: boolean;
  showLineNumbers: boolean;
  onShowLineNumbersChange: (checked: boolean) => void;
  backgroundPaddingPx: number;
  onBackgroundPaddingPxChange: (value: number) => void;
  overlay?: React.ReactNode;
  caption?: React.ReactNode;
  lessonMode?: boolean;
}

export function PreviewPanel({
  canvasRef,
  layoutError,
  onDismissError,
  isPlaying,
  onPlayPause,
  playheadMs,
  totalMs,
  onSeek,
  onReset,
  stepLayouts,
  transitionMs,
  onTransitionMsChange,
  downloadUrl,
  downloadFormat,
  isExporting,
  exportPhase,
  exportProgress,
  onExport,
  canExport,
  filename,
  onFilenameChange,
  animationType,
  onAnimationTypeChange,
  tokenFlowPreset,
  onTokenFlowPresetChange,
  typingWpm,
  onTypingWpmChange,
  naturalFlow,
  onNaturalFlowChange,
  themeVariant,
  soundEnabled,
  onSoundToggle,
  backgroundPadding,
  backgroundThemeId,
  onBackgroundThemeIdChange,
  captionThemeId,
  onCaptionThemeIdChange,
  lessonVoice,
  onRevoice,
  isRevoicing,
  showLineNumbers,
  onShowLineNumbersChange,
  backgroundPaddingPx,
  onBackgroundPaddingPxChange,
  overlay,
  caption,
  lessonMode,
}: PreviewPanelProps) {
  // Fullscreen the whole preview (canvas + controls) via the Fullscreen API.
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current?.requestFullscreen?.();
  }, []);

  // Map each shortcut id (from the shared PLAYER_SHORTCUTS list that the header
  // hints also render) to its action, so the bindings and the on-screen hints
  // can never drift apart.
  const actions = useMemo<Record<PlayerShortcutId, () => void>>(
    () => ({
      playPause: onPlayPause,
      mute: onSoundToggle,
      fullscreen: onToggleFullscreen,
      restart: onReset,
      back: () => onSeek(Math.max(0, playheadMs - SEEK_STEP_MS)),
      forward: () => onSeek(Math.min(totalMs, playheadMs + SEEK_STEP_MS)),
    }),
    [onPlayPause, onSoundToggle, onToggleFullscreen, onReset, onSeek, playheadMs, totalMs],
  );

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      return (
        node.tagName === "INPUT" ||
        node.tagName === "TEXTAREA" ||
        node.isContentEditable === true
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack typing or browser/OS shortcuts.
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const match = PLAYER_SHORTCUTS.find((s) => (s.keys as readonly string[]).includes(key));
      if (!match) return;
      e.preventDefault();
      actions[match.id]();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);

  return (
    <ResizablePanel
      defaultSize={100}
      minSize={50}
      className="flex flex-col h-full bg-zinc-950/5 dark:bg-black"
    >
      <CanvasPreview
        containerRef={containerRef}
        isFullscreen={isFullscreen}
        canvasRef={canvasRef}
        layoutError={layoutError}
        onDismissError={onDismissError}
        isLoading={!stepLayouts}
        filename={filename}
        onFilenameChange={onFilenameChange}
        animationType={animationType}
        onAnimationTypeChange={onAnimationTypeChange}
        tokenFlowPreset={tokenFlowPreset}
        onTokenFlowPresetChange={onTokenFlowPresetChange}
        naturalFlow={naturalFlow}
        onNaturalFlowChange={onNaturalFlowChange}
        typingWpm={typingWpm}
        onTypingWpmChange={onTypingWpmChange}
        transitionMs={transitionMs}
        onTransitionMsChange={onTransitionMsChange}
        themeVariant={themeVariant}
        backgroundPadding={backgroundPadding}
        backgroundThemeId={backgroundThemeId}
        onBackgroundThemeIdChange={onBackgroundThemeIdChange}
        backgroundPaddingPx={backgroundPaddingPx}
        onBackgroundPaddingPxChange={onBackgroundPaddingPxChange}
        overlay={overlay}
        caption={caption}
        lessonMode={lessonMode}
      >
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          playheadMs={playheadMs}
          totalMs={totalMs}
          onSeek={onSeek}
          onReset={onReset}
          disabled={!stepLayouts}
          soundEnabled={soundEnabled}
          onSoundToggle={onSoundToggle}
          downloadUrl={downloadUrl}
          downloadFormat={downloadFormat}
          isExporting={isExporting}
          exportPhase={exportPhase}
          exportProgress={exportProgress}
          onExport={onExport}
          canExport={canExport}
          filename={filename}
          lessonMode={lessonMode}
          backgroundThemeId={backgroundThemeId}
          onBackgroundThemeIdChange={onBackgroundThemeIdChange}
          captionThemeId={captionThemeId}
          onCaptionThemeIdChange={onCaptionThemeIdChange}
          lessonVoice={lessonVoice}
          onRevoice={onRevoice}
          isRevoicing={isRevoicing}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          showLineNumbers={showLineNumbers}
          onShowLineNumbersChange={onShowLineNumbersChange}
        />
      </CanvasPreview>
    </ResizablePanel>
  );
}
