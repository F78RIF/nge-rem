import type { Config } from "tailwindcss";

/**
 * NGE-REM design tokens — Blueprint Bab 34 (Design System).
 * Dimuat oleh Tailwind v4 lewat direktif `@config` di src/styles/globals.css.
 *
 * Aturan kontras (Bab 35):
 * - Teks putih boleh di atas `brand` (merah), `success`, `info`, `charcoal`.
 * - Di atas `safety` (kuning) selalu pakai teks `charcoal`, jangan putih.
 * - Warna tidak boleh jadi satu-satunya pembeda status: selalu sertakan ikon/label.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B22920", // Primary Red — CTA, active state, brand
          50: "#FCEEEC",
          100: "#F8D6D3",
          200: "#EFA9A3",
          600: "#C4342A",
          700: "#B22920",
          800: "#8F2019",
          900: "#6B1812",
        },
        safety: {
          DEFAULT: "#F5B700", // Safety Yellow — highlight, warning ringan
          50: "#FFF8E0",
          100: "#FDEDB3",
          600: "#D99F00",
        },
        charcoal: {
          DEFAULT: "#202124", // Text utama
          muted: "#5F6368", // Teks sekunder (kontras 6.2:1 di atas putih)
          subtle: "#80868B", // Hanya untuk teks besar/ikon dekoratif
        },
        surface: "#FFFFFF", // Card
        background: "#F7F7F7", // Page
        border: "#E3E3E3",
        success: {
          DEFAULT: "#198754", // Safe choice / completion
          50: "#E8F5EE",
        },
        info: {
          DEFAULT: "#2B59C3", // Data / education
          50: "#EAF0FB",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Aptos", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Aptos Display", "system-ui", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      fontSize: {
        // Bab 34.2 — ukuran desktop; mobile diturunkan lewat utilitas responsif.
        caption: ["0.8125rem", { lineHeight: "1.25rem" }], // 13px
        body: ["1rem", { lineHeight: "1.625rem" }], // 16px
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        h2: ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }], // 28px
        h1: ["2.5rem", { lineHeight: "3rem", fontWeight: "800" }], // 40px
        hero: ["3.5rem", { lineHeight: "1.08", fontWeight: "800" }], // 56px
      },
      maxWidth: {
        content: "1240px", // Desktop max content width 1200–1280px
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(32 33 36 / 0.06), 0 4px 16px rgb(32 33 36 / 0.06)",
        raised: "0 8px 30px rgb(32 33 36 / 0.12)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 240ms ease-out both",
      },
    },
  },
};

export default config;
