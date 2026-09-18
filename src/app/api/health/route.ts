import { NextResponse } from "next/server";
import { readPublicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Health check untuk deploy (Blueprint Bab 44.3 langkah 8).
 * Hanya melaporkan status — tidak pernah mengembalikan nilai secret.
 */
export async function GET() {
  const env = readPublicEnv();
  const secretConfigured = Boolean(process.env.SUPABASE_SECRET_KEY);

  let supabase: "ok" | "unconfigured" | "unreachable" | "invalid_key" = "unconfigured";
  if (env) {
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
        headers: { apikey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      supabase = res.ok ? "ok" : res.status === 401 || res.status === 403 ? "invalid_key" : "unreachable";
    } catch {
      supabase = "unreachable";
    }
  }

  const healthy = supabase === "ok" && secretConfigured;
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", supabase, secret_key_configured: secretConfigured },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
