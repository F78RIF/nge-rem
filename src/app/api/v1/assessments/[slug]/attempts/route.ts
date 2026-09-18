import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/api-error";
import { startAttempt } from "@/features/assessment/server";
import { getOrCreateIdentity } from "@/features/assessment/session";

/** POST /api/v1/assessments/:slug/attempts — mulai atau lanjutkan attempt (Bab 29.1). */
export async function POST(_req: NextRequest, ctx: RouteContext<"/api/v1/assessments/[slug]/attempts">) {
  const { slug } = await ctx.params;
  const identity = await getOrCreateIdentity();
  const result = await startAttempt(slug, identity);
  if (!result.ok) return apiError(result.code, result.message);

  const { attemptId, totalItems, answered, resumed } = result.data;
  return NextResponse.json(
    { attempt_id: attemptId, total_items: totalItems, answered, resumed },
    { status: resumed ? 200 : 201, headers: { "Cache-Control": "no-store" } },
  );
}
