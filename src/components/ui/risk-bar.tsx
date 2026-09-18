import { getRiskLevel } from "@/lib/risk-levels";
import { cn } from "@/lib/utils";

const barTone = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-safety",
  danger: "bg-brand",
} as const;

/**
 * Bar skor satu dimensi Sidik Risiko. Selalu menampilkan angka + label level,
 * sehingga tidak bergantung pada warna saja.
 */
export function RiskBar({
  label,
  score,
  className,
}: {
  label: string;
  score: number;
  className?: string;
}) {
  const level = getRiskLevel(score);
  const value = Math.min(100, Math.max(0, Math.round(score)));
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className="shrink-0 text-caption text-charcoal-muted">
          <span className="font-bold tabular-nums text-charcoal">{value}</span> · {level.label}
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={`${value} dari 100, ${level.label}`}
        className="h-2.5 w-full overflow-hidden rounded-pill bg-charcoal/10"
      >
        <div className={cn("h-full rounded-pill", barTone[level.tone])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
