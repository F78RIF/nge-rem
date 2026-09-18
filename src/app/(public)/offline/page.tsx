import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { ButtonLink, Container, Logo } from "@/components/ui";

export const metadata: Metadata = { title: "Sedang offline" };

export default function OfflinePage() {
  return (
    <main id="konten" className="flex flex-1 items-center py-16">
      <Container className="flex max-w-lg flex-col items-center gap-5 text-center">
        <Logo tagline={false} />
        <span className="flex size-14 items-center justify-center rounded-full bg-safety-50 text-charcoal">
          <WifiOff className="size-7" aria-hidden />
        </span>
        <h1 className="text-h2">Koneksi terputus</h1>
        <p className="text-charcoal-muted">
          Halaman ini belum bisa dimuat. Periksa koneksi internetmu, lalu coba lagi.
        </p>
        <ButtonLink href="/" variant="secondary">
          Coba lagi
        </ButtonLink>
      </Container>
    </main>
  );
}
