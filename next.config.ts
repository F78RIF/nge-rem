import type { NextConfig } from "next";

// Blueprint Bab 32.1 — security headers. CSP penuh ditambahkan saat integrasi Supabase.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Bab 2.3 & 32.2: aplikasi tidak memakai GPS, kamera, atau mikrofon.
  { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
    if (process.env.NODE_ENV === "production") {
      headers[0].headers = [
        ...securityHeaders,
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ];
    }
    return headers;
  },
};

export default nextConfig;
