import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiError } from "@/lib/api-error";
import { submitResponseSchema } from "@/features/assessment/schemas";
import { submitResponse } from "@/features/assessment/server";
import { getIdentity } from "@/features/assessment/session";

/** POST /api/v1/attempts/:id/responses — simpan jawaban atau TIMEOUT (Bab 29.2, 16.3). */
export async function POST(req: NextRequest, ctx: RouteContext<"/api/v1/attempts/[id]/responses">) {
  const { id } = await ctx.params;
  if (!z.guid().safeParse(id).success) return apiError("NOT_FOUND", "Attempt tidak ditemukan.");

  const body = await req.json().catch(() => null);
  const parsed = submitResponseSchema.safeParse(body);
  if (!parsed.success) {
    const fields = Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message]));
    return apiError("VALIDATION_ERROR", "Ada data yang perlu diperbaiki.", fields);
  }

  const result = await submitResponse(id, await getIdentity(), parsed.data);
  if (!result.ok) return apiError(result.code, result.message);

  return NextResponse.json(
    { saved: true, duplicate: result.data.duplicate, event: result.data.timedOut ? "TIMEOUT" : "ANSWER" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
