/**
 * Level hasil Sidik Risiko — Blueprint Bab 17.3.
 * Skala 0–100: semakin tinggi = semakin perlu latihan. Label bersifat
 * edukatif; jangan pakai kata menghakimi (lihat Bab 46.3).
 */
export type RiskLevel = {
  min: number;
  max: number;
  label: string;
  copy: string;
  tone: "success" | "info" | "warning" | "danger";
};

export const RISK_LEVELS: readonly RiskLevel[] = [
  {
    min: 0,
    max: 29,
    label: "Terjaga",
    copy: "Banyak keputusanmu sudah mengarah aman. Pertahankan konsistensi.",
    tone: "success",
  },
  {
    min: 30,
    max: 59,
    label: "Perlu Perhatian",
    copy: "Ada beberapa situasi yang perlu dilatih lebih lanjut.",
    tone: "info",
  },
  {
    min: 60,
    max: 79,
    label: "Perlu Latihan Fokus",
    copy: "Beberapa pola keputusan berisiko cukup sering muncul.",
    tone: "warning",
  },
  {
    min: 80,
    max: 100,
    label: "Prioritas Latihan",
    copy: "Fokuskan latihan pada beberapa pola yang paling sering muncul.",
    tone: "danger",
  },
];

export function getRiskLevel(score: number): RiskLevel {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  return RISK_LEVELS.find((l) => s >= l.min && s <= l.max) ?? RISK_LEVELS[0];
}
