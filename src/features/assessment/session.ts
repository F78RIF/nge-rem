import "server-only";
import { cookies } from "next/headers";
import { readPublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Identitas peserta untuk assessment. Selama modul login belum aktif, attempt
 * diikat ke ID sesi pseudonim di cookie httpOnly (Bab 8: "user/session
 * pseudonymous ID"). Bila user Supabase sudah login, user_id ikut dipakai.
 */
export type ParticipantIdentity = { userId: string | null; sessionId: string | null };

const SESSION_COOKIE = "ngerem_sid";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readUserId(): Promise<string | null> {
  if (!readPublicEnv()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    return data?.claims?.sub ?? null;
  } catch {
    return null;
  }
}

export async function getIdentity(): Promise<ParticipantIdentity> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  return { userId: await readUserId(), sessionId: raw && UUID_RE.test(raw) ? raw : null };
}

/** Hanya boleh dipanggil dari Route Handler / Server Action (cookie ditulis). */
export async function getOrCreateIdentity(): Promise<ParticipantIdentity> {
  const identity = await getIdentity();
  if (identity.sessionId) return identity;

  const sessionId = crypto.randomUUID();
  (await cookies()).set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ...identity, sessionId };
}

export function ownsAttempt(
  attempt: { user_id: string | null; client_session_id: string | null },
  identity: ParticipantIdentity,
) {
  if (attempt.user_id) return attempt.user_id === identity.userId;
  return attempt.client_session_id !== null && attempt.client_session_id === identity.sessionId;
}
