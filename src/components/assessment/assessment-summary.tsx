"use client";

import { CloudOff, Home, Loader2, RotateCcw, Trophy } from "lucide-react";
import { Alert, Button, ButtonLink } from "@/components/ui";
import { FEEDBACK_STATUS, type FeedbackStatus } from "@/features/assessment/feedback-status";
import type { ScenarioItem, ScenarioOutcome } from "@/features/assessment/types";
import { cn } from "@/lib/utils";

export type CompletionState = "syncing" | "done" | "offline" | "error";

function statusOf(item: ScenarioItem, outcome: ScenarioOutcome | undefined): FeedbackStatus {
  const choice = item.choices.find((c) => c.id === outcome?.choiceId);
  return !outcome || outcome.timedOut || !choice ? "timeout" : choice.safetyLabel;
}

/**
 * Ringkasan setelah semua scenario. Bukan skor Sidik Risiko (Bab 10/17) —
 * hanya rekap keputusan, dengan bahasa yang tidak menghakimi.
 */
export function AssessmentSummary({
  items,
  outcomes,
  completion,
  onRetrySync,
  onRestart,
}: {
  items: ScenarioItem[];
  outcomes: Record<string, ScenarioOutcome>;
  completion: CompletionState;
  onRetrySync: () => void;
  onRestart: () => void;
}) {
  const rows = items.map((item) => ({ item, status: statusOf(item, outcomes[item.versionId]) }));
  const count = (s: FeedbackStatus) => rows.filter((r) => r.status === s).length;
  const safe = count("safe");
  const answered = Object.values(outcomes).filter((o) => !o.timedOut);
  const avgSec = answered.length
    ? answered.reduce((sum, o) => sum + o.responseMs, 0) / answered.length / 1000
    : null;

  const message =
    safe / Math.max(items.length, 1) >= 0.7
      ? "Sebagian besar keputusanmu sudah mengarah aman. Pertahankan!"
      : "Ada beberapa situasi yang layak dilatih lagi. Itu wajar — justru itu gunanya latihan.";

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <span className="flex size-20 animate-pop items-center justify-center rounded-full bg-safety text-charcoal shadow-raised">
          <Trophy className="size-10" aria-hidden />
        </span>
        <h1 className="text-h2">Semua situasi selesai!</h1>
        <p className="max-w-sm text-charcoal-muted">{message}</p>
      </div>

      <ul className="grid grid-cols-2 gap-2.5" aria-label="Rekap keputusan">
        {(["safe", "mixed", "risky", "timeout"] as const).map((s) => {
          const meta = FEEDBACK_STATUS[s];
          const Icon = meta.icon;
          return (
            <li key={s} className={cn("flex items-center gap-3 rounded-2xl border-2 p-3", meta.soft)}>
              <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", meta.badge)}>
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-2xl font-extrabold tabular-nums">{count(s)}</span>
                <span className="text-caption font-semibold text-charcoal-muted">{meta.label}</span>
              </span>
            </li>
          );
        })}
      </ul>

      {avgSec !== null && (
        <p className="text-center text-caption text-charcoal-muted">
          Rata-rata waktu memutuskan:{" "}
          <span className="font-bold tabular-nums text-charcoal">
            {avgSec.toLocaleString("id-ID", { maximumFractionDigits: 1 })} detik
          </span>
        </p>
      )}

      <section aria-label="Rincian per situasi" className="rounded-card border border-border bg-surface p-2 shadow-card">
        <ol className="divide-y divide-border">
          {rows.map(({ item, status }, i) => {
            const meta = FEEDBACK_STATUS[status];
            const Icon = meta.icon;
            return (
              <li key={item.versionId} className="flex items-center gap-3 px-2 py-2.5">
                <span className="w-5 text-right text-caption font-bold tabular-nums text-charcoal-muted">{i + 1}</span>
                <span className="flex-1 font-medium">{item.title}</span>
                <span className={cn("inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-caption font-bold", meta.badge)}>
                  <Icon className="size-3.5" aria-hidden />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <SyncStatus completion={completion} onRetry={onRetrySync} />

      <p className="text-center text-caption text-charcoal-muted">
        Profil Sidik Risiko per dimensi akan tersedia di tahap berikutnya. Hasil ini bukan diagnosis dan bukan
        prediksi kecelakaan.
      </p>

      <div className="mt-auto flex flex-col gap-2.5 pb-4 sm:flex-row">
        <Button variant="secondary" size="lg" fullWidth onClick={onRestart} disabled={completion === "syncing"}>
          <RotateCcw className="size-5" aria-hidden />
          Main lagi
        </Button>
        <ButtonLink href="/" size="lg" fullWidth>
          <Home className="size-5" aria-hidden />
          Kembali ke beranda
        </ButtonLink>
      </div>
    </div>
  );
}

function SyncStatus({ completion, onRetry }: { completion: CompletionState; onRetry: () => void }) {
  if (completion === "done") return null;
  if (completion === "syncing") {
    return (
      <p role="status" className="flex items-center justify-center gap-2 text-caption text-charcoal-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Mengirim semua jawaban…
      </p>
    );
  }
  return (
    <Alert
      tone={completion === "offline" ? "warning" : "danger"}
      title={completion === "offline" ? "Jawaban belum terkirim" : "Hasil belum tersimpan"}
    >
      <div className="flex flex-col items-start gap-2">
        <span>
          {completion === "offline"
            ? "Jawabanmu aman di perangkat ini dan akan dikirim otomatis saat koneksi kembali."
            : "Terjadi kendala saat menyimpan. Coba lagi sebentar lagi."}
        </span>
        <Button size="sm" variant={completion === "offline" ? "safety" : "primary"} onClick={onRetry}>
          <CloudOff className="size-4" aria-hidden />
          Kirim ulang sekarang
        </Button>
      </div>
    </Alert>
  );
}
