"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TimerOff } from "lucide-react";
import type { ScenarioChoice, ScenarioItem } from "@/features/assessment/types";
import { cn } from "@/lib/utils";
import { Countdown } from "./countdown";
import { ScenarioMedia } from "./scenario-media";

export type ScenarioResolution = {
  choiceId: string | null;
  timedOut: boolean;
  shownAt: string;
  firstInteractionAt: string | null;
  answeredAt: string | null;
  responseMs: number;
  visibilityHiddenCount: number;
};

const LETTERS = ["A", "B", "C", "D", "E"];
/** Jeda singkat agar peserta melihat pilihannya tersorot sebelum pindah ke feedback. */
const SELECT_DELAY_MS = 380;
const TIMEOUT_DELAY_MS = 900;

/**
 * Satu scenario — Blueprint Bab 8. Timer mulai otomatis saat layar dipasang.
 * Mencatat shown_at, first_interaction_at, answered_at, response_ms, timeout,
 * dan jumlah visibility change (Bab 16.3: dicatat, bukan dianggap curang).
 */
export function ScenarioScreen({
  item,
  choices,
  onResolve,
}: {
  item: ScenarioItem;
  choices: ScenarioChoice[];
  onResolve: (r: ScenarioResolution) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const locked = selected !== null || timedOut;

  const lockedRef = useRef(false);
  const startPerf = useRef(0);
  const shownAt = useRef("");
  const firstInteractionAt = useRef<string | null>(null);
  const hiddenCount = useRef(0);

  useEffect(() => {
    startPerf.current = performance.now();
    shownAt.current = new Date().toISOString();

    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenCount.current++;
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const markInteraction = () => {
    firstInteractionAt.current ??= new Date().toISOString();
  };

  const choose = useCallback(
    (choiceId: string) => {
      if (lockedRef.current) return; // tap bersamaan dengan timeout: yang pertama menang
      lockedRef.current = true;
      const responseMs = Math.round(performance.now() - startPerf.current);
      const answeredAt = new Date().toISOString();
      firstInteractionAt.current ??= answeredAt;
      setSelected(choiceId);
      window.setTimeout(
        () =>
          onResolve({
            choiceId,
            timedOut: false,
            shownAt: shownAt.current,
            firstInteractionAt: firstInteractionAt.current,
            answeredAt,
            responseMs,
            visibilityHiddenCount: hiddenCount.current,
          }),
        SELECT_DELAY_MS,
      );
    },
    [onResolve],
  );

  const handleExpire = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    const responseMs = Math.round(performance.now() - startPerf.current);
    setTimedOut(true);
    window.setTimeout(
      () =>
        onResolve({
          choiceId: null,
          timedOut: true,
          shownAt: shownAt.current,
          firstInteractionAt: firstInteractionAt.current,
          answeredAt: null,
          responseMs,
          visibilityHiddenCount: hiddenCount.current,
        }),
      TIMEOUT_DELAY_MS,
    );
  }, [onResolve]);

  // Pintasan keyboard: 1–4 atau A–D.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toUpperCase();
      const idx = /^[1-9]$/.test(key) ? Number(key) - 1 : LETTERS.indexOf(key);
      if (idx >= 0 && idx < choices.length) choose(choices[idx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, choose]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Countdown seconds={item.timeLimitSec} running={!locked} onExpire={handleExpire} />

      <div className="relative">
        <ScenarioMedia url={item.mediaUrl} alt={item.mediaAlt} dimension={item.dimensions[0]} />
        {timedOut && (
          <div className="absolute inset-0 flex items-center justify-center rounded-card bg-charcoal/70 backdrop-blur-[2px]">
            <span className="flex animate-pop items-center gap-2 rounded-pill bg-safety px-5 py-2.5 text-lg font-extrabold text-charcoal shadow-raised">
              <TimerOff className="size-6" aria-hidden />
              Waktu habis!
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-extrabold sm:text-2xl">{item.title}</h1>
        <p className="text-body text-charcoal sm:text-body-lg">{item.context}</p>
      </div>

      <div role="group" aria-label="Apa yang akan kamu lakukan?" className="mt-auto flex flex-col gap-2.5">
        <p className="text-caption font-semibold uppercase tracking-wide text-charcoal-muted">
          Apa yang akan kamu lakukan?
        </p>
        {choices.map((choice, i) => {
          const isSelected = selected === choice.id;
          return (
            // Animasi masuk di wrapper: fill-mode `both` pada tombol akan mengunci transform hover/scale.
            <div key={choice.id} className="animate-fade-up" style={{ animationDelay: `${120 + i * 60}ms` }}>
            <button
              type="button"
              disabled={locked}
              onPointerDown={markInteraction}
              onFocus={markInteraction}
              onClick={() => choose(choice.id)}
              aria-pressed={isSelected}
              aria-keyshortcuts={String(i + 1)}
              className={cn(
                "group flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 bg-surface px-3.5 py-3 text-left font-semibold",
                "transition-[transform,border-color,background-color,opacity] duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info",
                !locked && "border-border shadow-card hover:-translate-y-0.5 hover:border-brand/60 active:scale-[0.98]",
                isSelected && "scale-[1.02] border-brand bg-brand-50",
                locked && !isSelected && "border-border opacity-45",
                "disabled:cursor-default",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition-colors",
                  isSelected ? "bg-brand text-white" : "bg-background text-charcoal group-hover:bg-brand-50 group-hover:text-brand",
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="flex-1 leading-snug">{choice.text}</span>
            </button>
            </div>
          );
        })}
      </div>

      <p className="sr-only" aria-live="assertive">
        {timedOut ? "Waktu habis." : ""}
      </p>
    </div>
  );
}
