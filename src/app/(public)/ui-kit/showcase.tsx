"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, Award } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardDescription,
  CardTitle,
  Checkbox,
  EmptyState,
  ErrorState,
  Input,
  Progress,
  RadioCardGroup,
  RiskBar,
  Select,
  Skeleton,
  StepIndicator,
  Tag,
  TimerRing,
} from "@/components/ui";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <h2 id={id} className="text-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

const DEFAULT_SECONDS = 10; // Bab 8: countdown default 10 detik

export function UiKitShowcase() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [choice, setChoice] = useState<string>();
  const [remaining, setRemaining] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);

  const ticking = running && remaining > 0;

  useEffect(() => {
    if (!ticking) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [ticking, remaining]);

  // Validasi inline sederhana — format contoh: KT-C10-SEP26
  const codeError =
    code.length > 0 && !/^[A-Z0-9]{2,6}(-[A-Z0-9]{2,8}){1,3}$/.test(code)
      ? "Format kode belum sesuai. Contoh: KT-C10-SEP26 (huruf kapital, angka, dan tanda hubung)."
      : undefined;

  return (
    <>
      <Section id="tombol" title="Tombol">
        <Card className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="safety">Safety</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              Mulai Sekarang <ArrowRight className="size-5" aria-hidden />
            </Button>
            <Button disabled>Disabled</Button>
            <Button
              loading={loading}
              loadingText="Menyimpan…"
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1500);
              }}
            >
              Klik untuk loading
            </Button>
            <Button variant="secondary" error>
              Gagal, coba lagi
            </Button>
            <Button size="sm">Small</Button>
          </div>
          <p className="text-caption text-charcoal-muted">
            State: normal, hover, focus (tekan Tab), disabled, loading, error — sesuai acceptance criteria Bab 6.
          </p>
        </Card>
      </Section>

      <Section id="form" title="Form">
        <Card className="grid gap-5 md:grid-cols-2">
          <Input
            label="Kode institusi"
            placeholder="KT-C10-SEP26"
            autoCapitalize="characters"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={codeError}
            hint="Minta kode ke fasilitator atau admin sekolahmu."
          />
          <Input label="Nama panggilan" placeholder="Contoh: Rio" hint="Tidak perlu nama lengkap." />
          <Select label="Rentang usia" defaultValue="">
            <option value="" disabled>
              Pilih rentang usia
            </option>
            <option value="13-15">13–15 tahun</option>
            <option value="16-18">16–18 tahun</option>
            <option value="19+">19 tahun ke atas</option>
          </Select>
          <Input label="Email" type="email" optional placeholder="nama@email.com" />
          <Checkbox
            className="md:col-span-2"
            label="Saya sudah membaca dan menyetujui ringkasan persetujuan."
            description="Kamu bisa melihat riwayat persetujuan kapan saja di Profil."
          />
        </Card>
      </Section>

      <Section id="onboarding" title="Progress & Step Indicator">
        <Card className="flex flex-col gap-6">
          <StepIndicator steps={["Daftar", "Profil", "Persetujuan", "Mulai Tes"]} current={1} />
          <Progress label="Skenario" value={3} max={10} showValue />
        </Card>
      </Section>

      <Section id="skenario" title="Skenario: Timer & Pilihan">
        <Card className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Tag tone="info">Skenario 3/10</Tag>
              <CardTitle className="text-xl">Helm cuma satu</CardTitle>
              <CardDescription>
                Temanmu mengajak bonceng ke sekolah, tapi helm hanya ada satu. Kamu sudah hampir terlambat.
              </CardDescription>
            </div>
            <TimerRing remaining={remaining} total={DEFAULT_SECONDS} />
          </div>
          <RadioCardGroup
            name="demo-choice"
            legend="Apa yang kamu lakukan?"
            hideLegend
            value={choice}
            onChange={setChoice}
            options={[
              { value: "a", label: "Ikut bonceng tanpa helm, toh dekat" },
              { value: "b", label: "Pinjam helm dulu ke tetangga atau teman lain" },
              { value: "c", label: "Naik angkot / ojek dan kabari guru kalau terlambat" },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setRemaining(DEFAULT_SECONDS);
                setRunning(true);
              }}
            >
              {ticking ? "Ulangi countdown" : "Mulai countdown"}
            </Button>
          </div>
        </Card>
      </Section>

      <Section id="risiko" title="Sidik Risiko">
        <Card className="flex flex-col gap-4">
          <RiskBar label="Tekanan teman sebaya" score={72} />
          <RiskBar label="Distraksi HP" score={48} />
          <RiskBar label="Kepatuhan helm" score={18} />
          <RiskBar label="Kecepatan" score={85} />
          <p className="text-caption text-charcoal-muted">
            Profil pendidikan, bukan diagnosis psikologis dan bukan prediksi kecelakaan.
          </p>
        </Card>
      </Section>

      <Section id="status" title="Status & Umpan Balik">
        <div className="flex flex-wrap gap-2">
          <Tag tone="success" icon>
            Aman
          </Tag>
          <Tag tone="warning" icon>
            Perlu dipikirkan
          </Tag>
          <Tag tone="danger" icon>
            Berisiko
          </Tag>
          <Tag tone="info" icon>
            Info
          </Tag>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Alert tone="success" title="Pilihan ini lebih aman">
            Kamu memilih mencari alternatif yang aman.
          </Alert>
          <Alert tone="warning" title="Perlu dipikirkan">
            Kalau situasi serupa muncul lagi, prioritaskan alternatif yang tetap aman.
          </Alert>
          <Alert tone="info" title="Kenapa rekomendasi ini muncul?">
            Karena pola jawabanmu pada beberapa situasi terkait tekanan teman.
          </Alert>
          <Alert tone="danger" title="Jawaban belum tersimpan">
            Periksa koneksimu. Kami akan mencoba mengirim ulang otomatis.
          </Alert>
        </div>
      </Section>

      <Section id="state" title="Empty, Error & Loading">
        <div className="grid gap-4 md:grid-cols-3">
          <EmptyState
            icon={Award}
            title="Belum ada badge"
            description="Badge pertamamu menunggu setelah baseline selesai."
          />
          <ErrorState onRetry={() => undefined} />
          <Card className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="mt-2 h-11 w-32 rounded-pill" />
          </Card>
        </div>
      </Section>
    </>
  );
}
