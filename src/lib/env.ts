import { z } from "zod";

// NEXT_PUBLIC_* harus dirujuk langsung agar Next.js meng-inline nilainya ke bundle browser.
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});

export type PublicEnv = z.infer<typeof publicSchema>;

/** Env publik (aman untuk browser). Mengembalikan null bila belum dikonfigurasi. */
export function readPublicEnv(): PublicEnv | null {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
  return parsed.success ? parsed.data : null;
}

export function getPublicEnv(): PublicEnv {
  const env = readPublicEnv();
  if (!env) {
    throw new Error(
      "Supabase belum dikonfigurasi: isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (lihat .env.example).",
    );
  }
  return env;
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
