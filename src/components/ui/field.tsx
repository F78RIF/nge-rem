"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  hint?: ReactNode;
  /** Pesan error harus menjelaskan cara memperbaiki (Bab 35). */
  error?: string;
  optional?: boolean;
};

const control =
  "w-full min-h-11 rounded-xl border bg-surface px-4 text-body text-charcoal placeholder:text-charcoal-muted/70 " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-info " +
  "disabled:cursor-not-allowed disabled:bg-background disabled:text-charcoal-muted";

function controlState(error?: string) {
  return error
    ? "border-brand focus-visible:outline-brand"
    : "border-border hover:border-charcoal-muted";
}

function useFieldIds(idProp?: string) {
  const auto = useId();
  const id = idProp ?? auto;
  return { id, hintId: `${id}-hint`, errorId: `${id}-error` };
}

function describedBy(ids: ReturnType<typeof useFieldIds>, hint?: ReactNode, error?: string) {
  return [hint && ids.hintId, error && ids.errorId].filter(Boolean).join(" ") || undefined;
}

function FieldShell({
  id,
  hintId,
  errorId,
  label,
  hint,
  error,
  optional,
  children,
}: FieldProps & ReturnType<typeof useFieldIds> & { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-charcoal">
        {label}
        {optional && <span className="ml-1 font-normal text-charcoal-muted">(opsional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="text-caption text-charcoal-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-caption font-medium text-brand">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  optional,
  id: idProp,
  className,
  ...props
}: FieldProps & ComponentProps<"input">) {
  const ids = useFieldIds(idProp);
  return (
    <FieldShell {...ids} label={label} hint={hint} error={error} optional={optional}>
      <input
        id={ids.id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(ids, hint, error)}
        required={!optional}
        className={cn(control, controlState(error), className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  optional,
  id: idProp,
  className,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  const ids = useFieldIds(idProp);
  return (
    <FieldShell {...ids} label={label} hint={hint} error={error} optional={optional}>
      <div className="relative">
        <select
          id={ids.id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(ids, hint, error)}
          required={!optional}
          className={cn(control, controlState(error), "appearance-none pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-charcoal-muted"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  description,
  id: idProp,
  className,
  ...props
}: { label: ReactNode; description?: ReactNode } & Omit<ComponentProps<"input">, "type">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={description ? `${id}-desc` : undefined}
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-brand"
        {...props}
      />
      <div className="flex flex-col">
        <label htmlFor={id} className="cursor-pointer text-body font-medium">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="text-caption text-charcoal-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
