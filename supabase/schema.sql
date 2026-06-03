-- ============================================================
-- AFFILIATE ROTATOR - Supabase Schema v2
-- PERUBAHAN dari v1:
--   - rotators: tambah slug (URL custom), theme_config (JSON tema),
--               group_id (grup rotator)
--   - rotator_groups: tabel baru untuk grup rotator
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: products
-- ============================================================
create table products (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  description   text,
  price         numeric(15, 0),
  image_url     text,
  affiliate_url text not null,
  marketplace   text not null default 'other',
  slug          text unique not null,
  is_active     boolean default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ============================================================
-- TABLE: rotator_groups
-- Grup untuk mengorganisir rotator (misal: Flash Sale, Elektronik)
-- ============================================================
create table rotator_groups (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  color       text default '#8b5cf6',   -- warna label grup di dashboard
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ============================================================
-- TABLE: rotators
-- ============================================================
create table rotators (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique not null,    -- URL custom: /obs/[slug]
  description  text,
  group_id     uuid references rotator_groups(id) on delete set null,
  interval_sec int default 10,
  is_active    boolean default true,

  -- Tema overlay (JSON)
  -- Contoh: { "bg_color": "#0f0f23", "accent_color": "#8b5cf6",
  --           "text_color": "#ffffff", "size": "medium",
  --           "position": "bottom-left", "logo_url": null,
  --           "show_price": true, "show_marketplace": true,
  --           "border_radius": 20, "opacity": 0.95 }
  theme_config  jsonb default '{
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
  }'::jsonb,

  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
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
-- TABLE: storage untuk logo/watermark
-- (menggunakan Supabase Storage bucket "logos")
-- ============================================================

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_products_slug           on products(slug);
create index idx_products_is_active      on products(is_active);
create index idx_rotators_slug           on rotators(slug);
create index idx_rotators_group          on rotators(group_id);
create index idx_rotator_items_rotator   on rotator_items(rotator_id);
create index idx_rotator_items_position  on rotator_items(rotator_id, position);
create index idx_click_events_product    on click_events(product_id);
create index idx_click_events_clicked_at on click_events(clicked_at);

-- ============================================================
-- AUTO update_at triggers
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger trg_products_updated_at
  before update on products for each row execute function update_updated_at();
create trigger trg_rotators_updated_at
  before update on rotators for each row execute function update_updated_at();
create trigger trg_groups_updated_at
  before update on rotator_groups for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table products        enable row level security;
alter table rotator_groups  enable row level security;
alter table rotators        enable row level security;
alter table rotator_items   enable row level security;
alter table click_events    enable row level security;

-- Public read (landing page & OBS)
create policy "Public read active products"
  on products for select using (is_active = true);
create policy "Public read groups"
  on rotator_groups for select using (true);
create policy "Public read active rotators"
  on rotators for select using (is_active = true);
create policy "Public read active rotator items"
  on rotator_items for select using (is_active = true);
create policy "Public insert click events"
  on click_events for insert with check (true);

-- Anon full access (development - diganti login di Phase 6)
create policy "Anon full access products"
  on products for all to anon using (true) with check (true);
create policy "Anon full access groups"
  on rotator_groups for all to anon using (true) with check (true);
create policy "Anon full access rotators"
  on rotators for all to anon using (true) with check (true);
create policy "Anon full access rotator_items"
  on rotator_items for all to anon using (true) with check (true);

-- Authenticated full access
create policy "Auth full access products"
  on products for all using (auth.role() = 'authenticated');
create policy "Auth full access groups"
  on rotator_groups for all using (auth.role() = 'authenticated');
create policy "Auth full access rotators"
  on rotators for all using (auth.role() = 'authenticated');
create policy "Auth full access rotator_items"
  on rotator_items for all using (auth.role() = 'authenticated');
create policy "Auth read click events"
  on click_events for select using (auth.role() = 'authenticated');
