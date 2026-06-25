"use client";

import { Fragment } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AVAILABLE_LANGUAGES,
  getGroupedThemes,
  type ShikiThemeChoice,
} from "@/app/lib/magicMove/shikiHighlighter";

interface StepsEditorHeaderProps {
  stepCount: number;
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
  /** Hide the "New Step" button (e.g. AI lesson view). */
  hideAddStep?: boolean;
}

function formatName(name: string) {
  return name
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const groupedThemes = getGroupedThemes();

export function StepsEditorHeader({
  stepCount,
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
  hideAddStep,
}: StepsEditorHeaderProps) {
  return (
    <div className="flex-none flex items-center justify-between px-4 py-1.5 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10 gap-2">
      <div className="flex items-center gap-2 flex-1 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-[136px] items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 text-xs text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span className="truncate">{formatName(selectedLang)}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-72 w-auto min-w-[150px] text-xs">
            <DropdownMenuRadioGroup value={selectedLang} onValueChange={(v) => onLangChange(v)}>
              {AVAILABLE_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem key={item} value={item}>
                  {formatName(item)}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-8 w-[160px] items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2.5 text-xs text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span className="truncate">{formatName(theme)}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 w-auto min-w-[200px] text-xs">
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(v) => onThemeChange(v as ShikiThemeChoice)}
            >
              {groupedThemes.map((group, i) => (
                <Fragment key={group.label}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => (
                    <DropdownMenuRadioItem key={item} value={item}>
                      {formatName(item)}
                    </DropdownMenuRadioItem>
                  ))}
                </Fragment>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {!hideAddStep && <Separator orientation="vertical" />}

        {!hideAddStep && (
          <Button
            onClick={onAddStep}
            size="sm"
            className="h-7 gap-1"
            variant="default"
          >
            <Plus className="w-3.5 h-3.5" /> New Step
          </Button>
        )}
      </div>
    </div>
  );
}
