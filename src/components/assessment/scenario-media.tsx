"use client";

import { useState } from "react";
import {
  Bike,
  Clock,
  CloudRain,
  Gauge,
  HardHat,
  Headphones,
  IdCard,
  Moon,
  Smartphone,
  TrafficCone,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DIMENSION_ICONS: Record<string, LucideIcon> = {
  helmet: HardHat,
  peer_pressure: Users,
  passenger_safety: Users,
  legal_compliance: IdCard,
  phone_distraction: Smartphone,
  urgency: Clock,
  speed: Gauge,
  impulsivity: Zap,
  rule_compliance: TrafficCone,
  hazard_awareness: CloudRain,
  fatigue: Moon,
  attention: Headphones,
};

/**
 * Media scenario. Bila media_url kosong atau gagal dimuat, tampilkan ilustrasi
 * jalan sederhana dengan ikon dimensi utama agar layout tetap konsisten.
 */
export function ScenarioMedia({
  url,
  alt,
  dimension,
  className,
}: {
  url: string | null;
  alt: string | null;
  dimension?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = (dimension && DIMENSION_ICONS[dimension]) || Bike;
  const frame = cn("relative aspect-[2/1] w-full overflow-hidden rounded-card", className);

  if (url && !failed) {
    return (
      <div className={cn(frame, "bg-charcoal/10")}>
        {/* URL media berasal dari CMS (domain belum tetap), jadi tidak lewat next/image. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt ?? ""}
          className="size-full object-cover"
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn(frame, "bg-charcoal")} aria-hidden>
      {/* Aspal + marka tengah putus-putus yang "bergerak" menuju pengamat. */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3b3f" />
            <stop offset="1" stopColor="#202124" />
          </linearGradient>
        </defs>
        <rect width="400" height="200" fill="url(#sky)" />
        <path d="M150 70 L250 70 L400 200 L0 200 Z" fill="#2c2d31" />
        <path d="M150 70 L0 200" stroke="#F5B700" strokeWidth="3" opacity="0.8" />
        <path d="M250 70 L400 200" stroke="#F5B700" strokeWidth="3" opacity="0.8" />
        <path d="M200 74 L200 200" stroke="#fff" strokeWidth="5" strokeDasharray="14 16" opacity="0.55" />
      </svg>
      <span className="absolute left-1/2 top-[38%] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-safety text-charcoal shadow-raised ring-4 ring-safety/30">
        <Icon className="size-8" strokeWidth={2.25} />
      </span>
    </div>
  );
}
