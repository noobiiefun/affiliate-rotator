-- ============================================================
-- MIGRATION v4 — Spotlight, Kupon, Flash Sale Timer
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Tambah kolom spotlight ke rotator_items
alter table rotator_items
  add column if not exists spotlight_duration int default null,
  -- durasi dalam detik (null = pakai interval normal rotator)
  -- contoh: 900 = 15 menit spotlight
  add column if not exists spotlight_active boolean default false;
  -- true = sedang dalam mode spotlight

-- 2. Tambah kolom kupon & flash sale ke products
alter table products
  add column if not exists coupon_code    text default null,
  add column if not exists coupon_label   text default null,
  -- label kupon, misal "DISKON20" atau "GRATIS ONGKIR"
  add column if not exists sale_ends_at   timestamptz default null,
  -- waktu berakhirnya flash sale
  add column if not exists sale_label     text default null;
  -- label sale, misal "Flash Sale!" atau "Limited Time"

-- 3. Tabel untuk sound alerts (opsional, untuk OBS)
create table if not exists spotlight_events (
  id          uuid primary key default uuid_generate_v4(),
  rotator_id  uuid references rotators(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  started_at  timestamptz default now(),
  ends_at     timestamptz not null,
  is_active   boolean default true
);

-- RLS untuk spotlight_events
alter table spotlight_events enable row level security;

create policy "Public read spotlight events"
  on spotlight_events for select using (true);

create policy "Anon full access spotlight"
  on spotlight_events for all to anon
  using (true) with check (true);

create policy "Auth full access spotlight"
  on spotlight_events for all
  using (auth.role() = 'authenticated');

-- Index
create index if not exists idx_spotlight_rotator
  on spotlight_events(rotator_id, is_active);

select 'Migration v4 selesai! ✅' as status;
