import type { Metadata } from "next";
import { Container, Logo } from "@/components/ui";
import { UiKitShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "UI Kit",
  robots: { index: false, follow: false },
};

const tokens = [
  { name: "Primary Red", hex: "#B22920", className: "bg-brand", use: "CTA, active state, brand", light: true },
  { name: "Safety Yellow", hex: "#F5B700", className: "bg-safety", use: "Highlight, warning ringan" },
  { name: "Charcoal", hex: "#202124", className: "bg-charcoal", use: "Teks utama", light: true },
  { name: "Surface", hex: "#FFFFFF", className: "bg-surface", use: "Card" },
  { name: "Background", hex: "#F7F7F7", className: "bg-background", use: "Page" },
  { name: "Success", hex: "#198754", className: "bg-success", use: "Pilihan aman / selesai", light: true },
  { name: "Info", hex: "#2B59C3", className: "bg-info", use: "Data / edukasi", light: true },
];

export default function UiKitPage() {
  return (
    <main id="konten" className="py-10 sm:py-14">
      <Container className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <Logo />
          <h1 className="text-h2 sm:text-h1">UI Kit &amp; Design Tokens</h1>
          <p className="max-w-2xl text-charcoal-muted">
            Referensi internal komponen NGE-REM (Blueprint Bab 30.3, 34, 35). Semua komponen dapat
            dioperasikan dengan keyboard dan tidak mengandalkan warna sebagai satu-satunya penanda.
          </p>
        </header>

        <section aria-labelledby="tokens" className="flex flex-col gap-4">
          <h2 id="tokens" className="text-h2">
            Warna
          </h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {tokens.map((t) => (
              <li key={t.hex} className="overflow-hidden rounded-card border border-border bg-surface">
                <div className={`${t.className} flex h-20 items-end p-3`}>
                  <span className={`font-mono text-sm ${t.light ? "text-white" : "text-charcoal"}`}>{t.hex}</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-caption text-charcoal-muted">{t.use}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tipografi" className="flex flex-col gap-3">
          <h2 id="tipografi" className="text-h2">
            Tipografi
          </h2>
          <p className="text-h2 sm:text-hero">Hero — Jalan aman</p>
          <p className="text-h1">H1 — Sidik Risiko</p>
          <p className="text-h2">H2 — Misi 7 Hari</p>
          <p className="text-body-lg">Body besar — Kalimat singkat, fokus pada pilihan dan konsekuensi.</p>
          <p>Body — Teks bahasa Indonesia sederhana, tidak menggurui.</p>
          <p className="text-caption text-charcoal-muted">Caption — keterangan tambahan</p>
          <p className="font-hand text-3xl text-brand">Rem dulu, baru gas :)</p>
        </section>

        <UiKitShowcase />
      </Container>
    </main>
  );
}
