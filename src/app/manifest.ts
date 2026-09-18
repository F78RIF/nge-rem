import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NGE-REM — Nudge Generasi Remaja",
    short_name: "NGE-REM",
    description:
      "Latih keputusan aman di jalan lewat skenario singkat, Sidik Risiko, nudge personal, dan misi 7 hari.",
    lang: "id-ID",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F7F7F7",
    theme_color: "#B22920",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
