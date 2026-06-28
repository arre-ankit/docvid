"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BackgroundCombobox } from "@/components/background-combobox";
import { LESSON_VOICES } from "@/app/lib/teach/voices";
import type { ExportFormat } from "@/app/lib/video/types";
import { ShareButton } from "@/components/share-button";
import { CustomizeGate, CustomizeLockIcon, useLessonCustomize } from "@/components/lesson-customize-gate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Format milliseconds as m:ss (e.g. 148979 -> "2:29"). */
function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  playheadMs: number;
  totalMs: number;
  onSeek: (ms: number) => void;
  onReset: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  disabled?: boolean;
  downloadUrl: string | null;
  downloadFormat: ExportFormat | null;
  isExporting: boolean;
  exportPhase: "rendering" | "saving" | null;
  exportProgress: number;
  onExport: (format: ExportFormat) => void;
  canExport: boolean;
  filename: string;
  lessonMode?: boolean;
  backgroundThemeId?: string;
  onBackgroundThemeIdChange?: (id: string) => void;
  captionThemeId?: string;
  onCaptionThemeIdChange?: (id: string) => void;
  lessonVoice?: string;
  onRevoice?: (voice: string) => void;
  isRevoicing?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showLineNumbers?: boolean;
  onShowLineNumbersChange?: (checked: boolean) => void;
}

export function PlayerControls({
  isPlaying,
  onPlayPause,
  playheadMs,
  totalMs,
  onSeek,
  onReset,
  soundEnabled,
  onSoundToggle,
  disabled = false,
  downloadUrl,
  downloadFormat,
  isExporting,
  exportPhase,
  exportProgress,
  onExport,
  canExport,
  filename,
  lessonMode = false,
  backgroundThemeId,
  onBackgroundThemeIdChange,
  captionThemeId,
  onCaptionThemeIdChange,
  lessonVoice,
  onRevoice,
  isRevoicing = false,
  isFullscreen = false,
  onToggleFullscreen,
  showLineNumbers,
  onShowLineNumbersChange,
}: PlayerControlsProps) {
  const { canCustomize, gateAction, promptSignIn } = useLessonCustomize();
  const [displayPlayheadMs, setDisplayPlayheadMs] = useState(playheadMs);
  const displayPlayheadRef = useRef(playheadMs);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const lastSeekTimeRef = useRef(0);
  const pendingSeekMsRef = useRef<number | null>(null);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusText = exportPhase === "saving" ? "Downloading" : "Rendering";

  const flushSeek = useCallback((ms: number) => {
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current);
      seekTimeoutRef.current = null;
    }
    pendingSeekMsRef.current = null;
    lastSeekTimeRef.current = performance.now();
    onSeek(ms);
  }, [onSeek]);

  const throttledSeek = useCallback((ms: number) => {
    const now = performance.now();
    pendingSeekMsRef.current = ms;

    if (now - lastSeekTimeRef.current >= 80) {
      flushSeek(ms);
      return;
    }

    if (seekTimeoutRef.current) return;

    seekTimeoutRef.current = setTimeout(() => {
      const pending = pendingSeekMsRef.current;
      seekTimeoutRef.current = null;
      if (pending !== null) {
        lastSeekTimeRef.current = performance.now();
        pendingSeekMsRef.current = null;
        onSeek(pending);
      }
    }, 80 - (now - lastSeekTimeRef.current));
  }, [onSeek, flushSeek]);

  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || lessonMode) {
      displayPlayheadRef.current = playheadMs;
      setDisplayPlayheadMs(playheadMs);
      return;
    }

    const hasWrapped = playheadMs < displayPlayheadRef.current;
    const hasDrifted = Math.abs(playheadMs - displayPlayheadRef.current) > 120;
    if (hasWrapped || hasDrifted) {
      displayPlayheadRef.current = playheadMs;
      setDisplayPlayheadMs(playheadMs);
    }
  }, [isPlaying, playheadMs, lessonMode]);

  useEffect(() => {
    if (!isPlaying || lessonMode) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
      return;
    }

    const tick = (now: number) => {
      const last = lastFrameRef.current ?? now;
      lastFrameRef.current = now;
      const dt = now - last;
      const next = totalMs <= 0
        ? 0
        : (displayPlayheadRef.current + dt) % totalMs;

      displayPlayheadRef.current = next;
      setDisplayPlayheadMs(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    displayPlayheadRef.current = playheadMs;
    setDisplayPlayheadMs(playheadMs);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastFrameRef.current = null;
    };
  }, [isPlaying, playheadMs, totalMs, lessonMode]);

  const voiceControl = lessonMode && onRevoice && (
    <Select
      value={lessonVoice}
      onValueChange={(v) => gateAction(() => onRevoice(v))}
      disabled={isRevoicing}
    >
      <SelectTrigger className="h-8 w-[8.5rem] text-xs">
        <SelectValue placeholder="Voice" />
      </SelectTrigger>
      <SelectContent>
        {LESSON_VOICES.map((v) => {
          const locked = !canCustomize && v.value !== lessonVoice;
          return (
            <SelectItem key={v.value} value={v.value} className={cn(locked && "opacity-75")}>
              <span className="flex w-full items-center gap-2">
                {v.label}
                {locked && <CustomizeLockIcon />}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 rounded-2xl p-3 shadow-lg ring-1 backdrop-blur-xl",
        isFullscreen
          ? "bg-zinc-900/95 text-zinc-200 ring-white/10 [&_.text-muted-foreground]:text-zinc-400"
          : "bg-background/60 ring-black/[0.08] dark:ring-white/[0.08]",
      )}
    >
      {/* Transport: play / scrubber / timecodes */}
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={onPlayPause}
          disabled={disabled}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </Button>

        <span className="w-10 shrink-0 text-right font-mono text-xs font-medium tabular-nums text-muted-foreground">
          {formatClock(displayPlayheadMs)}
        </span>

        <Slider
          value={[displayPlayheadMs]}
          max={Math.max(1, totalMs)}
          step={1}
          onValueChange={([value]) => {
            displayPlayheadRef.current = value;
            setDisplayPlayheadMs(value);
            throttledSeek(value);
          }}
          onValueCommit={([value]) => {
            flushSeek(value);
          }}
          disabled={disabled}
          className="flex-1 cursor-pointer py-2"
        />

        <span className="w-10 shrink-0 font-mono text-xs font-medium tabular-nums text-muted-foreground">
          {formatClock(totalMs)}
        </span>
      </div>

      {/* Options: styling on the left, voice + playback + export on the right */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t pt-2.5",
          isFullscreen ? "border-white/10" : "border-border/40",
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0",
              isFullscreen ? "text-zinc-400 hover:text-zinc-200" : "text-muted-foreground",
            )}
            onClick={onReset}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {onShowLineNumbersChange && (
            <CustomizeGate title="Sign in to toggle line numbers">
              <label
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
                title="Show line numbers"
              >
                <span className="whitespace-nowrap">Line numbers</span>
                <Switch checked={!!showLineNumbers} onCheckedChange={onShowLineNumbersChange} />
              </label>
            </CustomizeGate>
          )}

          {lessonMode && (onBackgroundThemeIdChange || onCaptionThemeIdChange) && (
            <div className="mx-0.5 hidden h-5 w-px bg-border/50 sm:block" />
          )}

          {lessonMode && onBackgroundThemeIdChange && (
            <div className="flex items-center gap-1" title="Frame background">
              <span className="text-xs whitespace-nowrap text-muted-foreground">Background</span>
              <BackgroundCombobox
                backgroundThemeId={backgroundThemeId ?? "none"}
                onBackgroundThemeIdChange={onBackgroundThemeIdChange}
                customizeLocked={!canCustomize}
                onLockedSelect={promptSignIn}
              />
            </div>
          )}
          {lessonMode && onCaptionThemeIdChange && (
            <div className="flex items-center gap-1" title="Caption background">
              <span className="text-xs whitespace-nowrap text-muted-foreground">Caption</span>
              <BackgroundCombobox
                backgroundThemeId={captionThemeId ?? "none"}
                onBackgroundThemeIdChange={onCaptionThemeIdChange}
                customizeLocked={!canCustomize}
                onLockedSelect={promptSignIn}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {voiceControl}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              isFullscreen ? "text-zinc-400 hover:text-zinc-200" : "text-muted-foreground",
            )}
            onClick={onSoundToggle}
            title={soundEnabled ? "Mute narration" : "Unmute narration"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                isFullscreen ? "text-zinc-400 hover:text-zinc-200" : "text-muted-foreground",
              )}
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
          <div className="mx-0.5 h-5 w-px bg-border/50" />
          <ShareButton
            className={cn(
              isFullscreen
                ? "border-white/15 text-zinc-200 hover:bg-white/10 hover:text-white"
                : "text-muted-foreground",
            )}
          />
          <CustomizeGate title="Sign in to export your lesson">
            {/* Export/download is hidden on phones (no practical file export there). */}
            <Button
              size="sm"
              className={cn("hidden min-w-[120px] sm:inline-flex", isExporting && "opacity-80")}
              onClick={() => gateAction(() => onExport("mp4"))}
              disabled={!canExport || isExporting}
            >
              <Download className="w-4 h-4" />
              {isExporting ? `${statusText} ${Math.round(exportProgress * 100)}%` : "Export"}
            </Button>
          </CustomizeGate>
        </div>
      </div>
    </div>
  );
}
