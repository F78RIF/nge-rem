import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

/** Supabase client untuk Client Component. Hanya memakai publishable key; akses dibatasi RLS. */
export function createClient() {
  const env = getPublicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
