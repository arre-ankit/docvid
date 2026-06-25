"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  getAllBackgroundThemes,
  getBackgroundThemeById,
} from "@/app/lib/magicMove/backgroundThemes";
import { cn } from "@/lib/utils";

const groupedBackgroundThemes = (() => {
  const themes = getAllBackgroundThemes();
  const orgIds = themes.filter((t) => t.group === "org").map((t) => t.id);
  const gradientIds = themes.filter((t) => t.group !== "org").map((t) => t.id);
  return [
    { label: "Default", items: ["none"] },
    { label: "Orgs", items: orgIds },
    { label: "Gradient", items: gradientIds },
  ];
})();

function backgroundThemeLabel(id: string): string {
  if (id === "none") return "None";
  return getBackgroundThemeById(id)?.name ?? id;
}

interface BackgroundComboboxProps {
  backgroundThemeId: string;
  onBackgroundThemeIdChange: (id: string) => void;
}

export function BackgroundCombobox({
  backgroundThemeId,
  onBackgroundThemeIdChange,
}: BackgroundComboboxProps) {
  const activeBackgroundTheme = getBackgroundThemeById(backgroundThemeId);

  return (
    <Combobox
      items={groupedBackgroundThemes}
      value={backgroundThemeId}
      onValueChange={(v) => v && onBackgroundThemeIdChange(v as string)}
      itemToStringLabel={(value) => backgroundThemeLabel(value as string)}
    >
      <ComboboxTrigger className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-1.5 transition-colors hover:bg-foreground/10 data-[popup-open]:bg-foreground/10">
        <span
          className={cn(
            "inline-block h-4 w-4 shrink-0 rounded-full ring-1",
            activeBackgroundTheme
              ? "ring-black/10"
              : "border border-dashed border-foreground/30 bg-transparent ring-foreground/20",
          )}
          style={activeBackgroundTheme ? { backgroundColor: activeBackgroundTheme.previewColor } : undefined}
        />
      </ComboboxTrigger>
      <ComboboxContent className="min-w-48">
        <ComboboxInput placeholder="Search themes..." className="h-7 text-sm" showTrigger={false} />
        <ComboboxEmpty>No themes found</ComboboxEmpty>
        <ComboboxList>
          {(group, index) => (
            <ComboboxGroup key={group.label} items={group.items}>
              <ComboboxLabel>{group.label}</ComboboxLabel>
              <ComboboxCollection>
                {(item) => {
                  const bgTheme = getBackgroundThemeById(item);
                  return (
                    <ComboboxItem key={item} value={item}>
                      <span className="flex items-center gap-2">
                        {bgTheme ? (
                          <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: bgTheme.previewColor }}
                          />
                        ) : (
                          <span className="inline-block h-3 w-3 shrink-0 rounded-full bg-transparent ring-1 ring-black/10 dark:ring-white/10" />
                        )}
                        {backgroundThemeLabel(item)}
                      </span>
                    </ComboboxItem>
                  );
                }}
              </ComboboxCollection>
              {index < groupedBackgroundThemes.length - 1 && <ComboboxSeparator />}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
