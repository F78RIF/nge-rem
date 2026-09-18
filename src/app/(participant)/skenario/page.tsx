import type { Metadata } from "next";
import { AssessmentGame } from "@/components/assessment/assessment-game";
import { ButtonLink, Container, ErrorState } from "@/components/ui";
import { loadAssessmentSet } from "@/features/assessment/server";

export const metadata: Metadata = {
  title: "Skenario",
  description: "Latih keputusan aman di jalan lewat situasi singkat berdurasi 10 detik.",
};

// Konten diambil per request (tabel dikunci RLS; dibaca dengan secret key di server).
export const dynamic = "force-dynamic";

/** Paket default sampai modul cohort menentukan assessment_set per peserta. */
const DEFAULT_SET = "baseline-demo";

export default async function SkenarioPage() {
  const result = await loadAssessmentSet(DEFAULT_SET).catch((err: unknown) => {
    console.error("[skenario] gagal memuat set", err);
    return { ok: false as const, code: "UNAVAILABLE" as const, message: "Supabase belum dikonfigurasi." };
  });

  if (!result.ok || result.data.items.length === 0) {
    const needsSetup = !result.ok && result.code === "UNAVAILABLE";
    return (
      <main id="konten" className="flex flex-1 items-center py-16">
        <Container className="flex max-w-md flex-col gap-4">
          <ErrorState
            title="Skenario belum tersedia"
            description={
              needsSetup && process.env.NODE_ENV !== "production"
                ? "Database assessment belum disiapkan. Jalankan supabase/migrations/20260918000000_assessment_engine.sql di Supabase SQL Editor, lalu muat ulang."
                : "Paket skenario sedang disiapkan. Coba lagi nanti atau hubungi fasilitator."
            }
          />
          <ButtonLink href="/" variant="secondary">
            Kembali ke beranda
          </ButtonLink>
        </Container>
      </main>
    );
  }

  return <AssessmentGame set={result.data} />;
}
