import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Lewati aset statis, ikon, manifest, dan service worker.
  matcher: [
    "/((?!_next/static|_next/image|icons/|sw\\.js|manifest\\.webmanifest|icon\\.png|apple-icon\\.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
