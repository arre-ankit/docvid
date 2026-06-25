"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldDescription,
} from "@/components/ui/field";
import { MinusIcon, PlusIcon } from "lucide-react";

interface SettingsPopoverProps {
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
}

export function SettingsPopover({
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
}: SettingsPopoverProps) {
  return (
    <div className="space-y-4">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Configuration</FieldLegend>
          <FieldDescription>Adjust rendering settings</FieldDescription>

          <Separator />

          <FieldGroup>
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Line Numbers
            </Label>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="line-numbers">Show Line Numbers</FieldLabel>
              <Switch
                id="line-numbers"
                checked={showLineNumbers}
                onCheckedChange={onShowLineNumbersChange}
              />
            </Field>
            {showLineNumbers && (
              <Field orientation="horizontal">
                <FieldLabel htmlFor="number-of-gpus-f6l">Start Line</FieldLabel>
                <ButtonGroup>
                  <Input
                    id="number-of-gpus-f6l"
                    value={startLine}
                    onChange={(e) => onStartLineChange(Number(e.target.value))}
                    size={3}
                    className="h-8 !w-14 font-mono"
                    maxLength={3}
                  />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    type="button"
                    aria-label="Decrement"
                    onClick={() => onStartLineChange(startLine - 1)}
                    disabled={startLine <= 1}
                  >
                    <MinusIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    type="button"
                    aria-label="Increment"
                    onClick={() => onStartLineChange(startLine + 1)}
                    disabled={startLine >= 999}
                  >
                    <PlusIcon />
                  </Button>
                </ButtonGroup>
              </Field>
            )}
          </FieldGroup>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
