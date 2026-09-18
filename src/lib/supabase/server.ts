import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

/**
 * Supabase client untuk Server Component, Server Action, dan Route Handler.
 * Berjalan sebagai user yang login sehingga RLS tetap berlaku.
 */
export async function createClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Dipanggil dari Server Component (cookie read-only). Aman diabaikan karena
          // proxy.ts sudah me-refresh sesi di setiap request.
        }
      },
    },
  });
}
