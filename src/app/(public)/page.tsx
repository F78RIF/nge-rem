import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  EyeOff,
  Fingerprint,
  MousePointerClick,
  ShieldCheck,
  Smartphone,
  Timer,
} from "lucide-react";
import { ButtonLink, Card, Container } from "@/components/ui";
import { HeroVisual } from "./_components/hero-visual";

// Fakta produk, bukan klaim dampak — angka dampak hanya ditampilkan setelah terverifikasi (Bab 6: proof strip).
const FACTS = [
  { icon: Timer, value: "10 detik", label: "per skenario", note: "Cepat, seperti di jalan sungguhan" },
  { icon: Fingerprint, value: "8 dimensi", label: "Sidik Risiko", note: "Kenali pola keputusanmu" },
  { icon: CalendarCheck, value: "7 hari", label: "misi kebiasaan", note: "Latihan singkat tanpa ceramah" },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Pilih",
    body: "Hadapi dilema lalu lintas yang realistis dan putuskan dalam hitungan detik.",
  },
  {
    icon: BrainCircuit,
    title: "Kenali risiko",
    body: "Dapatkan Sidik Risiko: pola keputusan yang perlu dilatih, lengkap dengan alasannya.",
  },
  {
    icon: CalendarCheck,
    title: "Latih kebiasaan",
    body: "Jalani nudge personal dan misi 7 hari, lalu ulangi tes untuk melihat perubahanmu.",
  },
];

const ETHICS = [
  {
    icon: ShieldCheck,
    title: "Bukan diagnosis",
    body: "Sidik Risiko adalah profil pendidikan, bukan label psikologis dan bukan prediksi kecelakaan.",
  },
  {
    icon: EyeOff,
    title: "Privasi dulu",
    body: "Tanpa GPS, tanpa nomor identitas. Hasil pribadimu tidak ditampilkan ke publik dan tidak ada peringkat risiko.",
  },
  {
    icon: Smartphone,
    title: "Tidak dipakai saat berkendara",
    body: "NGE-REM dipakai saat kamu sedang berhenti — di kelas, di rumah, atau di lab komputer.",
  },
];

const FAQ = [
  {
    q: "NGE-REM itu apa?",
    a: "Aplikasi web (bisa dipasang di HP) untuk berlatih mengambil keputusan aman di jalan lewat skenario singkat, umpan balik, dan misi harian.",
  },
  {
    q: "Siapa yang bisa ikut?",
    a: "Remaja dan pelajar, termasuk peserta didik Paket C. Tahap pilot berjalan bersama PKBM Kejuruan Terbuka, Balikpapan.",
  },
  {
    q: "Saya tidak punya kode institusi, bisa ikut?",
    a: "Bisa. Pilih “Coba sebagai individu” saat mulai. Kode institusi hanya diperlukan jika sekolah/PKBM-mu ikut program.",
  },
  {
    q: "Apakah skor saya dilihat orang lain?",
    a: "Tidak ada leaderboard risiko. Institusi hanya melihat data agregat kelompok, bukan untuk membandingkan atau mempermalukan individu.",
  },
  {
    q: "Data apa saja yang dikumpulkan?",
    a: "Seminimal mungkin: nama panggilan, rentang usia, dan jawaban skenario. Kami tidak meminta lokasi GPS, alamat rumah, atau nomor KTP.",
  },
];

export default function HomePage() {
  return (
    <main id="konten">
      {/* Hero */}
      <section id="beranda" className="scroll-mt-20 overflow-hidden">
        <Container className="grid items-center gap-14 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <p className="text-caption font-bold uppercase tracking-[0.2em] text-brand">
              Jalan aman, masa depan nyata
            </p>
            <h1 className="text-[2.25rem] leading-[1.1] font-extrabold sm:text-h1 lg:text-hero">
              Berpikir 3 Detik <span className="text-brand">Bisa Menyelamatkan</span>{" "}
              <span className="underline decoration-safety decoration-[6px] underline-offset-[10px]">Masa Depanmu</span>
            </h1>
            <p className="max-w-xl text-body-lg text-charcoal-muted">
              NGE-REM membantu kamu melatih keputusan yang lebih aman di jalan, dengan cara yang seru, relevan,
              dan dekat dengan kehidupan remaja.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/mulai" size="lg" className="w-full sm:w-auto">
                Mulai Sekarang <ArrowRight className="size-5" aria-hidden />
              </ButtonLink>
              <ButtonLink href="#cara-kerja" size="lg" variant="secondary" className="w-full sm:w-auto">
                Lihat cara kerja
              </ButtonLink>
            </div>
          </div>
          <div className="px-4 pb-14 pt-10 sm:px-8 lg:p-8">
            <HeroVisual />
          </div>
        </Container>
      </section>

      {/* Fakta produk */}
      <section aria-label="Sekilas NGE-REM">
        <Container>
          <ul className="grid gap-4 rounded-card border border-border bg-surface p-5 shadow-card sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border sm:p-6">
            {FACTS.map(({ icon: Icon, value, label, note }) => (
              <li key={label} className="flex items-center gap-4 sm:justify-center sm:px-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <Icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="text-xl font-extrabold text-brand">{value}</p>
                  <p className="font-semibold">{label}</p>
                  <p className="text-caption text-charcoal-muted">{note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Cara kerja */}
      <section id="cara-kerja" aria-labelledby="judul-cara-kerja" className="scroll-mt-20 py-16 sm:py-24">
        <Container className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-caption font-bold uppercase tracking-[0.2em] text-brand">Cara kerja</p>
            <h2 id="judul-cara-kerja" className="text-h2 sm:text-h1">
              Tiga langkah, bukan hafalan
            </h2>
            <p className="text-body-lg text-charcoal-muted">
              Kamu tidak disuruh membaca materi panjang. Kamu berlatih memutuskan, lalu belajar dari keputusanmu
              sendiri.
            </p>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title}>
                <Card className="flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-safety text-charcoal">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="text-4xl font-black text-charcoal/10" aria-hidden>
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    <span className="sr-only">Langkah {i + 1}: </span>
                    {title}
                  </h3>
                  <p className="text-charcoal-muted">{body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Tentang & etika */}
      <section id="tentang" aria-labelledby="judul-tentang" className="scroll-mt-20 bg-charcoal py-16 text-white sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <p className="text-caption font-bold uppercase tracking-[0.2em] text-safety">Tentang NGE-REM</p>
            <h2 id="judul-tentang" className="text-h2 sm:text-h1">
              Laboratorium keputusan untuk remaja
            </h2>
            <p className="text-body-lg text-white/80">
              Skenario → Sidik Risiko → nudge personal → misi 7 hari → tes ulang. NGE-REM mengukur perubahan
              keputusan, bukan sekadar nilai kuis.
            </p>
            <p className="font-hand text-3xl text-safety">Generasi aman, generasi hebat.</p>
          </div>
          <ul className="grid gap-4">
            {ETHICS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-card border border-white/10 bg-white/5 p-5">
                <Icon className="mt-0.5 size-6 shrink-0 text-safety" aria-hidden />
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-white/75">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="judul-faq" className="scroll-mt-20 py-16 sm:py-24">
        <Container className="flex max-w-3xl flex-col gap-8">
          <h2 id="judul-faq" className="text-h2 sm:text-h1">
            Pertanyaan yang sering muncul
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-card border border-border bg-surface p-5 open:shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-lg text-brand transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-charcoal-muted">{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA bawah */}
      <section aria-labelledby="judul-cta" className="pb-16 sm:pb-24">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-card bg-brand p-6 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <h2 id="judul-cta" className="text-h2">
                Siap latihan 10 detik pertamamu?
              </h2>
              <p className="text-white/85">Mulai dengan 10 skenario singkat untuk mengenali pola keputusanmu.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ButtonLink href="/mulai" size="lg" variant="safety" className="w-full sm:w-auto">
                Mulai Sekarang <ArrowRight className="size-5" aria-hidden />
              </ButtonLink>
              <ButtonLink
                href="/mulai"
                size="lg"
                variant="ghost"
                className="w-full border-2 border-white/60 text-white hover:bg-white/10 sm:w-auto"
              >
                Masuk dengan kode institusi
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
