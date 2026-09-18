"use client";

import { useCountdown } from "@/hooks/use-countdown";
import { TimerRing } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Countdown visual: cincin berangka + bar yang menyusut. Dipisah dari layar
 * scenario agar update per-frame tidak me-render ulang seluruh layar.
 */
export function Countdown({
  seconds,
  running,
  onExpire,
  className,
}: {
  seconds: number;
  running: boolean;
  onExpire: () => void;
  className?: string;
}) {
  const { remainingSec, ratio } = useCountdown(seconds * 1000, running, onExpire);
  const urgent = remainingSec <= 3;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-caption font-semibold">
          <span className={urgent ? "text-brand" : "text-charcoal-muted"}>
            {remainingSec === 0 ? "Waktu habis" : urgent ? "Cepat putuskan!" : "Sisa waktu"}
          </span>
          <span className={cn("tabular-nums", urgent ? "text-brand" : "text-charcoal")}>
            00:{String(remainingSec).padStart(2, "0")}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-pill bg-charcoal/10" aria-hidden>
          <div
            className={cn("h-full origin-left rounded-pill", urgent ? "bg-brand" : "bg-safety")}
            style={{ transform: `scaleX(${ratio})` }}
          />
        </div>
      </div>
      <TimerRing
        remaining={remainingSec}
        total={seconds}
        progress={ratio}
        size={60}
        className={cn(urgent && running && "animate-pulse-urgent")}
      />
    </div>
  );
}
