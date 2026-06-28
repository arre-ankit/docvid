"use client";

import { Fragment } from "react";
import { Plus, ChevronDown, ExternalLink } from "lucide-react";
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
import { CustomizeLockIcon, useLessonCustomize } from "@/components/lesson-customize-gate";
import { cn } from "@/lib/utils";

interface StepsEditorHeaderProps {
  selectedLang: string;
  onLangChange: (lang: string) => void;
  theme: ShikiThemeChoice;
  onThemeChange: (theme: ShikiThemeChoice) => void;
  onAddStep: () => void;
  hideAddStep?: boolean;
  /** Source docs URL the lesson was generated from, if any. */
  sourceUrl?: string | null;
}

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
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
  selectedLang,
  onLangChange,
  theme,
  onThemeChange,
  onAddStep,
  hideAddStep,
  sourceUrl,
}: StepsEditorHeaderProps) {
  const { canCustomize, promptSignIn } = useLessonCustomize();
  const sourceHost = sourceUrl ? hostFromUrl(sourceUrl) : null;

  const handleLangChange = (v: string) => {
    if (!canCustomize && v !== selectedLang) {
      promptSignIn();
      return;
    }
    onLangChange(v);
  };

  const handleThemeChange = (v: string) => {
    if (!canCustomize && v !== theme) {
      promptSignIn();
      return;
    }
    onThemeChange(v as ShikiThemeChoice);
  };

  return (
    <div className="flex-none flex items-center justify-between px-4 py-1.5 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10 gap-2">
      <div className="flex items-center gap-2 flex-1 justify-start">
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
            <DropdownMenuRadioGroup value={selectedLang} onValueChange={handleLangChange}>
              {AVAILABLE_LANGUAGES.map((item) => {
                const locked = !canCustomize && item !== selectedLang;
                return (
                  <DropdownMenuRadioItem
                    key={item}
                    value={item}
                    className={cn(locked && "opacity-75")}
                  >
                    <span className="flex w-full items-center gap-2">
                      {formatName(item)}
                      {locked && <CustomizeLockIcon />}
                    </span>
                  </DropdownMenuRadioItem>
                );
              })}
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
            <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
              {groupedThemes.map((group, i) => (
                <Fragment key={group.label}>
                  {i > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => {
                    const locked = !canCustomize && item !== theme;
                    return (
                      <DropdownMenuRadioItem
                        key={item}
                        value={item}
                        className={cn(locked && "opacity-75")}
                      >
                        <span className="flex w-full items-center gap-2">
                          {formatName(item)}
                          {locked && <CustomizeLockIcon />}
                        </span>
                      </DropdownMenuRadioItem>
                    );
                  })}
                </Fragment>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {!hideAddStep && <Separator orientation="vertical" />}

        {!hideAddStep && (
          <Button onClick={onAddStep} size="sm" className="h-7 gap-1" variant="default">
            <Plus className="w-3.5 h-3.5" /> New Step
          </Button>
        )}
      </div>

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={sourceHost ? `Open source docs · ${sourceHost}` : "Open source docs"}
          aria-label="Open the source docs this lesson was generated from"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-transparent text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ExternalLink className="size-4" />
        </a>
      )}
    </div>
  );
}
