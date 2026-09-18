import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "INTERNAL_ERROR";

const STATUS: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  CONFLICT: 409,
  UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

/** Error envelope standar — Blueprint Bab 29.3. */
export function apiError(code: ApiErrorCode, message: string, fields?: Record<string, string>) {
  const requestId = `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  return NextResponse.json(
    { error: { code, message, ...(fields && { fields }), request_id: requestId } },
    { status: STATUS[code], headers: { "Cache-Control": "no-store" } },
  );
}
