-- ============================================================
-- AFFILIATE ROTATOR - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: products
-- ============================================================
create table products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(15, 0),
  image_url   text,
  affiliate_url text not null,
  marketplace text not null default 'other',
  slug        text unique not null,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE: rotators
-- ============================================================
create table rotators (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  interval_sec  int default 10,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE: rotator_items
-- ============================================================
create table rotator_items (
  id          uuid primary key default uuid_generate_v4(),
  rotator_id  uuid references rotators(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  position    int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now(),
  unique(rotator_id, product_id)
);

-- ============================================================
-- TABLE: click_events
-- ============================================================
create table click_events (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references products(id) on delete set null,
  rotator_id  uuid references rotators(id) on delete set null,
  source      text default 'qr',
  ip_hash     text,
  user_agent  text,
  clicked_at  timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_products_slug on products(slug);
create index idx_products_is_active on products(is_active);
create index idx_rotator_items_rotator on rotator_items(rotator_id);
create index idx_rotator_items_position on rotator_items(rotator_id, position);
create index idx_click_events_product on click_events(product_id);
create index idx_click_events_clicked_at on click_events(clicked_at);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated_at
  before update on products
  for each row execute function update_updated_at();

create trigger trg_rotators_updated_at
  before update on rotators
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table products      enable row level security;
alter table rotators      enable row level security;
alter table rotator_items enable row level security;
alter table click_events  enable row level security;

-- Public: bisa baca produk & rotator aktif (untuk landing page & OBS)
create policy "Public can read active products"
  on products for select
  using (is_active = true);

create policy "Public can read active rotators"
  on rotators for select
  using (is_active = true);

create policy "Public can read active rotator items"
  on rotator_items for select
  using (is_active = true);

-- Public: bisa insert click events (tracking)
create policy "Public can insert click events"
  on click_events for insert
  with check (true);

-- Anon (dashboard tanpa login): full access semua tabel
-- Catatan: untuk development. Akan diganti sistem login di Phase 6.
create policy "Anon full access products"
  on products for all
  to anon
  using (true)
  with check (true);

create policy "Anon full access rotators"
  on rotators for all
  to anon
  using (true)
  with check (true);

create policy "Anon full access rotator_items"
  on rotator_items for all
  to anon
  using (true)
  with check (true);

-- Authenticated (admin): full access semua tabel
create policy "Authenticated full access products"
  on products for all
  using (auth.role() = 'authenticated');

create policy "Authenticated full access rotators"
  on rotators for all
  using (auth.role() = 'authenticated');

create policy "Authenticated full access rotator_items"
  on rotator_items for all
  using (auth.role() = 'authenticated');

create policy "Authenticated can read click events"
  on click_events for select
  using (auth.role() = 'authenticated');
