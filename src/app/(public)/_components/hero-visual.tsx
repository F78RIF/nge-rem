import { Check } from "lucide-react";
import { TimerRing } from "@/components/ui";

/** Pratinjau layar skenario sebagai visual hero (pengganti foto sampai aset final tersedia). */
export function HeroVisual() {
  return (
    <div
      role="img"
      aria-label="Contoh layar skenario NGE-REM: dilema helm hanya satu dengan hitung mundur 7 detik dan tiga pilihan jawaban."
      className="relative mx-auto w-full max-w-md lg:max-w-none"
    >
      <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-50 via-surface to-safety-50" />

      <div className="rounded-card border border-border bg-surface p-5 shadow-raised sm:p-6" aria-hidden>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-pill bg-info-50 px-2.5 py-0.5 text-caption font-semibold text-info">
              Skenario 3/10
            </span>
            <p className="text-lg font-bold">Helm cuma satu</p>
            <p className="text-sm text-charcoal-muted">
              Temanmu ngajak bonceng ke sekolah, tapi helm cuma ada satu. Kamu hampir telat.
            </p>
          </div>
          <TimerRing remaining={7} total={10} size={64} />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <Choice text="Ikut bonceng tanpa helm, toh dekat" />
          <Choice text="Pinjam helm dulu ke teman lain" />
          <Choice text="Naik angkot, kabari guru kalau telat" selected />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-success/30 bg-success-50 p-3 text-sm">
          <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={3} />
          <p>
            <span className="font-semibold">Pilihan aman.</span> Terlambat bukan alasan menambah risiko.
          </p>
        </div>
      </div>

      <p
        aria-hidden
        className="absolute -bottom-10 -right-2 rotate-3 rounded-md bg-safety px-3 py-2 font-hand text-xl leading-tight text-charcoal shadow-card sm:-right-6 sm:text-2xl"
      >
        Keputusan kecil,
        <br />
        dampak besar
      </p>
      <p
        aria-hidden
        className="absolute -left-2 -top-7 -rotate-3 rounded-md bg-surface px-3 py-1.5 font-hand text-xl text-brand shadow-card sm:-left-6 sm:text-2xl"
      >
        Rem dulu, baru gas :)
      </p>
    </div>
  );
}

function Choice({ text, selected }: { text: string; selected?: boolean }) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-sm font-medium " +
        (selected ? "border-brand bg-brand-50" : "border-border")
      }
    >
      <span
        className={
          "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 " +
          (selected ? "border-brand bg-brand text-white" : "border-charcoal-muted")
        }
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>
      {text}
    </div>
  );
}
