import { cn } from "@/lib/utils";

/**
 * Cincin countdown. Angka selalu tampil sehingga timer tidak hanya
 * mengandalkan warna (Bab 35). role="timer" tidak diumumkan tiap detik.
 */
export function TimerRing({
  remaining,
  total,
  progress,
  size = 72,
  className,
}: {
  remaining: number;
  total: number;
  /** Rasio sisa 0–1 yang diperbarui tiap frame. Bila diisi, cincin bergerak mulus tanpa transisi CSS. */
  progress?: number;
  size?: number;
  className?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = Math.max(0, Math.min(1, progress ?? (total > 0 ? remaining / total : 0)));
  const urgent = remaining <= 3;

  return (
    <div
      role="timer"
      aria-label={`Sisa waktu ${remaining} detik`}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-charcoal/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className={cn(
            progress === undefined && "transition-[stroke-dashoffset] duration-1000 ease-linear",
            urgent ? "stroke-brand" : "stroke-safety",
          )}
        />
      </svg>
      <span className="absolute flex flex-col items-center leading-none" aria-hidden>
        <span className={cn("text-2xl font-extrabold tabular-nums", urgent && "text-brand")}>{remaining}</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-charcoal-muted">detik</span>
      </span>
    </div>
  );
}
