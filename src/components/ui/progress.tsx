import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  label,
  showValue,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showValue && (
        <div className="flex justify-between text-caption font-medium text-charcoal-muted">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className="h-2 w-full overflow-hidden rounded-pill bg-charcoal/10"
      >
        <div
          className="h-full rounded-pill bg-brand transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Step indicator onboarding: Daftar → Profil → Persetujuan → Mulai Tes (Bab 7). */
export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Langkah pendaftaran">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step}
            className="flex flex-1 items-center gap-2"
            aria-current={active ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                done && "border-brand bg-brand text-white",
                active && "border-brand bg-surface text-brand",
                !done && !active && "border-border bg-surface text-charcoal-muted",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                active ? "font-semibold text-charcoal" : "text-charcoal-muted",
              )}
            >
              {step}
              {done && <span className="sr-only"> (selesai)</span>}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn("h-0.5 flex-1 rounded", done ? "bg-brand" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
