-- ============================================================
-- MIGRATION v1 → v2
-- Jalankan ini jika sudah ada data di database sebelumnya
-- (Jika fresh install, cukup jalankan schema.sql saja)
-- ============================================================

-- 1. Buat tabel rotator_groups
create table if not exists rotator_groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text default '#8b5cf6',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. Tambah kolom baru ke rotators
alter table rotators add column if not exists slug text unique;
alter table rotators add column if not exists group_id uuid references rotator_groups(id) on delete set null;
alter table rotators add column if not exists theme_config jsonb default '{
  "bg_color": "#0f0f23",
  "accent_color": "#8b5cf6",
  "text_color": "#ffffff",
  "size": "medium",
  "position": "bottom-left",
  "logo_url": null,
  "show_price": true,
  "show_marketplace": true,
  "border_radius": 20,
  "opacity": 0.95
}'::jsonb;

-- 3. Generate slug dari nama untuk rotator yang sudah ada
update rotators
set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
where slug is null;

-- 4. Pastikan slug tidak null (set not null setelah diisi)
alter table rotators alter column slug set not null;

-- 5. Indexes baru
create index if not exists idx_rotators_slug  on rotators(slug);
create index if not exists idx_rotators_group on rotators(group_id);

-- 6. Trigger untuk groups
create trigger if not exists trg_groups_updated_at
  before update on rotator_groups for each row execute function update_updated_at();

-- 7. RLS untuk rotator_groups
alter table rotator_groups enable row level security;
create policy "Public read groups"
  on rotator_groups for select using (true);
create policy "Anon full access groups"
  on rotator_groups for all to anon using (true) with check (true);
create policy "Auth full access groups"
  on rotator_groups for all using (auth.role() = 'authenticated');

select 'Migration v2 selesai!' as status;
