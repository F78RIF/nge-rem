"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, ArrowRight, Check, CloudOff, Lightbulb, Loader2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { FEEDBACK_STATUS, type FeedbackStatus } from "@/features/assessment/feedback-status";
import type { ScenarioItem, ScenarioOutcome } from "@/features/assessment/types";
import { cn } from "@/lib/utils";

export type SaveState = "saving" | "saved" | "queued" | "failed";

function formatSeconds(ms: number) {
  return (ms / 1000).toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

/**
 * Feedback langsung setelah memilih / timeout — Blueprint Bab 9: pilihan yang
 * dipilih, status, alasan, alternatif yang lebih aman, micro-nudge, dan CTA.
 */
export function FeedbackPanel({
  item,
  outcome,
  saveState,
  isLast,
  onNext,
}: {
  item: ScenarioItem;
  outcome: ScenarioOutcome;
  saveState: SaveState;
  isLast: boolean;
  onNext: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const choice = item.choices.find((c) => c.id === outcome.choiceId) ?? null;
  const status: FeedbackStatus = outcome.timedOut || !choice ? "timeout" : choice.safetyLabel;
  const meta = FEEDBACK_STATUS[status];
  const Icon = meta.icon;
  const saferChoice = status === "safe" ? null : item.choices.find((c) => c.safetyLabel === "safe");

  // Pindahkan fokus ke judul agar pembaca layar langsung mendengar hasilnya.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Status */}
      <div className={cn("flex flex-col items-center gap-3 rounded-card border-2 px-5 py-6 text-center", meta.soft)}>
        <span
          className={cn("flex size-16 animate-pop items-center justify-center rounded-full shadow-raised", meta.badge)}
        >
          <Icon className="size-9" strokeWidth={2.25} aria-hidden />
        </span>
        <span className={cn("rounded-pill px-3 py-1 text-caption font-extrabold uppercase tracking-wider", meta.badge)}>
          {meta.label}
        </span>
        <h1 ref={headingRef} tabIndex={-1} className="text-xl font-extrabold outline-none sm:text-2xl">
          {meta.headline}
        </h1>
      </div>

      {/* Pilihan peserta */}
      <section aria-label="Pilihanmu" className="rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-caption font-semibold uppercase tracking-wide text-charcoal-muted">Pilihanmu</p>
          {!outcome.timedOut && (
            <p className="text-caption tabular-nums text-charcoal-muted">
              Dijawab dalam {formatSeconds(outcome.responseMs)} detik
            </p>
          )}
        </div>
        <p className="mt-1 font-semibold">{choice ? choice.text : "Kamu belum memilih sampai waktu habis."}</p>

        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {choice ? (
            <>
              <p className={cn("font-bold", meta.text)}>{choice.feedbackShort}</p>
              {choice.feedbackLong && <p className="text-charcoal-muted">{choice.feedbackLong}</p>}
              {choice.legalReference && (
                <p className="flex items-start gap-2 rounded-xl bg-info-50 p-3 text-caption text-charcoal">
                  <Scale className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
                  {choice.legalReference}
                </p>
              )}
            </>
          ) : (
            <p className="text-charcoal-muted">
              Tidak apa-apa, ini latihan. Di jalan, ragu terlalu lama juga bisa berisiko — makanya berguna punya
              keputusan aman yang sudah &ldquo;siap pakai&rdquo; sebelum situasinya terjadi.
            </p>
          )}
        </div>
      </section>

      {/* Alternatif lebih aman */}
      {saferChoice && (
        <section
          aria-label="Alternatif yang lebih aman"
          className="rounded-card border-2 border-success/30 bg-success-50 p-4"
        >
          <p className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-wide text-success">
            <ShieldCheck className="size-4" aria-hidden />
            Alternatif yang lebih aman
          </p>
          <p className="mt-1 font-semibold">{saferChoice.text}</p>
          <p className="mt-1 text-charcoal-muted">{saferChoice.feedbackShort}</p>
        </section>
      )}

      {/* Micro-nudge sebagai sticky note (aksen tulisan tangan, Bab 34.3) */}
      {item.microNudge && (
        <aside className="relative -rotate-1 rounded-lg bg-safety-100 px-4 pb-3 pt-4 shadow-card">
          <span
            aria-hidden
            className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-2 rounded-sm bg-safety/60"
          />
          <p className="flex items-center gap-1.5 text-caption font-bold uppercase tracking-wide text-charcoal">
            <Lightbulb className="size-4" aria-hidden />
            Ingat ini
          </p>
          <p className="font-hand text-2xl leading-snug text-charcoal">{item.microNudge}</p>
        </aside>
      )}

      {/* CTA */}
      <div className="sticky bottom-0 -mx-4 mt-auto flex flex-col gap-2 bg-linear-to-t from-background via-background to-background/0 px-4 pb-4 pt-6">
        <SaveIndicator state={saveState} />
        <Button size="lg" fullWidth onClick={onNext} className="whitespace-normal px-5 text-center shadow-raised">
          {isLast ? "Lihat Ringkasan" : "Lanjutkan ke Skenario Berikutnya"}
          <ArrowRight className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const content = {
    saving: { icon: <Loader2 className="size-3.5 animate-spin" aria-hidden />, text: "Menyimpan jawaban…" },
    saved: { icon: <Check className="size-3.5" aria-hidden />, text: "Jawaban tersimpan" },
    queued: {
      icon: <CloudOff className="size-3.5" aria-hidden />,
      text: "Koneksi lemah — jawaban disimpan di perangkat dan dikirim otomatis.",
    },
    failed: {
      icon: <AlertCircle className="size-3.5 text-brand" aria-hidden />,
      text: "Jawaban ini tidak dapat disimpan. Kamu tetap bisa lanjut.",
    },
  }[state];
  return (
    <p role="status" className="flex items-center justify-center gap-1.5 text-caption text-charcoal-muted">
      {content.icon}
      {content.text}
    </p>
  );
}
