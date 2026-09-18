import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { readPublicEnv } from "@/lib/env";

/**
 * Me-refresh sesi Supabase di setiap request dan menulis cookie baru ke response.
 * Ini BUKAN otorisasi — setiap halaman/endpoint private tetap wajib cek role di
 * server (Blueprint Bab 5.1 & 32.1).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = readPublicEnv();
  if (!env) return response; // Supabase belum dikonfigurasi: halaman publik tetap jalan.

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Jangan sisipkan kode di antara createServerClient dan getClaims().
  await supabase.auth.getClaims();

  return response;
}
