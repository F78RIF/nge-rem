import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-error";
import { completeAttempt } from "@/features/assessment/server";
import { getIdentity } from "@/features/assessment/session";

/** POST /api/v1/attempts/:id/complete — finalisasi attempt setelah semua jawaban tersimpan. */
export async function POST(_req: NextRequest, ctx: RouteContext<"/api/v1/attempts/[id]/complete">) {
  const { id } = await ctx.params;
  if (!z.guid().safeParse(id).success) return apiError("NOT_FOUND", "Attempt tidak ditemukan.");

  const result = await completeAttempt(id, await getIdentity());
  if (!result.ok) return apiError(result.code, result.message);
  return NextResponse.json(result.data, { headers: { "Cache-Control": "no-store" } });
}
