import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "@/styles/globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
// Aksen tulisan tangan hanya untuk quote/sticky note, bukan teks inti (Bab 34.3).
const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NGE-REM — Nudge Generasi Remaja",
    template: "%s · NGE-REM",
  },
  description:
    "Berpikir 3 detik bisa menyelamatkan masa depanmu. Latih keputusan aman di jalan lewat skenario singkat yang relevan dengan kehidupan remaja.",
  applicationName: "NGE-REM",
  appleWebApp: { capable: true, title: "NGE-REM", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#B22920",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${caveat.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-raised"
        >
          Lewati ke konten utama
        </a>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
