import { Container, Logo } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-4 py-8 text-sm text-charcoal-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo tagline={false} />
          <p>Program edukasi keselamatan lalu lintas — pilot PKBM Kejuruan Terbuka, Balikpapan.</p>
        </div>
        <p className="font-medium text-charcoal">
          Jangan buka HP saat berkendara. Pakai NGE-REM saat kamu sudah berhenti.
        </p>
      </Container>
    </footer>
  );
}
