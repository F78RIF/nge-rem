import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ApiErrorCode } from "@/lib/api-error";
import type { SubmitResponseInput } from "./schemas";
import { ownsAttempt, type ParticipantIdentity } from "./session";
import type { AssessmentSet, SafetyLabel, ScenarioItem, ScenarioOutcome, StartAttemptResult } from "./types";

/**
 * Akses data assessment. Memakai secret key karena tabel dikunci RLS tanpa
 * policy publik; karena itu SETIAP fungsi di sini wajib memeriksa kepemilikan
 * attempt sendiri (Bab 5.1 & 32.1).
 */

export type Result<T> = { ok: true; data: T } | { ok: false; code: ApiErrorCode; message: string };

const fail = (code: ApiErrorCode, message: string) => ({ ok: false, code, message }) as const;

type ChoiceRow = {
  id: string;
  position: number;
  text: string;
  safety_label: SafetyLabel;
  feedback_short: string;
  feedback_long: string | null;
  legal_reference: string | null;
};

type VersionRow = {
  id: string;
  title: string;
  context: string;
  media_url: string | null;
  media_alt: string | null;
  dimension_weights: Record<string, number> | null;
  time_limit_sec: number;
  randomize_choices: boolean;
  micro_nudge: string | null;
  choices: ChoiceRow[];
};

type SetRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  assessment_set_items: { position: number; scenario_versions: VersionRow | null }[];
};

type AttemptRow = {
  id: string;
  user_id: string | null;
  client_session_id: string | null;
  assessment_set_id: string;
  status: "in_progress" | "completed" | "abandoned";
};

const SET_SELECT = `
  id, slug, name, description,
  assessment_set_items (
    position,
    scenario_versions (
      id, title, context, media_url, media_alt, dimension_weights, time_limit_sec,
      randomize_choices, micro_nudge,
      choices ( id, position, text, safety_label, feedback_short, feedback_long, legal_reference )
    )
  )`;

function toItem(position: number, v: VersionRow): ScenarioItem {
  const weights = v.dimension_weights ?? {};
  return {
    versionId: v.id,
    position,
    title: v.title,
    context: v.context,
    mediaUrl: v.media_url,
    mediaAlt: v.media_alt,
    // Dimensi utama dulu — dipakai untuk ikon placeholder media.
    dimensions: Object.keys(weights).sort((a, b) => weights[b] - weights[a]),
    timeLimitSec: v.time_limit_sec,
    randomizeChoices: v.randomize_choices,
    microNudge: v.micro_nudge,
    choices: [...v.choices]
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        id: c.id,
        text: c.text,
        safetyLabel: c.safety_label,
        feedbackShort: c.feedback_short,
        feedbackLong: c.feedback_long,
        legalReference: c.legal_reference,
      })),
  };
}

export async function loadAssessmentSet(slug: string): Promise<Result<AssessmentSet>> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("assessment_sets")
    .select(SET_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<SetRow>();

  if (error) {
    // PGRST205 = tabel belum ada → migrasi belum dijalankan.
    const code = error.code === "PGRST205" ? "UNAVAILABLE" : "INTERNAL_ERROR";
    console.error("[assessment] loadAssessmentSet", error);
    return fail(code, error.code === "PGRST205" ? "Tabel assessment belum dibuat." : "Gagal memuat skenario.");
  }
  if (!data) return fail("NOT_FOUND", "Paket skenario tidak ditemukan.");

  const items = data.assessment_set_items
    .filter((i): i is { position: number; scenario_versions: VersionRow } => i.scenario_versions !== null)
    .sort((a, b) => a.position - b.position)
    .map((i, idx) => toItem(idx + 1, i.scenario_versions));

  return { ok: true, data: { id: data.id, slug: data.slug, name: data.name, description: data.description, items } };
}

async function answeredOutcomes(attemptId: string): Promise<ScenarioOutcome[]> {
  const { data, error } = await createAdminClient()
    .from("scenario_responses")
    .select("scenario_version_id, choice_id, timed_out, response_ms")
    .eq("attempt_id", attemptId)
    .returns<
      { scenario_version_id: string; choice_id: string | null; timed_out: boolean; response_ms: number | null }[]
    >();
  if (error) throw error;
  return (data ?? []).map((r) => ({
    versionId: r.scenario_version_id,
    choiceId: r.choice_id,
    timedOut: r.timed_out,
    responseMs: r.response_ms ?? 0,
  }));
}

/** Bab 29.1 + 5.1 — lanjutkan attempt yang masih berjalan, atau buat baru. */
export async function startAttempt(slug: string, identity: ParticipantIdentity): Promise<Result<StartAttemptResult>> {
  const set = await loadAssessmentSet(slug);
  if (!set.ok) return set;
  const db = createAdminClient();

  let existing = db
    .from("assessment_attempts")
    .select("id")
    .eq("assessment_set_id", set.data.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1);
  existing = identity.userId
    ? existing.eq("user_id", identity.userId)
    : existing.eq("client_session_id", identity.sessionId!).is("user_id", null);

  const { data: found, error: findErr } = await existing.maybeSingle<{ id: string }>();
  if (findErr) {
    console.error("[assessment] find attempt", findErr);
    return fail("INTERNAL_ERROR", "Gagal memulai assessment.");
  }

  try {
    if (found) {
      return {
        ok: true,
        data: {
          attemptId: found.id,
          totalItems: set.data.items.length,
          answered: await answeredOutcomes(found.id),
          resumed: true,
        },
      };
    }

    const { data: created, error } = await db
      .from("assessment_attempts")
      .insert({
        user_id: identity.userId,
        client_session_id: identity.sessionId,
        assessment_set_id: set.data.id,
        attempt_type: "demo",
      })
      .select("id")
      .single<{ id: string }>();
    if (error) throw error;

    return {
      ok: true,
      data: { attemptId: created.id, totalItems: set.data.items.length, answered: [], resumed: false },
    };
  } catch (err) {
    console.error("[assessment] startAttempt", err);
    return fail("INTERNAL_ERROR", "Gagal memulai assessment.");
  }
}

async function loadOwnedAttempt(attemptId: string, identity: ParticipantIdentity): Promise<Result<AttemptRow>> {
  const { data, error } = await createAdminClient()
    .from("assessment_attempts")
    .select("id, user_id, client_session_id, assessment_set_id, status")
    .eq("id", attemptId)
    .maybeSingle<AttemptRow>();
  if (error) {
    console.error("[assessment] loadOwnedAttempt", error);
    return fail("INTERNAL_ERROR", "Gagal memuat attempt.");
  }
  // Attempt milik orang lain diperlakukan sama dengan tidak ada (tidak membocorkan ID).
  if (!data || !ownsAttempt(data, identity)) return fail("NOT_FOUND", "Attempt tidak ditemukan.");
  return { ok: true, data };
}

/** Bab 29.2 — simpan satu respons. Idempoten berdasarkan client_event_id (Bab 33.2). */
export async function submitResponse(
  attemptId: string,
  identity: ParticipantIdentity,
  input: SubmitResponseInput,
): Promise<Result<{ saved: true; duplicate: boolean; timedOut: boolean }>> {
  const attempt = await loadOwnedAttempt(attemptId, identity);
  if (!attempt.ok) return attempt;
  if (attempt.data.status !== "in_progress") return fail("CONFLICT", "Assessment ini sudah selesai.");

  const db = createAdminClient();

  // Scenario harus bagian dari set attempt ini, dan pilihan harus milik versi tersebut.
  const { data: item, error: itemErr } = await db
    .from("assessment_set_items")
    .select("scenario_versions ( time_limit_sec, choices ( id ) )")
    .eq("assessment_set_id", attempt.data.assessment_set_id)
    .eq("scenario_version_id", input.scenario_version_id)
    .maybeSingle<{ scenario_versions: { time_limit_sec: number; choices: { id: string }[] } | null }>();
  if (itemErr) {
    console.error("[assessment] submitResponse item", itemErr);
    return fail("INTERNAL_ERROR", "Gagal menyimpan jawaban.");
  }
  const version = item?.scenario_versions;
  if (!version) return fail("VALIDATION_ERROR", "Skenario bukan bagian dari assessment ini.");
  if (input.choice_id && !version.choices.some((c) => c.id === input.choice_id)) {
    return fail("VALIDATION_ERROR", "Pilihan tidak cocok dengan skenario.");
  }

  // Durasi diukur di client (performance.now), dibatasi ke batas waktu scenario.
  const limitMs = version.time_limit_sec * 1000;
  const responseMs = input.timed_out ? limitMs : Math.min(input.response_ms, limitMs);

  const { error } = await db.from("scenario_responses").insert({
    attempt_id: attemptId,
    scenario_version_id: input.scenario_version_id,
    choice_id: input.choice_id,
    timed_out: input.timed_out,
    shown_at: input.shown_at,
    first_interaction_at: input.first_interaction_at,
    answered_at: input.answered_at,
    response_ms: responseMs,
    visibility_hidden_count: input.visibility_hidden_count,
    client_event_id: input.client_event_id,
  });

  if (error) {
    // 23505 = unique violation: event ini (atau scenario ini) sudah tersimpan → aman diulang.
    if (error.code === "23505") return { ok: true, data: { saved: true, duplicate: true, timedOut: input.timed_out } };
    console.error("[assessment] submitResponse insert", error);
    return fail("INTERNAL_ERROR", "Gagal menyimpan jawaban.");
  }
  return { ok: true, data: { saved: true, duplicate: false, timedOut: input.timed_out } };
}

export async function completeAttempt(
  attemptId: string,
  identity: ParticipantIdentity,
): Promise<Result<{ completed: true; answered: number; total: number }>> {
  const attempt = await loadOwnedAttempt(attemptId, identity);
  if (!attempt.ok) return attempt;

  const db = createAdminClient();
  const [{ count: total, error: totalErr }, { count: answered, error: answeredErr }] = await Promise.all([
    db
      .from("assessment_set_items")
      .select("id", { count: "exact", head: true })
      .eq("assessment_set_id", attempt.data.assessment_set_id),
    db.from("scenario_responses").select("id", { count: "exact", head: true }).eq("attempt_id", attemptId),
  ]);
  if (totalErr || answeredErr) {
    console.error("[assessment] completeAttempt count", totalErr ?? answeredErr);
    return fail("INTERNAL_ERROR", "Gagal menyelesaikan assessment.");
  }

  const result = { completed: true as const, answered: answered ?? 0, total: total ?? 0 };
  if (attempt.data.status === "completed") return { ok: true, data: result };
  if (result.answered < result.total) {
    return fail("CONFLICT", `Masih ada ${result.total - result.answered} jawaban yang belum tersimpan.`);
  }

  const { error } = await db
    .from("assessment_attempts")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", attemptId)
    .eq("status", "in_progress");
  if (error) {
    console.error("[assessment] completeAttempt update", error);
    return fail("INTERNAL_ERROR", "Gagal menyelesaikan assessment.");
  }
  return { ok: true, data: result };
}
