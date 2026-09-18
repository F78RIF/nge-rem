import { CircleCheck, CircleX, TimerOff, TriangleAlert, type LucideIcon } from "lucide-react";
import type { SafetyLabel } from "./types";

export type FeedbackStatus = SafetyLabel | "timeout";

/**
 * Tampilan status feedback — Bab 9 (aman / perlu dipikirkan / berisiko) + timeout.
 * Status selalu berupa ikon + label, tidak hanya warna (Bab 35). Bahasa tidak
 * menghakimi (Bab 17.3).
 */
export const FEEDBACK_STATUS: Record<
  FeedbackStatus,
  { label: string; headline: string; icon: LucideIcon; badge: string; soft: string; text: string }
> = {
  safe: {
    label: "Aman",
    headline: "Keputusan yang aman!",
    icon: CircleCheck,
    badge: "bg-success text-white",
    soft: "bg-success-50 border-success/30",
    text: "text-success",
  },
  mixed: {
    label: "Perlu Dipikirkan",
    headline: "Sudah ada niat baik, tapi masih ada risiko.",
    icon: TriangleAlert,
    badge: "bg-safety text-charcoal",
    soft: "bg-safety-50 border-safety",
    text: "text-charcoal",
  },
  risky: {
    label: "Berisiko",
    headline: "Pilihan ini berisiko. Yuk lihat kenapa.",
    icon: CircleX,
    badge: "bg-brand text-white",
    soft: "bg-brand-50 border-brand/30",
    text: "text-brand-800",
  },
  timeout: {
    label: "Waktu Habis",
    headline: "Waktunya habis sebelum kamu memilih.",
    icon: TimerOff,
    badge: "bg-safety text-charcoal",
    soft: "bg-safety-50 border-safety",
    text: "text-charcoal",
  },
};
