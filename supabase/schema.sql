-- ============================================================
-- AFFILIATE ROTATOR - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: products
-- Menyimpan semua produk affiliate
-- ============================================================
create table products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       numeric(15, 0),           -- harga dalam rupiah
  image_url   text,
  affiliate_url text not null,          -- link affiliate (universal)
  marketplace text not null default 'other',
  -- 'tokopedia' | 'shopee' | 'lazada' | 'tiktok' | 'blibli' | 'other'
  slug        text unique not null,     -- untuk URL: /p/nama-produk
  is_active   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE: rotators
-- Satu rotator = satu set produk yang berputar di OBS
-- ============================================================
create table rotators (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  interval_sec  int default 10,         -- durasi tiap produk tampil (detik)
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE: rotator_items
-- Produk-produk yang masuk dalam rotator (many-to-many)
-- ============================================================
create table rotator_items (
  id          uuid primary key default uuid_generate_v4(),
  rotator_id  uuid references rotators(id) on delete cascade,
  product_id  uuid references products(id) on delete cascade,
  position    int default 0,            -- urutan tampil
  is_active   boolean default true,
  created_at  timestamptz default now(),
  unique(rotator_id, product_id)
);

-- ============================================================
-- TABLE: click_events
-- Tracking setiap klik pada produk (analytics)
-- ============================================================
create table click_events (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references products(id) on delete set null,
  rotator_id  uuid references rotators(id) on delete set null,
  source      text default 'qr',        -- 'qr' | 'direct' | 'share'
  ip_hash     text,                     -- hash IP untuk privacy
  user_agent  text,
  clicked_at  timestamptz default now()
);

-- ============================================================
-- INDEXES untuk performa query
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

-- Public: bisa baca produk aktif (untuk landing page)
create policy "Public can read active products"
  on products for select
  using (is_active = true);

-- Public: bisa baca rotator aktif (untuk OBS overlay)
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

-- ============================================================
-- SAMPLE DATA (opsional, untuk testing)
-- ============================================================
insert into products (name, description, price, image_url, affiliate_url, marketplace, slug) values
(
  'Contoh Produk Shopee',
  'Deskripsi produk pertama untuk testing rotator',
  150000,
  'https://placehold.co/400x400/FF6B35/white?text=Produk+1',
  'https://shopee.co.id/your-affiliate-link',
  'shopee',
  'contoh-produk-shopee'
),
(
  'Contoh Produk Tokopedia',
  'Deskripsi produk kedua untuk testing rotator',
  250000,
  'https://placehold.co/400x400/42B549/white?text=Produk+2',
  'https://tokopedia.com/your-affiliate-link',
  'tokopedia',
  'contoh-produk-tokopedia'
);

insert into rotators (name, description, interval_sec) values
(
  'Rotator Utama',
  'Rotator default untuk livestream',
  10
);
