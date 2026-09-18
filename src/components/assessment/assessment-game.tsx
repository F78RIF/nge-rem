"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Clock, ListChecks, ShieldCheck, SmartphoneNfc, X } from "lucide-react";
import { Alert, Button, Logo, Progress } from "@/components/ui";
import { enqueueResponse, flushResponses, pendingFor } from "@/features/assessment/response-queue";
import type { AssessmentSet, ResponsePayload, ScenarioChoice, ScenarioOutcome } from "@/features/assessment/types";
import { cn } from "@/lib/utils";
import { uuidv4 } from "@/lib/uuid";
import { AssessmentSummary, type CompletionState } from "./assessment-summary";
import { FeedbackPanel, type SaveState } from "./feedback-panel";
import { ScenarioScreen, type ScenarioResolution } from "./scenario-screen";

type Phase = "intro" | "playing" | "feedback" | "done";

/** Durasi animasi keluar — samakan dengan `animate-slide-out` di tailwind.config.ts. */
const LEAVE_MS = 200;

function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.error?.message ?? "Terjadi kendala. Coba lagi.") as Error & { code?: string };
    err.code = json?.error?.code;
    throw err;
  }
  return json as T;
}

/**
 * Orkestrator assessment: intro → scenario → feedback → … → ringkasan.
 * Jawaban masuk antrian lokal lalu disinkronkan (Bab 16.3 & 33.1), sehingga
 * layar feedback langsung tampil tanpa menunggu jaringan.
 */
export function AssessmentGame({ set }: { set: AssessmentSet }) {
  const items = set.items;
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [resumedAt, setResumedAt] = useState<number | null>(null);
  const [choiceOrder, setChoiceOrder] = useState<Record<string, ScenarioChoice[]>>({});
  const [outcomes, setOutcomes] = useState<Record<string, ScenarioOutcome>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [completion, setCompletion] = useState<CompletionState>("syncing");
  const leaveTimer = useRef<number | undefined>(undefined);

  const item = items[index];
  const answeredCount = Object.keys(outcomes).length;

  /** Animasi keluar singkat lalu ganti layar; layar baru masuk lewat `animate-slide-in`. */
  const transition = useCallback((update: () => void) => {
    setLeaving(true);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      update();
      setLeaving(false);
      window.scrollTo({ top: 0 });
    }, LEAVE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const complete = useCallback(async (id: string) => {
    setCompletion("syncing");
    const { pendingIds } = await flushResponses();
    if (pendingIds.length > 0) return setCompletion("offline");
    try {
      await postJson(`/api/v1/attempts/${id}/complete`);
      setCompletion("done");
    } catch {
      setCompletion("error");
    }
  }, []);

  // Kirim ulang antrian saat koneksi kembali (Bab 33.1).
  useEffect(() => {
    const onOnline = () => {
      if (phase === "done" && attemptId && completion !== "done") void complete(attemptId);
      else void flushResponses();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [phase, attemptId, completion, complete]);

  async function start() {
    setStarting(true);
    setStartError(null);
    try {
      // Kirim sisa antrian dari sesi sebelumnya dulu agar progres server akurat.
      await flushResponses();
      const res = await postJson<{ attempt_id: string; answered: ScenarioOutcome[]; resumed: boolean }>(
        `/api/v1/assessments/${set.slug}/attempts`,
      );

      const known: Record<string, ScenarioOutcome> = {};
      for (const o of res.answered) known[o.versionId] = o;
      for (const p of pendingFor(res.attempt_id)) {
        known[p.scenario_version_id] ??= {
          versionId: p.scenario_version_id,
          choiceId: p.choice_id,
          timedOut: p.timed_out,
          responseMs: p.response_ms,
        };
      }

      const order: Record<string, ScenarioChoice[]> = {};
      for (const it of items) order[it.versionId] = it.randomizeChoices ? shuffle(it.choices) : it.choices;

      const next = items.findIndex((it) => !known[it.versionId]);
      setAttemptId(res.attempt_id);
      setOutcomes(known);
      setSaveState({});
      setChoiceOrder(order);
      setResumedAt(res.resumed && next > 0 ? next + 1 : null);

      transition(() => {
        if (next === -1) {
          setIndex(items.length - 1);
          setPhase("done");
          void complete(res.attempt_id);
        } else {
          setIndex(next);
          setPhase("playing");
        }
      });
    } catch (err) {
      setStartError(err instanceof Error ? err.message : "Gagal memulai. Coba lagi.");
    } finally {
      setStarting(false);
    }
  }

  const handleResolve = useCallback(
    (r: ScenarioResolution) => {
      if (!attemptId) return;
      const versionId = item.versionId;
      const payload: ResponsePayload = {
        client_event_id: uuidv4(),
        scenario_version_id: versionId,
        choice_id: r.choiceId,
        timed_out: r.timedOut,
        shown_at: r.shownAt,
        first_interaction_at: r.firstInteractionAt,
        answered_at: r.answeredAt,
        response_ms: r.responseMs,
        visibility_hidden_count: r.visibilityHiddenCount,
      };

      enqueueResponse(attemptId, payload);
      setOutcomes((o) => ({
        ...o,
        [versionId]: { versionId, choiceId: r.choiceId, timedOut: r.timedOut, responseMs: r.responseMs },
      }));
      setSaveState((s) => ({ ...s, [versionId]: "saving" }));
      transition(() => setPhase("feedback"));

      void flushResponses().then(({ pendingIds, rejectedIds }) => {
        const id = payload.client_event_id;
        const state: SaveState = rejectedIds.includes(id) ? "failed" : pendingIds.includes(id) ? "queued" : "saved";
        setSaveState((s) => ({ ...s, [versionId]: state }));
      });
    },
    [attemptId, item, transition],
  );

  function next() {
    if (index >= items.length - 1) {
      transition(() => setPhase("done"));
      if (attemptId) void complete(attemptId);
      return;
    }
    setResumedAt(null);
    transition(() => {
      setIndex((i) => i + 1);
      setPhase("playing");
    });
  }

  function restart() {
    transition(() => {
      setPhase("intro");
      setAttemptId(null);
      setOutcomes({});
      setIndex(0);
    });
  }

  const inGame = phase === "playing" || phase === "feedback";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4">
      {/* Top bar */}
      <header className="sticky top-0 z-10 -mx-4 flex flex-col gap-2.5 bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          {inGame ? (
            <span className="text-sm font-bold">
              Skenario <span className="tabular-nums">{index + 1}</span>
              <span className="font-medium text-charcoal-muted">
                {" "}
                dari <span className="tabular-nums">{items.length}</span>
              </span>
            </span>
          ) : (
            <Logo tagline={false} />
          )}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1 rounded-pill px-3 text-sm font-semibold text-charcoal-muted hover:bg-charcoal/5 hover:text-charcoal"
            aria-label={inGame ? "Keluar dari skenario. Jawabanmu sudah tersimpan." : "Kembali ke beranda"}
          >
            <X className="size-5" aria-hidden />
            <span className="hidden sm:inline">Keluar</span>
          </Link>
        </div>
        {inGame && <Progress value={answeredCount} max={items.length} label="Progres skenario" />}
      </header>

      <main
        id="konten"
        key={`${phase}-${index}`}
        className={cn("flex flex-1 flex-col pb-4 pt-2", leaving ? "animate-slide-out" : "animate-slide-in")}
      >
        {phase === "intro" && (
          <Intro
            name={set.name}
            description={set.description}
            total={items.length}
            seconds={items[0]?.timeLimitSec ?? 10}
            starting={starting}
            error={startError}
            onStart={start}
          />
        )}

        {phase === "playing" && item && (
          <>
            {resumedAt && (
              <Alert tone="info" className="mb-3">
                Melanjutkan dari skenario {resumedAt}. Jawaban sebelumnya sudah tersimpan.
              </Alert>
            )}
            <ScenarioScreen
              key={item.versionId}
              item={item}
              choices={choiceOrder[item.versionId] ?? item.choices}
              onResolve={handleResolve}
            />
          </>
        )}

        {phase === "feedback" && item && outcomes[item.versionId] && (
          <FeedbackPanel
            item={item}
            outcome={outcomes[item.versionId]}
            saveState={saveState[item.versionId] ?? "saving"}
            isLast={index >= items.length - 1}
            onNext={next}
          />
        )}

        {phase === "done" && (
          <AssessmentSummary
            items={items}
            outcomes={outcomes}
            completion={completion}
            onRetrySync={() => attemptId && void complete(attemptId)}
            onRestart={restart}
          />
        )}
      </main>
    </div>
  );
}

function Intro({
  name,
  description,
  total,
  seconds,
  starting,
  error,
  onStart,
}: {
  name: string;
  description: string | null;
  total: number;
  seconds: number;
  starting: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const rules = [
    { icon: ListChecks, text: `${total} situasi lalu lintas sehari-hari` },
    { icon: Clock, text: `${seconds} detik untuk memutuskan tiap situasi` },
    { icon: ShieldCheck, text: "Bukan ujian — tidak ada lulus atau gagal. Jawab jujur sesuai yang akan kamu lakukan." },
  ];
  return (
    <div className="flex flex-1 flex-col gap-6 pt-4">
      <div className="flex flex-col gap-2">
        <span className="w-fit rounded-pill bg-safety px-3 py-1 text-caption font-bold text-charcoal">
          Berpikir 3 detik
        </span>
        <h1 className="text-h2">{name}</h1>
        {description && <p className="text-body-lg text-charcoal-muted">{description}</p>}
      </div>

      <ul className="flex flex-col gap-3">
        {rules.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-card">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="pt-2 font-medium leading-snug">{text}</span>
          </li>
        ))}
      </ul>

      {/* Prinsip produk Bab 2: tidak ada interaksi saat berkendara. */}
      <Alert tone="warning" title="Jangan dimainkan sambil berkendara">
        <span className="inline-flex items-center gap-1.5">
          <SmartphoneNfc className="size-4 shrink-0" aria-hidden />
          Mainkan saat kamu sedang tidak di jalan.
        </span>
      </Alert>

      {error && (
        <Alert tone="danger" title="Belum bisa memulai">
          {error}
        </Alert>
      )}

      <div className="mt-auto pb-2">
        <Button
          size="lg"
          fullWidth
          loading={starting}
          loadingText="Menyiapkan…"
          error={Boolean(error)}
          onClick={onStart}
        >
          {error ? "Coba lagi" : "Mulai Sekarang"}
        </Button>
      </div>
    </div>
  );
}
