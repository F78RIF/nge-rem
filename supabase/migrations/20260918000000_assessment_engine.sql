-- ─────────────────────────────────────────────────────────────
-- NGE-REM — Assessment Engine (Blueprint Bab 16, 25, 26, 33.2)
-- Jalankan sekali di Supabase → SQL Editor (atau `supabase db push`).
-- Aman dijalankan ulang: tabel memakai IF NOT EXISTS dan seed dilewati bila
-- set `baseline-demo` sudah ada.
--
-- Akses data HANYA lewat server (secret key). RLS aktif tanpa policy publik,
-- jadi publishable key di browser tidak bisa membaca/menulis tabel ini.
-- ─────────────────────────────────────────────────────────────

-- gen_random_uuid() bawaan Postgres 13+ (Supabase: PG15+), tidak perlu pgcrypto.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ── Konten ──────────────────────────────────────────────────

-- Scenario logis; isi yang bisa berubah ada di scenario_versions (Bab 16.1).
create table if not exists public.scenarios (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,              -- slug stabil, mis. "helm-cuma-satu"
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.scenario_versions (
  id                  uuid primary key default gen_random_uuid(),
  scenario_id         uuid not null references public.scenarios(id) on delete restrict,
  version             int  not null default 1,
  title               text not null,
  context             text not null,
  media_url           text,
  media_alt           text,
  dimension_weights   jsonb not null default '{}'::jsonb,   -- {"helmet":0.6,"peer_pressure":0.4}
  time_limit_sec      int  not null default 10 check (time_limit_sec between 5 and 60),
  randomize_choices   boolean not null default false,
  difficulty          text not null default 'basic'
                        check (difficulty in ('basic','intermediate','advanced')),
  status              text not null default 'draft'
                        check (status in ('draft','review','published','archived')),
  micro_nudge         text,                                   -- Bab 9: kalimat singkat untuk situasi sejenis
  timeout_risk_value  numeric(3,2) not null default 0.50      -- Bab 16.3: penalti terkontrol, bukan skor maks
                        check (timeout_risk_value between 0 and 1),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (scenario_id, version)
);

-- Bab 16.2 — choice model.
create table if not exists public.choices (
  id               uuid primary key default gen_random_uuid(),
  scenario_version_id uuid not null references public.scenario_versions(id) on delete cascade,
  position         int  not null,
  text             text not null,
  risk_delta       jsonb not null default '{}'::jsonb,   -- nilai risiko 0..1 per dimensi
  safety_label     text not null check (safety_label in ('safe','mixed','risky')),
  feedback_short   text not null,
  feedback_long    text,
  legal_reference  text,
  nudge_tags       text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (scenario_version_id, position)
);

create table if not exists public.assessment_sets (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  status       text not null default 'draft' check (status in ('draft','published','archived')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Set menunjuk ke scenario_version (snapshot), bukan scenario — Bab 33.2.
create table if not exists public.assessment_set_items (
  id                  uuid primary key default gen_random_uuid(),
  assessment_set_id   uuid not null references public.assessment_sets(id) on delete cascade,
  scenario_version_id uuid not null references public.scenario_versions(id) on delete restrict,
  position            int  not null,
  created_at          timestamptz not null default now(),
  unique (assessment_set_id, position),
  unique (assessment_set_id, scenario_version_id)
);

-- ── Attempt & respons ───────────────────────────────────────

create table if not exists public.assessment_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid references auth.users(id) on delete set null,
  client_session_id  uuid,            -- ID sesi pseudonim (cookie httpOnly) sebelum login tersedia
  cohort_id          uuid,            -- FK ke cohorts ditambahkan saat modul cohort dibuat
  attempt_type       text not null default 'demo' check (attempt_type in ('baseline','retest','demo')),
  assessment_set_id  uuid not null references public.assessment_sets(id) on delete restrict,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  scoring_version    text not null default 'v1',
  status             text not null default 'in_progress'
                       check (status in ('in_progress','completed','abandoned')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  check (user_id is not null or client_session_id is not null)
);

create index if not exists assessment_attempts_session_idx
  on public.assessment_attempts (client_session_id, assessment_set_id, status);
create index if not exists assessment_attempts_user_idx
  on public.assessment_attempts (user_id, assessment_set_id, status);

-- Bab 26 — scenario_responses. Satu baris per scenario per attempt.
create table if not exists public.scenario_responses (
  id                       uuid primary key default gen_random_uuid(),
  attempt_id               uuid not null references public.assessment_attempts(id) on delete cascade,
  scenario_version_id      uuid not null references public.scenario_versions(id) on delete restrict,
  choice_id                uuid references public.choices(id) on delete restrict,
  shown_at                 timestamptz not null,
  first_interaction_at     timestamptz,
  answered_at              timestamptz,
  response_ms              int check (response_ms between 0 and 600000),
  timed_out                boolean not null default false,
  event_type               text generated always as (case when timed_out then 'TIMEOUT' else 'ANSWER' end) stored,
  visibility_hidden_count  int not null default 0,   -- Bab 16.3: dicatat, bukan dianggap curang
  client_event_id          uuid not null unique,     -- idempotensi antrian offline
  received_at              timestamptz not null default now(),
  created_at               timestamptz not null default now(),
  unique (attempt_id, scenario_version_id),
  -- Timeout tidak punya pilihan; jawaban wajib punya pilihan.
  check ((timed_out and choice_id is null) or (not timed_out and choice_id is not null))
);

create index if not exists scenario_responses_attempt_idx on public.scenario_responses (attempt_id);

-- ── updated_at triggers ─────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['scenarios','scenario_versions','choices','assessment_sets','assessment_attempts'] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ── RLS: kunci semua; akses hanya via server (secret key melewati RLS) ──

alter table public.scenarios             enable row level security;
alter table public.scenario_versions     enable row level security;
alter table public.choices               enable row level security;
alter table public.assessment_sets       enable row level security;
alter table public.assessment_set_items  enable row level security;
alter table public.assessment_attempts   enable row level security;
alter table public.scenario_responses    enable row level security;

-- ─────────────────────────────────────────────────────────────
-- SEED — 10 scenario MVP dari Bab 16.4 + set "baseline-demo".
-- Konten perlu direview tim pendidik sebelum dipakai di cohort sungguhan;
-- rujukan hukum ke UU No. 22 Tahun 2009 (LLAJ) perlu diverifikasi ulang.
-- ─────────────────────────────────────────────────────────────

create or replace function pg_temp.seed_scenario(
  p_code text, p_title text, p_context text, p_weights jsonb,
  p_micro_nudge text, p_difficulty text, p_choices jsonb
) returns uuid language plpgsql as $$
declare
  v_scenario uuid;
  v_version  uuid;
  c jsonb;
  i int := 0;
begin
  insert into public.scenarios (code) values (p_code)
    on conflict (code) do update set code = excluded.code
    returning id into v_scenario;

  insert into public.scenario_versions
    (scenario_id, version, title, context, dimension_weights, time_limit_sec,
     randomize_choices, difficulty, status, micro_nudge)
  values
    (v_scenario, 1, p_title, p_context, p_weights, 10, true, p_difficulty, 'published', p_micro_nudge)
  returning id into v_version;

  for c in select * from jsonb_array_elements(p_choices) loop
    i := i + 1;
    insert into public.choices
      (scenario_version_id, position, text, risk_delta, safety_label,
       feedback_short, feedback_long, legal_reference, nudge_tags)
    values
      (v_version, i, c->>'text', coalesce(c->'risk', '{}'::jsonb), c->>'label',
       c->>'short', c->>'long', c->>'legal',
       coalesce(array(select jsonb_array_elements_text(c->'tags')), '{}'));
  end loop;

  return v_version;
end $$;

do $$
declare
  v_set uuid;
  v_versions uuid[] := '{}';
begin
  if exists (select 1 from public.assessment_sets where slug = 'baseline-demo') then
    raise notice 'Seed baseline-demo sudah ada, dilewati.';
    return;
  end if;

  insert into public.assessment_sets (slug, name, description, status)
  values ('baseline-demo', 'Sidik Risiko — Demo',
          '10 situasi singkat untuk mengenali pola keputusanmu di jalan.', 'published')
  returning id into v_set;

  -- 1. Helm cuma satu
  v_versions := v_versions || pg_temp.seed_scenario(
    'helm-cuma-satu', 'Helm cuma satu',
    'Pulang sekolah, temanmu menawarkan boncengan sampai rumah. Masalahnya, helm cuma satu dan dia yang pakai. "Dekat kok, aman," katanya.',
    '{"helmet":0.6,"peer_pressure":0.4}', 'Tidak ada helm, tidak naik. Jarak dekat tetap bisa berbahaya.', 'basic',
    '[
      {"text":"Ikut saja, toh cuma dekat.","label":"risky","risk":{"helmet":1,"peer_pressure":0.8},
       "short":"Kepala jadi bagian yang paling tidak terlindungi.",
       "long":"Banyak kecelakaan terjadi di jalan dekat rumah yang terasa familiar. Tanpa helm, benturan ringan pun bisa berakibat serius pada kepala.",
       "legal":"UU No. 22/2009 Pasal 106 ayat (8): pengemudi dan penumpang sepeda motor wajib memakai helm SNI.","tags":["helmet","peer_pressure"]},
      {"text":"Tolak halus, lalu cari tumpangan lain atau pinjam helm.","label":"safe","risk":{"helmet":0,"peer_pressure":0},
       "short":"Kamu tetap bisa pulang tanpa mempertaruhkan kepala.",
       "long":"Menolak dengan sopan dan menawarkan solusi (pinjam helm, ojek, angkot, atau dijemput) menjaga pertemanan sekaligus keselamatanmu.",
       "tags":["helmet","safe_alternative"]},
      {"text":"Ikut, tapi minta temanmu pelan-pelan.","label":"mixed","risk":{"helmet":0.7,"peer_pressure":0.5},
       "short":"Pelan membantu, tapi kepalamu tetap tanpa pelindung.",
       "long":"Kecepatan rendah mengurangi risiko, tapi kamu tidak bisa mengendalikan kendaraan lain di sekitarmu. Helm tetap pelindung utama.",
       "tags":["helmet"]}
    ]'::jsonb);

  -- 2. Belum punya SIM
  v_versions := v_versions || pg_temp.seed_scenario(
    'belum-punya-sim', 'Belum punya SIM',
    'Kakakmu sedang sibuk dan motor di rumah menganggur. Teman-teman mengajak nongkrong dan bilang, "Bawa motor sendiri aja, jarang ada razia."',
    '{"legal_compliance":0.6,"peer_pressure":0.4}', 'Belum siap secara aturan = belum siap sepenuhnya. Pilih cara lain dulu.', 'basic',
    '[
      {"text":"Bawa motor sendiri, lewat jalan tikus.","label":"risky","risk":{"legal_compliance":1,"peer_pressure":0.8},
       "short":"Masalahnya bukan razia, tapi kesiapan berkendara.",
       "long":"SIM menandakan kamu sudah lolos uji pengetahuan dan keterampilan. Jalan tikus sering sempit dan minim penerangan, jadi justru menambah risiko.",
       "legal":"UU No. 22/2009 Pasal 77 ayat (1): setiap pengemudi kendaraan bermotor wajib memiliki SIM.","tags":["legal_compliance","peer_pressure"]},
      {"text":"Nebeng teman yang sudah punya SIM dan helm lengkap.","label":"safe","risk":{"legal_compliance":0,"peer_pressure":0},
       "short":"Tetap ikut nongkrong tanpa melanggar aturan.",
       "long":"Nebeng dengan pengendara yang memenuhi syarat, atau naik transportasi umum, membuatmu tetap bisa ikut acara dengan aman.",
       "tags":["safe_alternative"]},
      {"text":"Tidak jadi ikut sama sekali.","label":"safe","risk":{"legal_compliance":0,"peer_pressure":0.1},
       "short":"Keputusan aman, walau mungkin terasa rugi.",
       "long":"Menolak ajakan itu tidak mudah. Lain kali, coba juga cari alternatif agar kamu tetap bisa ikut tanpa berkendara sendiri.",
       "tags":["peer_pressure"]}
    ]'::jsonb);

  -- 3. Balas chat saat berkendara
  v_versions := v_versions || pg_temp.seed_scenario(
    'balas-chat', 'Balas chat saat berkendara',
    'Kamu sedang mengendarai motor. HP di saku bergetar berkali-kali. Sepertinya grup kelas membahas tugas yang dikumpulkan malam ini.',
    '{"phone_distraction":1}', 'Chat bisa menunggu. Menepi dulu kalau benar-benar penting.', 'basic',
    '[
      {"text":"Cek sebentar di lampu merah.","label":"mixed","risk":{"phone_distraction":0.6},
       "short":"Di lampu merah pun perhatianmu tetap dibutuhkan.",
       "long":"Saat membaca chat, kamu bisa terlambat sadar lampu sudah hijau atau ada kendaraan yang menerobos. Lebih aman menepi di tempat yang aman.",
       "tags":["phone_distraction"]},
      {"text":"Balas cepat sambil jalan pelan.","label":"risky","risk":{"phone_distraction":1},
       "short":"Satu tangan dan mata di layar = kendali berkurang drastis.",
       "long":"Hanya dua detik menatap layar, motor sudah bergerak beberapa meter tanpa kamu awasi. Kecepatan pelan tidak menghilangkan risiko itu.",
       "legal":"UU No. 22/2009 Pasal 106 ayat (1): pengemudi wajib mengemudi dengan wajar dan penuh konsentrasi.","tags":["phone_distraction"]},
      {"text":"Abaikan dulu, cek setelah sampai atau menepi aman.","label":"safe","risk":{"phone_distraction":0},
       "short":"Tugas tetap bisa dibahas, fokusmu tetap di jalan.",
       "long":"Kalau khawatir penting, menepilah di tempat aman lalu cek. Mode senyap atau Jangan Ganggu saat berkendara juga membantu.",
       "tags":["phone_distraction","habit"]}
    ]'::jsonb);

  -- 4. Terlambat masuk kelas
  v_versions := v_versions || pg_temp.seed_scenario(
    'terlambat-kelas', 'Terlambat masuk kelas',
    'Jam 06.52, gerbang sekolah ditutup jam 07.00. Perjalanan normal 12 menit. Kamu sudah di atas motor.',
    '{"urgency":0.5,"speed":0.5}', 'Telat beberapa menit bisa dijelaskan. Kecelakaan tidak bisa diulang.', 'basic',
    '[
      {"text":"Gas lebih kencang dan salip-salip biar sempat.","label":"risky","risk":{"urgency":1,"speed":1},
       "short":"Waktu yang dihemat kecil, risikonya besar.",
       "long":"Mempercepat di jalan ramai pagi hari biasanya hanya menghemat 1–3 menit, tapi jarak pengereman dan peluang salah perhitungan naik tajam.",
       "tags":["speed","urgency"]},
      {"text":"Jalan dengan kecepatan wajar, kabari guru/wali kelas.","label":"safe","risk":{"urgency":0,"speed":0},
       "short":"Terlambat sedikit, tapi sampai dengan selamat.",
       "long":"Memberi kabar menunjukkan tanggung jawab. Besok, coba berangkat 10 menit lebih awal supaya tidak terjebak situasi ini lagi.",
       "tags":["urgency","planning"]},
      {"text":"Ambil jalan pintas yang lebih sepi tapi rusak.","label":"mixed","risk":{"urgency":0.5,"speed":0.3,"hazard_awareness":0.4},
       "short":"Belum tentu lebih cepat, dan ada bahaya baru.",
       "long":"Jalan rusak dan sepi punya risiko tersendiri: lubang, kerikil, dan minim bantuan. Kalau terburu-buru, kamu cenderung kurang waspada.",
       "tags":["hazard_awareness"]}
    ]'::jsonb);

  -- 5. Bonceng bertiga
  v_versions := v_versions || pg_temp.seed_scenario(
    'bonceng-bertiga', 'Bonceng bertiga',
    'Hujan baru reda. Kamu dan temanmu mau pulang naik motor, lalu satu teman lagi minta ikut karena tidak ada kendaraan. "Bertiga aja, muat kok."',
    '{"peer_pressure":0.5,"passenger_safety":0.5}', 'Motor didesain untuk dua orang. Bantu teman dengan cara lain.', 'basic',
    '[
      {"text":"Ya sudah, bertiga pelan-pelan.","label":"risky","risk":{"peer_pressure":0.9,"passenger_safety":1},
       "short":"Beban berlebih membuat rem dan keseimbangan tidak normal.",
       "long":"Dengan tiga orang, jarak pengereman lebih panjang dan motor sulit dikendalikan, apalagi di jalan basah setelah hujan.",
       "legal":"UU No. 22/2009 Pasal 106 ayat (9): sepeda motor tanpa kereta samping dilarang membawa penumpang lebih dari satu orang.","tags":["passenger_safety","peer_pressure"]},
      {"text":"Antar satu per satu, atau bantu pesan ojek/angkot.","label":"safe","risk":{"peer_pressure":0,"passenger_safety":0},
       "short":"Temanmu tetap terbantu, semuanya tetap aman.",
       "long":"Butuh waktu lebih lama, tapi setiap orang duduk dengan aman dan memakai helm masing-masing.",
       "tags":["safe_alternative","passenger_safety"]},
      {"text":"Menolak dan langsung pulang berdua.","label":"mixed","risk":{"peer_pressure":0,"passenger_safety":0.1},
       "short":"Aman untukmu, tapi temanmu jadi tanpa solusi.",
       "long":"Menolak bonceng bertiga sudah tepat. Akan lebih baik lagi kalau kamu juga membantu temanmu mendapat cara pulang yang aman.",
       "tags":["safe_alternative"]}
    ]'::jsonb);

  -- 6. Lampu kuning
  v_versions := v_versions || pg_temp.seed_scenario(
    'lampu-kuning', 'Lampu kuning',
    'Kamu mendekati perempatan. Lampu berubah kuning saat jarakmu sekitar 20 meter dari garis henti. Di belakangmu ada mobil.',
    '{"impulsivity":0.6,"rule_compliance":0.4}', 'Kuning artinya bersiap berhenti, bukan tancap gas.', 'intermediate',
    '[
      {"text":"Tancap gas biar tidak kena merah.","label":"risky","risk":{"impulsivity":1,"rule_compliance":0.8},
       "short":"Kendaraan dari arah lain bisa sudah mulai jalan.",
       "long":"Mengejar lampu kuning adalah salah satu penyebab tabrakan di persimpangan. Pengendara dari arah lain sering langsung jalan begitu lampunya hijau.",
       "tags":["impulsivity","rule_compliance"]},
      {"text":"Kurangi kecepatan dan berhenti mulus sebelum garis.","label":"safe","risk":{"impulsivity":0,"rule_compliance":0},
       "short":"Keputusan tenang yang memberi ruang aman untuk semua.",
       "long":"Dengan jarak 20 meter, umumnya masih cukup untuk berhenti bertahap. Pengereman halus juga memberi sinyal jelas ke mobil di belakangmu.",
       "tags":["rule_compliance"]},
      {"text":"Rem mendadak sekuatnya.","label":"mixed","risk":{"impulsivity":0.4,"hazard_awareness":0.5},
       "short":"Niatnya berhenti sudah tepat, caranya bisa lebih aman.",
       "long":"Rem mendadak bisa membuat motor tergelincir atau ditabrak dari belakang. Lebih baik antisipasi lebih awal saat mendekati persimpangan.",
       "tags":["hazard_awareness"]}
    ]'::jsonb);

  -- 7. Jalan basah
  v_versions := v_versions || pg_temp.seed_scenario(
    'jalan-basah', 'Jalan basah',
    'Gerimis turun sejak sore. Jalan menurun di depanmu tampak mengkilap dan ada genangan di beberapa titik.',
    '{"hazard_awareness":0.6,"speed":0.4}', 'Jalan basah = jarak aman dua kali lipat.', 'basic',
    '[
      {"text":"Tetap di kecepatan biasa, toh sudah hafal jalannya.","label":"risky","risk":{"hazard_awareness":1,"speed":0.9},
       "short":"Hafal jalan tidak mengubah daya cengkeram ban.",
       "long":"Saat basah, ban lebih mudah selip dan jarak pengereman bertambah. Turunan membuat efek ini makin terasa.",
       "tags":["speed","hazard_awareness"]},
      {"text":"Pelankan, jaga jarak lebih jauh, hindari genangan dan marka jalan.","label":"safe","risk":{"hazard_awareness":0,"speed":0},
       "short":"Kamu menyesuaikan diri dengan kondisi jalan.",
       "long":"Marka jalan dan tutup gorong-gorong licin saat basah. Kecepatan rendah dan jarak aman memberi waktu untuk bereaksi.",
       "tags":["hazard_awareness"]},
      {"text":"Pelankan, tapi tetap menerobos genangan.","label":"mixed","risk":{"hazard_awareness":0.5,"speed":0.1},
       "short":"Sudah lebih aman, tapi genangan bisa menyembunyikan lubang.",
       "long":"Kamu tidak tahu kedalaman genangan atau apa yang ada di bawahnya. Kalau bisa, lewati jalur yang terlihat jelas.",
       "tags":["hazard_awareness"]}
    ]'::jsonb);

  -- 8. Mengantuk
  v_versions := v_versions || pg_temp.seed_scenario(
    'mengantuk', 'Mengantuk',
    'Kamu begadang mengerjakan tugas. Di perjalanan pulang, mata terasa berat dan kamu beberapa kali menguap.',
    '{"fatigue":1}', 'Kantuk tidak bisa dilawan dengan tekad. Istirahat dulu.', 'basic',
    '[
      {"text":"Lanjut saja, tinggal 10 menit lagi.","label":"risky","risk":{"fatigue":1},
       "short":"Tertidur sesaat (microsleep) bisa terjadi tanpa kamu sadari.",
       "long":"Saat sangat mengantuk, otak bisa \"mati\" beberapa detik. Di atas motor, beberapa detik itu cukup untuk keluar jalur.",
       "tags":["fatigue"]},
      {"text":"Menepi di tempat aman, istirahat 15–20 menit atau minta dijemput.","label":"safe","risk":{"fatigue":0},
       "short":"Istirahat singkat jauh lebih berharga daripada sampai lebih cepat.",
       "long":"Tidur singkat, cuci muka, atau minta dijemput adalah cara yang benar-benar mengurangi kantuk. Kamu juga bisa merencanakan tidur cukup sebelum berkendara.",
       "tags":["fatigue","safe_alternative"]},
      {"text":"Nyalakan musik keras supaya melek.","label":"mixed","risk":{"fatigue":0.7,"attention":0.4},
       "short":"Musik tidak menghilangkan kantuk, hanya menutupinya sebentar.",
       "long":"Trik seperti musik keras atau membuka kaca helm terasa membantu, tapi reaksi tubuhmu tetap lambat. Menepi tetap pilihan paling aman.",
       "tags":["fatigue"]}
    ]'::jsonb);

  -- 9. Earphone keras
  v_versions := v_versions || pg_temp.seed_scenario(
    'earphone-keras', 'Earphone keras',
    'Playlist favoritmu baru rilis. Kamu ingin mendengarkannya dengan earphone selama perjalanan naik motor.',
    '{"attention":1}', 'Telinga adalah "kaca spion" tambahanmu. Biarkan tetap bekerja.', 'basic',
    '[
      {"text":"Pakai dua earphone, volume kencang.","label":"risky","risk":{"attention":1},
       "short":"Klakson dan sirene bisa tidak terdengar.",
       "long":"Suara lingkungan membantumu sadar ada kendaraan mendekat dari belakang atau samping sebelum terlihat di spion.",
       "tags":["attention"]},
      {"text":"Dengarkan nanti setelah sampai.","label":"safe","risk":{"attention":0},
       "short":"Lagunya tetap ada, perhatianmu tetap penuh.",
       "long":"Menunda hiburan sampai tiba adalah kebiasaan kecil yang menjaga fokus di jalan.",
       "tags":["attention","habit"]},
      {"text":"Satu earphone saja, volume pelan.","label":"mixed","risk":{"attention":0.5},
       "short":"Lebih baik, tapi perhatianmu tetap terbagi.",
       "long":"Meski masih bisa mendengar sekitar, otak tetap memproses musik. Di jalan ramai, perhatian penuh lebih aman.",
       "tags":["attention"]}
    ]'::jsonb);

  -- 10. Teman menantang
  v_versions := v_versions || pg_temp.seed_scenario(
    'teman-menantang', 'Teman menantang',
    'Di jalan yang sepi, temanmu menyejajarkan motornya dan berteriak, "Adu cepat sampai lampu merah depan! Yang kalah traktir!"',
    '{"peer_pressure":0.6,"speed":0.4}', 'Menolak tantangan bukan kalah. Itu keputusan.', 'intermediate',
    '[
      {"text":"Terima tantangannya, jalannya sepi.","label":"risky","risk":{"peer_pressure":1,"speed":1},
       "short":"Jalan sepi bisa berubah dalam sekejap.",
       "long":"Kendaraan dari gang, pejalan kaki, atau lubang bisa muncul tiba-tiba. Di kecepatan tinggi, waktu bereaksi hampir habis.",
       "tags":["peer_pressure","speed"]},
      {"text":"Tolak sambil bercanda: \"Traktir aja langsung, aku santai.\"","label":"safe","risk":{"peer_pressure":0,"speed":0},
       "short":"Menolak dengan santai menjaga suasana tetap asyik.",
       "long":"Humor adalah cara efektif menolak tekanan teman tanpa membuat suasana canggung.",
       "tags":["peer_pressure"]},
      {"text":"Ikut sebentar lalu mengalah di tengah jalan.","label":"mixed","risk":{"peer_pressure":0.7,"speed":0.6},
       "short":"Keputusan mundur itu bagus, tapi risiko sudah sempat diambil.",
       "long":"Bagian paling berbahaya adalah akselerasi awal. Lebih aman menolak sejak awal.",
       "tags":["peer_pressure"]}
    ]'::jsonb);

  insert into public.assessment_set_items (assessment_set_id, scenario_version_id, position)
  select v_set, v, ord from unnest(v_versions) with ordinality as t(v, ord);

  raise notice 'Seed baseline-demo selesai: % scenario.', array_length(v_versions, 1);
end $$;
