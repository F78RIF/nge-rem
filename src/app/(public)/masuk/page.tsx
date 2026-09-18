import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Masuk" };

export default function MasukPage() {
  return (
    <main id="konten" className="flex flex-1 py-10 sm:py-16">
      <Container className="flex max-w-md flex-col gap-6">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-charcoal-muted hover:text-brand">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke beranda
        </Link>
        <h1 className="text-h2 sm:text-h1">Masuk</h1>
        <Alert tone="info" title="Login dibuka bersama pendaftaran pilot">
          Akun peserta, fasilitator, dan admin institusi akan tersedia saat program pilot dimulai.
        </Alert>
        <ButtonLink href="/mulai" variant="secondary">
          Lihat cara bergabung
        </ButtonLink>
      </Container>
    </main>
  );
}
