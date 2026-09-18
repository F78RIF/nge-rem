import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

/**
 * Client dengan secret key — MELEWATI RLS. Pakai hanya di server untuk operasi
 * yang sudah lolos pengecekan RBAC (mis. validasi invite code, audit log).
 * `server-only` membuat build gagal bila file ini ter-import dari Client Component.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY belum diisi (lihat .env.example).");
  const env = getPublicEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
