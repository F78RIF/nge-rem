import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";
import { Alert, Container } from "@/components/ui";

export const metadata: Metadata = { title: "Mulai" };

// Bab 4.1 langkah 2: pilihan "Saya punya kode institusi" atau "Coba sebagai individu".
const OPTIONS = [
  {
    icon: Building2,
    title: "Saya punya kode institusi",
    body: "Dari sekolah/PKBM-mu, contoh: KT-C10-SEP26.",
  },
  {
    icon: User,
    title: "Coba sebagai individu",
    body: "Tanpa kode. Kamu tetap mendapat Sidik Risiko dan misi.",
  },
];

export default function MulaiPage() {
  return (
    <main id="konten" className="flex flex-1 py-10 sm:py-16">
      <Container className="flex max-w-xl flex-col gap-6">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-charcoal-muted hover:text-brand">
          <ArrowLeft className="size-4" aria-hidden /> Kembali ke beranda
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 sm:text-h1">Mulai NGE-REM</h1>
          <p className="text-body-lg text-charcoal-muted">Pilih cara kamu bergabung.</p>
        </div>

        <Alert tone="warning" title="Pendaftaran segera dibuka">
          Program pilot sedang disiapkan. Pendaftaran peserta akan aktif dalam waktu dekat.
        </Alert>

        <ul className="flex flex-col gap-3">
          {OPTIONS.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <div
                aria-disabled="true"
                className="flex items-center gap-4 rounded-card border-2 border-border bg-surface p-5 opacity-70"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div className="flex-1">
                  <p className="font-bold">{title}</p>
                  <p className="text-sm text-charcoal-muted">{body}</p>
                </div>
                <ArrowRight className="size-5 text-charcoal-muted" aria-hidden />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
