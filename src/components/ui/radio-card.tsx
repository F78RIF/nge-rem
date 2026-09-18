"use client";

import { useId, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type RadioCardOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type RadioCardGroupProps = {
  name: string;
  legend: string;
  options: RadioCardOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Sembunyikan legend secara visual tetapi tetap dibaca screen reader. */
  hideLegend?: boolean;
  className?: string;
};

/**
 * Grup pilihan berbentuk kartu. Memakai radio native agar navigasi panah,
 * Tab, dan screen reader bekerja tanpa JS tambahan.
 */
export function RadioCardGroup({
  name,
  legend,
  options,
  value,
  onChange,
  hideLegend,
  className,
}: RadioCardGroupProps) {
  const groupId = useId();
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className={cn("mb-1 text-sm font-semibold", hideLegend && "sr-only")}>{legend}</legend>
      {options.map((opt, i) => {
        const id = `${groupId}-${i}`;
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "group relative flex cursor-pointer items-start gap-3 rounded-card border-2 bg-surface p-4 transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-info",
              checked ? "border-brand bg-brand-50" : "border-border hover:border-charcoal-muted",
              opt.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              disabled={opt.disabled}
              onChange={() => onChange?.(opt.value)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                checked ? "border-brand bg-brand text-white" : "border-charcoal-muted",
              )}
            >
              {checked && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="font-semibold">{opt.label}</span>
              {opt.description && (
                <span className="text-caption text-charcoal-muted">{opt.description}</span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
