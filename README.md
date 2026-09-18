# NGE-REM — Nudge Generasi Remaja

PWA edukasi keselamatan lalu lintas. Spesifikasi: `../NGE-REM_Master_Blueprint_Spesifikasi_Aplikasi.docx`.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (token di `tailwind.config.ts`) · Supabase (menyusul).

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm run start
```

- `/` — placeholder beranda (landing page lengkap menyusul)
- `/ui-kit` — katalog design token & komponen UI (noindex)
- `/skenario` — assessment engine: skenario 10 detik → feedback → ringkasan (Bab 8, 9, 16)

## Database (migrasi)

Jalankan file di `supabase/migrations/` secara berurutan di **Supabase → SQL Editor** (aman dijalankan ulang).
`20260918000000_assessment_engine.sql` membuat tabel scenario/choices/attempt/`scenario_responses`, mengunci
semuanya dengan RLS (akses hanya via server), dan mengisi 10 scenario MVP (set `baseline-demo`).

API assessment (`/api/v1`, Bab 28–29): `POST assessments/:slug/attempts` (mulai/lanjutkan),
`POST attempts/:id/responses` (jawaban atau TIMEOUT, idempoten per `client_event_id`),
`POST attempts/:id/complete`. Sebelum login tersedia, attempt diikat ke cookie httpOnly `ngerem_sid`.

## Environment & Supabase

1. `cp .env.example .env.local`, isi dari Supabase → Project Settings → API.
2. `SUPABASE_SECRET_KEY` hanya untuk server (melewati RLS) — jangan pernah diberi prefix `NEXT_PUBLIC_`.
3. Cek koneksi: `GET /api/health` → `{"status":"ok","supabase":"ok"}`.

Client: `lib/supabase/client.ts` (browser), `server.ts` (server, ikut RLS), `admin.ts` (server-only, secret key). `src/proxy.ts` me-refresh sesi di setiap request — bukan pengganti otorisasi server-side.

## Deploy (Vercel Hobby, gratis)

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL          # ulangi untuk tiap variabel di .env.example
npx vercel --prod
```

`vercel.json` menempatkan fungsi di region `sin1` (Singapura) — samakan dengan region project Supabase. Setelah deploy, isi **Supabase → Authentication → URL Configuration**: Site URL = domain Vercel, Redirect URLs = `https://<domain>/**`.

## Struktur (Blueprint Bab 30.2)

```
src/
├── app/
│   ├── (public)/        # landing, offline, ui-kit
│   ├── (participant)/
│   ├── (admin)/
│   ├── api/
│   ├── layout.tsx, manifest.ts, icon.png
├── components/{ui,assessment,dashboard,admin}/
├── features/{auth,assessment,nudges,missions,analytics}/
├── lib/                 # utils (cn), risk-levels (Bab 17.3)
├── hooks/ schemas/ styles/ tests/
```

## Design system (Bab 34–35)

Warna: `brand` #B22920 · `safety` #F5B700 · `charcoal` #202124 · `surface` #FFFFFF · `background` #F7F7F7 · `success` #198754 · `info` #2B59C3.

- Di atas `safety` (kuning) selalu teks `charcoal`, jangan putih.
- Status tidak boleh hanya dibedakan warna — selalu ada ikon/label/angka.
- Ukuran font kustom (`text-body`, `text-h1`, …) harus didaftarkan juga di `src/lib/utils.ts` (tailwind-merge).

## PWA

`src/app/manifest.ts` + `public/sw.js` (cache aset statis + fallback `/offline`; SW hanya aktif di production). Ikon di `public/icons/` adalah placeholder sampai logo final diserahkan.
